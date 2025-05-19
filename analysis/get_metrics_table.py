""" Create metrics tables (long and wide format) that have various performance metrics per participant.
    The long format is comparing other metrics with syllogistic performance.
"""
import pandas as pd
import numpy as np
import ccobra
import os
import domain_info as di

data_path = os.path.join("..", "data")

features = {
    "Cond Corr": di.cnd_corr,
    "Cond Is NVC": di.cnd_nvc,
    "Spatial Corr": di.spat_corr,
    "Spatial Is NVC": di.spat_nvc,
    "Arrange (Verify)": di.arrange_correct,
    "Arrange (Is PMM)":di.arrange_pmm,
    "Arrange (Order)":di.arrange_model_correct,
    "Carddir NVC": di.carddir_nvc,
    "CRT": di.crt_info,
    "Mental Rot": di.mental_into,
    "verbal subst": di.verbal_info,
    "Corsi": di.corsi_info,
    "Syl Jaccard": di.syl_corr_jacc,
    "Syl Corr Set": di.syl_corr_set,
    "Syl Corr MAE": di.syl_corr_mae,
    "Syl Is NVC": di.syl_nvc,
    "Wason": di.wason_info,
}

results = []
results_long = []
for vp in di.syl_corr_set.keys():
    entry = {}
    entry["id"] = vp
    failed = False
    for fn1, f1 in features.items():
        if vp not in f1:
            failed = True
            break
        entry[fn1] = f1[vp][0]
    for fn1, f1 in features.items():
        if vp not in f1:
            continue
        results_long.append({
            "id": vp,
            "metric": fn1,
            "value": f1[vp][0],
            "syl": di.syl_corr_set[vp][0]
        })

    if not failed:
        results.append(entry)
results = pd.DataFrame(results)
results_long = pd.DataFrame(results_long)

results.to_csv(os.path.join(data_path, "metrics_table.csv"), index=False)
results_long.to_csv(os.path.join(data_path, "metrics_table_long.csv"), index=False)

