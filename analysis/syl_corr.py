""" Creates a file with the correctness metrics for each response in the syllogistic tasks.

"""
import pandas as pd
import numpy as np
import ccobra
import json
import os

# Load the syllogism dataset
syllogs_df = pd.read_csv(os.path.join("..", "data", "syllog_data.csv"))
selected_syl = ccobra.syllogistic.SYLLOGISMS

# For storing results
syl_corr = []

# Iterate over all participants
for vp, p_df in syllogs_df.groupby("id"):
    # Iterate over the syllogisms
    for syl in selected_syl:
        syl_tasks = p_df[p_df["task"] == syl]
        resps = syl_tasks["response"]
        if resps.empty:
            responses = []
            continue
        
        # First order logic solutions
        fol = syl_tasks["fol"]

        # FOL responses denoted NVC in upper case
        fol = set([x.replace("NVC", "nvc") for x in json.loads(fol.values[0])])

        # Load the response set
        resps = set(json.loads(resps.values[0]))

        # Build vector representation for FOL and participant responses
        fol_vec = np.zeros((8))
        resps_vec = np.zeros((8))

        for resp in resps:
            if resp == "nvc":
                break
            idx = ccobra.syllogistic.RESPONSES.index(resp)
            resps_vec[idx] = 1

        for resp in fol:
            if resp == "nvc":
                break
            idx = ccobra.syllogistic.RESPONSES.index(resp)
            fol_vec[idx] = 1

        # Calculate jaccard coefficient
        jacc = len(resps.intersection(fol)) / len(resps.union(fol))

        # Calculate the ratio of hits
        set_corr = len(resps.intersection(fol)) / len(resps)

        # Calculate the MAE
        mae = np.mean(fol_vec == resps_vec)
        
        # Add to results
        syl_corr.append({
            "id": vp,
            "task": syl,
            "jacc": jacc,
            "set_corr": set_corr,
            "mae": mae,
            "resps": json.dumps(list(resps)),
            "fol": json.dumps(list(fol))
        })

# Convert to dataframe and store
syl_corr_df = pd.DataFrame(syl_corr)
syl_corr_df.to_csv(os.path.join("..", "data", "syl_correct.csv"), index=False)

# Print mean correctness
print("Mean Correctness")
print("    Jacc", syl_corr_df["jacc"].mean())
print("    Hits", syl_corr_df["set_corr"].mean())
print("    MAE", syl_corr_df["mae"].mean())
print()

# Print the mean correctness without NVC
jacc = []
set_corr = []
mae = []
for id, df in syl_corr_df.groupby("id"):
    if len(df) != 64:
        continue
    df = df[df["fol"] != '["nvc"]']
    df = df[df["resps"] != '["nvc"]']
    agg = df[["jacc", "set_corr", "mae"]].agg("mean")

    jacc.append(agg["jacc"])
    set_corr.append(agg["set_corr"])
    mae.append(agg["mae"])

print("Mean Correctness without NVC")
print("    Jacc", np.mean(jacc))
print("    Hits", np.mean(set_corr))
print("    MAE", np.mean(mae))