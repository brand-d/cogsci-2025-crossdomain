""" Create the heatmap visualization of the syllogistic patterns.
"""
import numpy as np
import ccobra
from matplotlib import pyplot as plt
from matplotlib.patches import Ellipse
import seaborn as sns
import ccobra
import domain_info as di

def split_participants(feature, equal=True):
    all_parts = [(x,y[0]) for x,y in feature.items()]
    all_parts.sort(key=lambda x: x[1])
    all_parts = [(x, y) for x,y in all_parts if x in di.shared_vp]
    values = [x[0] for x in feature.values()]

    if equal:
        split = int(len(all_parts) / 2)
        low = [x[0] for x in all_parts[:split]]
        high = [x[0] for x in all_parts[split:]]

        split = np.median(values)
        low = [x[0] for x in all_parts if x[1] < split]
        high = [x[0] for x in all_parts if x[1] >= split]
        return high, low, True
    else:
        split = np.median(values)
        low = [x[0] for x in all_parts if x[1] < split]
        high = [x[0] for x in all_parts if x[1] >= split]
        diff = abs(len(low) - len(high))

        split2 = np.mean(values)
        low2 = [x[0] for x in all_parts if x[1] < split2]
        high2 = [x[0] for x in all_parts if x[1] >= split2]
        diff2 = abs(len(low2) - len(high2))

        if diff <= diff2:
            return high, low, True
        else:
            return high2, low2, False

def get_mat(df, weighted=True):
    mat = np.zeros((64,9))
    num_persons = len(np.unique(df["id"]))
    
    mfp = {}
    
    num_responses_without_nvc = []
    num_responses = []

    for _, row in df.iterrows():
        responses = row["response"]
        confidence = row["confidence"]
        if confidence == "guessed":
            continue
        
        responses = eval(responses)
        num_responses.append(len(responses))
        if "nvc" not in responses:
            num_responses_without_nvc.append(len(responses))
        else:
            responses = ["NVC"]
        
        syl = row["task"]
        syl_idx = ccobra.syllogistic.SYLLOGISMS.index(syl)
        
        if syl not in mfp:
            mfp[syl] = []
        mfp[syl].append(sorted(responses))
        
        for resp in responses:
            resp_idx = ccobra.syllogistic.RESPONSES.index(resp)
            score = 1
            if weighted:
                score = 1 / len(responses)
            mat[syl_idx, resp_idx] += score / num_persons
    
    mfp_res = {}
    for key, value in mfp.items():
        value_tuples = [tuple(x) for x in value]
        val_array = np.empty(len(value_tuples), dtype=tuple)
        val_array[:] = value_tuples
        numbers = np.unique(val_array, return_counts=True)
        numbers = dict(zip(*np.unique(val_array, return_counts=True)))
        numbers = sorted(numbers.items(), key=lambda x: x[1], reverse=True)

        mfp_res[key] = [numbers[0]]
        if len(numbers) > 1 and numbers[0][1] == numbers[1][1]:
            mfp_res[key].append(numbers[1])
    return mat, mfp_res

def plot_pattern(df, ax, mat=None, weighted=False, hide_xticks=False):
    mat, mfp_dict = get_mat(df, weighted=weighted)
    mat = mat.T

    sns.heatmap(mat, ax=ax, cmap="Blues", cbar=False, square=True, vmin=0, linewidths=0.5, linecolor='#00000022')
    ax.set_yticks(np.arange(len(ccobra.syllogistic.RESPONSES)) + 0.5)
    ax.set_yticklabels(ccobra.syllogistic.RESPONSES, rotation=0)
    if not hide_xticks:
        ax.set_xticks(np.arange(len(ccobra.syllogistic.SYLLOGISMS), step=4) + 0.7)
        ax.set_xticklabels(ccobra.syllogistic.SYLLOGISMS[::4], rotation=90)
        ax.tick_params(axis='x', pad=-4)
    else:
        ax.set_xticklabels([])
        
    colors = ["red", "purple"]
    sizes = [0.4, 0.3]
    for syl_idx, syl in enumerate(ccobra.syllogistic.SYLLOGISMS):
        if syl not in mfp_dict:
            continue
        mfps = mfp_dict[syl]
        for color_idx, mfp in enumerate(mfps):
            responses = mfp[0]
            for response in responses:
                resp_idx = ccobra.syllogistic.RESPONSES.index(response)
                ax.add_patch(Ellipse((syl_idx + 0.5, resp_idx + 0.5), sizes[color_idx], sizes[color_idx], fill=True, facecolor=colors[color_idx], edgecolor=colors[color_idx], lw=0.3))
    return mat

sns.set_theme(style='whitegrid', palette='colorblind')
fig, axs = plt.subplots(4, 1, figsize=(11, 6), sharex=True)
high_syl, low_syl, median = split_participants(di.syl_corr_jacc, equal=True)
high_spa, low_spa, median = split_participants(di.spat_corr, equal=True)

high_df_syl = di.syllogs_df[di.syllogs_df["id"].isin(high_syl)]
high_df_spa = di.syllogs_df[di.syllogs_df["id"].isin(high_spa)]
low_df_syl = di.syllogs_df[di.syllogs_df["id"].isin(low_syl)]
low_df_spa = di.syllogs_df[di.syllogs_df["id"].isin(low_spa)]
plot_pattern(high_df_syl, axs[0], hide_xticks=True)
plot_pattern(low_df_syl, axs[1], hide_xticks=True)
plot_pattern(high_df_spa, axs[2], hide_xticks=True)
plot_pattern(low_df_syl, axs[3])

axs[0].set_ylabel("High (Syl)")
axs[1].set_ylabel("Low (Syl)")
axs[2].set_ylabel("High (Spatial)")
axs[3].set_ylabel("Low (Spatial)")
plt.tight_layout()
plt.subplots_adjust(left=None, bottom=None, right=None, top=None, wspace=None, hspace=0.05)
plt.savefig("high_low_plot.pdf", bbox_inches='tight', pad_inches = 0)
plt.show()
