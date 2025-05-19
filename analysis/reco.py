import pandas as pd
import numpy as np
import ccobra
import json
import os
from matplotlib import pyplot as plt
import seaborn as sns
from itertools import chain, combinations
import domain_info as di

data_path = os.path.join("..", "data")

# Returns the powerset of a list as an iterator
def powerset(iterable):
    s = list(iterable)
    return chain.from_iterable(combinations(s, r) for r in range(len(s)+1))

# Load the syllog data and build the target matrices
syllogs_df = pd.read_csv(os.path.join(data_path, "syllog_data.csv"))
selected_syl = ccobra.syllogistic.SYLLOGISMS
syllog_participants = {}
syllog_confidences = {}
for vp, p_df in syllogs_df.groupby("id"):
    responses = []
    for syl_idx, syl in enumerate(selected_syl):
        resps = p_df[p_df["task"] == syl]["response"]
        conf = p_df[p_df["task"] == syl]["confidence"]
        if resps.empty:
            responses = []
            continue
        
        resps = json.loads(resps.values[0])
        conf = conf.values[0]
        if vp not in syllog_confidences:
            syllog_confidences[vp] = {}
        syllog_confidences[vp][syl_idx] = conf
        
        responses.append(resps)

    if len(responses) == len(selected_syl):
        syllog_participants[vp] = responses

# -------------------------------------------------------------------------
# Recommender
# -------------------------------------------------------------------------
def get_mfp(df):
    mfp = {}
    
    num_responses_without_nvc = []
    num_responses = []

    for _, row in df.iterrows():
        responses = row["response"]
        confidence = row["confidence"]

        responses = eval(responses)
        num_responses.append(len(responses))
        if "nvc" not in responses:
            num_responses_without_nvc.append(len(responses))
        else:
            responses = ["NVC"]
        
        syl = row["task"]
        
        if syl not in mfp:
            mfp[syl] = []
        mfp[syl].append(sorted(responses))
    
    mfp_res = {}
    result = []
    for key in selected_syl:
        value = mfp[key]
        value_tuples = [tuple(x) for x in value]
        val_array = np.empty(len(value_tuples), dtype=tuple)
        val_array[:] = value_tuples
        numbers = np.unique(val_array, return_counts=True)
        numbers = dict(zip(*np.unique(val_array, return_counts=True)))
        numbers = sorted(numbers.items(), key=lambda x: x[1], reverse=True)

        result.append([numbers[0]])
        mfp_res[key] = [numbers[0]]
        if len(numbers) > 1 and numbers[0][1] == numbers[1][1]:
            mfp_res[key].append(numbers[1])
            result[-1].append(numbers[1])
    return result

def mfa_prediction(mfa_predictions):
    accuracies = []
    for vp in di.shared_vp:
        truth = syllog_participants[vp]

        accuracy = []
        for i in range(len(selected_syl)):
            t = set(truth[i])
            mfp_prediction = mfa_predictions[i]
            score = 0
            for mfp in mfp_prediction:
                p = set([x if x != "NVC" else "nvc" for x in mfp[0]])

                score += (len(t.intersection(p)) / len(t.union(p))) / len(mfp_prediction)

            accuracy.append(score)
        accuracies.append(np.mean(accuracy))
    
    return accuracies

def similarity(v1, v2):
    v1 = np.array(v1)
    v2 = np.array(v2)
    return (1 - np.sqrt(np.mean((v1-v2)**2)))**2

def recommend(participant, profile_info, random_p=False, k=100, threshold=0.25, use_confidence=False):
    if random_p:
        others = {x: y for x, y in syllog_participants.items() if x != participant}
        others_vec = [y for x, y in others.items()]
        rnd = np.random.randint(len(others_vec))
        return others_vec[rnd]

    if participant not in profile_info:
        return recommend(participant, None, random_p=True)
    target = profile_info[participant]
    preds = []
    sims = []
    for vp_id in profile_info.keys():
        if vp_id == participant:
            continue
        profile = profile_info[vp_id]
        sim = similarity(target, profile)
        sims.append((sim, vp_id))
    
    sims.sort(key=lambda x: x[0], reverse=True)
    sims = sims[:k]
    
    preds = []
    for syl_idx in range(len(selected_syl)):
        resps = np.zeros((8))
        nvc = 0
        total_sim = 0
        for sim, neighbour in sims:
            if use_confidence:
                conf = syllog_confidences[neighbour][syl_idx]
                if conf == "guessed":
                    continue
            total_sim += sim
            pattern = syllog_participants[neighbour][syl_idx]
            for resp in pattern:
                if resp == "nvc":
                    nvc += sim
                else:
                    resps[ccobra.syllogistic.RESPONSES.index(resp)] += sim
        resps /= total_sim
        nvc /= total_sim

        if nvc > np.max(resps):
            preds.append(["nvc"])
        else:
            preds.append([ccobra.syllogistic.RESPONSES[i] for i in range(8) if resps[i] >= threshold])
    return preds

def prediction(profile_info, k=48):
    accuracies = []
    for vp in di.shared_vp:
        target = profile_info[vp]
        sims = []
        for other_id in profile_info.keys():
            if other_id == vp:
                continue
            profile = profile_info[other_id]
            sim = similarity(target, profile)
            sims.append((sim, other_id))
        sims.sort(key=lambda x: x[0], reverse=True)
        sims = sims[:k]
        neighbours = [y for x, y in sims]
        mfa_predictions = get_mfp(syllogs_df[syllogs_df["id"].isin(neighbours)])

        truth = syllog_participants[vp]

        accuracy = 0
        for i in range(len(selected_syl)):
            t = set(truth[i])
            mfp_prediction = mfa_predictions[i]
            score = 0
            for mfp in mfp_prediction:
                p = set([x if x != "NVC" else "nvc" for x in mfp[0]])

                score += (len(t.intersection(p)) / len(t.union(p))) / len(mfp_prediction)

            accuracy += score / len(selected_syl)
        accuracies.append(accuracy)
    return np.mean(accuracies)

def predict_rnd():
    accuracies = []
    for vp in di.shared_vp:
        others = {x: y for x, y in syllog_participants.items() if x != vp}
        others_vec = [y for x, y in others.items()]
        sub_accs = []
        for o_i in range(len(others)):
            prediction = others_vec[o_i]
            truth = syllog_participants[vp]
            accuracy = []
            for i in range(len(selected_syl)):
                t = set(truth[i])
                p = set(prediction[i])

                # Jaccard
                score = len(t.intersection(p)) / len(t.union(p))

                accuracy.append(score)
            sub_accs.append(np.mean(accuracy))
        accuracies.append(np.mean(sub_accs))
    return accuracies

def prediction2(profile_info, voting=True):
    accuracies = []

    for vp in di.shared_vp:
        
        prediction = recommend(vp, profile_info)
        truth = syllog_participants[vp]
        accuracy = []
        for i in range(len(selected_syl)):
            t = set(truth[i])
            p = set(prediction[i])
            
            # MAE: Instead of Jaccard, this could be used as target
            #score = 0
            #for resp in ccobra.syllogistic.RESPONSES:   
            #    if (resp in t) and (resp in p):
            #        score += 1
            #    elif (resp not in t) and (resp not in p):
            #        score += 1
            #score /= 9
            
            # Jaccard
            score = len(t.intersection(p)) / len(t.union(p))
            accuracy.append(score)
        accuracies.append(np.mean(accuracy))
    
    return accuracies

results = []

# -------------------------------------------------------------------------
# Baselines
# -------------------------------------------------------------------------
# Random VP
print("Random VP baseline...")
results.append(("Random VP", predict_rnd(), "Baseline"))

# User by correctness
# Note that this was improved over the version in the paper:
# Initially, the MAE was used, but it is not adapted Jaccard
syl_corr_jacc = {}
for vp, df in di.syl_corr_df.groupby("id"):
    if vp not in syllog_participants:
        continue
    syl_corr_jacc[vp] = [df["jacc"].mean()]
print("Syllog Correctness baseline...")
results.append(("Syllog Correctness", prediction2(syl_corr_jacc), "Baseline"))

# MFA baseline
mfa_predictions = get_mfp(syllogs_df)
#mfa_predictions = [mpfs[x] for x in selected_syl]

print("MFP baseline...")
results.append(("Most Freq. Pattern", mfa_prediction(mfa_predictions), "Baseline"))

# -------------------------------------------------------------------------
#  Single Feature Runs
# -------------------------------------------------------------------------
feats_to_test = {
    "Corsi": di.corsi_info,
    "Mental Rotation": di.mental_into,
    "Conditionals": di.cnd_corr,
    "Conditionals (NVC)": di.cnd_nvc,
    "Spatials (Memory)": di.spatial_memory_corr,
    "Spatials (Visible)": di.spatial_shown_corr,
    "Spatials (NVC)": di.spat_nvc,
    "Carddir NVC": di.carddir_nvc,
    "Some implies All": di.syl_some_not,
    "CRT": di.crt_info,
    "NFC": di.nfc_info,
    "Wason": di.wason_info,
    "Verbal Substitution": di.verbal_info,
    "Spat. Arr (Verify)": di.arrange_correct,
    "Spat. Arr (Arrange)": di.arrange_model_correct,
    "Spat. Arr (PMM)": di.arrange_pmm
}

for feat, info in feats_to_test.items():
    print(feat, "predictions...")
    results.append((feat, prediction2(info), "Single Feature"))

# -------------------------------------------------------------------------
# Combinations
# -------------------------------------------------------------------------

# All Metrics that test correctness
cogn_perf = {}
cogn_perf_feats_names = [
    "Corsi", "Mental Rotation", "Conditionals", "Spatials (Memory)", "Spatials (Visible)", "CRT", "Wason", "Verbal Substitution", "Spat. Arr (Verify)", "Spat. Arr (Arrange)"
]
cogn_perf_feats = [feats_to_test[feat] for feat in cogn_perf_feats_names]
for vp in syllog_participants.keys():
    cogn_perf[vp] = []
    for feat in cogn_perf_feats:
        cogn_perf[vp].extend(feat.get(vp, [0]))

print("Cogn. Perf predictions...")
results.append(("Cogn. Perf", prediction2(cogn_perf), "Combined"))

# NVC related metrics
nvc_metrics = {}
nvc_metrics_feats_names = [
    "Spatials (NVC)", "Carddir NVC", "Conditionals (NVC)"
]
nvc_metrics_feats = [feats_to_test[feat] for feat in nvc_metrics_feats_names]
for vp in syllog_participants.keys():
    nvc_metrics[vp] = []
    for feat in nvc_metrics_feats:
        nvc_metrics[vp].extend(feat.get(vp, [0]))

print("NVC Propensity predictions...")
results.append(("NVC Propensity", prediction2(nvc_metrics), "Combined"))

# All metrics
all_metrics = {}
for vp in syllog_participants.keys():
    all_metrics[vp] = []
    for feat in feats_to_test.values():
        all_metrics[vp].extend(feat.get(vp, [0]))
print("Combined predictions...")
results.append(("All Features", prediction2(all_metrics), "Combined"))

# Features for combinations: comment the ones in/out to adjust it
# All features take a lot of time, since the recommender uses
# all combinations (full powerset)
feats_to_test_perm = {
    #"Corsi": di.corsi_info,
    #"Mental Rotation": di.mental_into,
    "Conditionals": di.cnd_corr,
    #"Conditionals (NVC)": di.cnd_nvc,
    #"Spatials (All)": di.spat_corr,
    #"Spatials (Memory)": di.spatial_memory_corr,
    "Spatials (Visible)": di.spatial_shown_corr,
    #"Spatials (NVC)": di.spat_nvc,
    #"Carddir NVC": di.carddir_nvc,
    #"Some implies All": di.syl_some_not,
    #"CRT": di.crt_info,
    #"NFC": di.nfc_info,
    #"Wason": di.wason_subset_info,
    "Verbal Substitution": di.verbal_info,
    #"Spat. Arr (Verify)": di.arrange_correct,
    #"Spat. Arr (Arrange)": di.arrange_model_correct
}
# Resulting optimum is:
#['Conditionals', 'Spatials (Visible)', 'Verbal Substitution']

all_feats = [info for feat, info in feats_to_test_perm.items()]
feat_names = [feat for feat, info in feats_to_test_perm.items()]
all_idx = [x for x in range(len(all_feats))]
permutations = powerset(all_idx)
best_acc = 0
best_accs = []
best_perms = []
for perm in permutations:
    features = {}
    for vp in syllog_participants.keys():
        features[vp] = []
        for feat in perm:
            features[vp].extend(all_feats[feat].get(vp, [0]))
    accs = prediction2(features)
    acc = np.mean(accs)
    print("Current perm", perm, acc, [feat_names[i] for i in perm])
    if acc >= best_acc:
        best_acc = acc
        best_perms = perm
        best_accs = accs
        print("    Current best", perm, acc, [feat_names[i] for i in perm])
results.append(("Optimized", best_accs, "Combined"))
print("Best perm", best_perms, [feat_names[i] for i in best_perms])

results_expanded = []
for result in results:
    x, y, z = result
    for idx, acc in enumerate(y):
        results_expanded.append({
            "id": idx,
            "feature": x,
            "accuracy": acc,
            "type": z
        })

# Collect and save recommender results
results_expanded.sort(key=lambda x: x["accuracy"])
results_df = pd.DataFrame(results_expanded)
print(results_df)
results_df.to_csv("reco_results.csv", index=False)

# Plot the barplot
order = results_df.groupby(["feature"])['accuracy'].aggregate("mean").reset_index().sort_values('accuracy')
fig, ax = plt.subplots(1, 1, figsize=(7, 6))
ax = sns.barplot(results_df, x="accuracy", y="feature", hue="type", palette={"Baseline": "C5", "Single Feature": "C0", "Combined": "C2"}, ax=ax, order=order["feature"])
ax.set_xlabel("Prediction Quality (Jaccard)")
ax.set_ylabel("")
plt.legend(frameon=False, ncols=3, loc="upper center", bbox_to_anchor=(0.5, 1.1))
plt.tight_layout()
plt.savefig("reco.pdf")
plt.show()