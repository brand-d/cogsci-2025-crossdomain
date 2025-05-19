from __future__ import unicode_literals
import pandas as pd
import numpy as np
import ccobra
from matplotlib import pyplot as plt
import seaborn as sns


results_df = pd.read_csv("reco_results.csv")
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("VP", "Participant"))

results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("Carddir NVC", "CardDir (NVC)"))
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("Spat. Arr", "Arrangements"))
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("(Arrange)", "(Order)"))
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("Cogn. Perf", "Correctness Metrics"))
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("NVC Propensity", "NVC Metrics"))
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("Optimized", "Optimal Combination"))
results_df["feature"] = results_df["feature"].apply(lambda x: x.replace("Some implies All", "Some→All"))

results_df = results_df[results_df["feature"].isin([
    "All Features",
    "Optimal Combination",
    "Spatials (Visible)",
    "Spatials (Memory)",
    "Conditionals",
    "NFC",
    "Syllog Correctness",
    "NVC Metrics",
    "Wason",
    "Corsi",
    "Verbal Substitution",
    "CRT",
    "Most Freq. Pattern",
    "Random Participant",
    "Mental Rotation",
    "Arrangements (Verify)",
    "Arrangements (Order)"
])]

sns.set_theme(style="whitegrid", palette='colorblind')
fig, ax = plt.subplots(1, 1, figsize=(6, 4.5))
order = results_df.groupby(["feature"])['accuracy'].aggregate("mean").reset_index().sort_values('accuracy')
ax = sns.barplot(results_df, x="accuracy", y="feature", hue="type", palette={"Baseline": "C5", "Single Feature": "C0", "Combined": "C2"}, ax=ax, order=order["feature"], errorbar=None)

ax.set_xlabel("")
ax.set_ylabel("")
plt.legend(frameon=False, ncols=3, loc="upper center", bbox_to_anchor=(0.5, 1.1))
plt.tight_layout()
plt.savefig("reco_perf.pdf", bbox_inches='tight', pad_inches = 0)
plt.show()
