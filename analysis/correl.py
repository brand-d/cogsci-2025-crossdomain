import pandas as pd
import numpy as np
import ccobra
import json
import os
from matplotlib import pyplot as plt
import seaborn as sns
from scipy import stats
from matplotlib import rc
import domain_info as di

# Calculates correlation between two domains
def correl(info1, info2):
    users = set(info1.keys()).intersection(set(info2.keys()))

    i1 = [info1[x][0] for x in users]
    i2 = [info2[x][0] for x in users]
    res = stats.spearmanr(i1, i2)
    return res

# List of the extracted features
features = {
    "Wason": di.wason_info,
    "CRT": di.crt_info,
    "Corsi": di.corsi_info,
    "Mental Rot.": di.mental_into,
    "Verbal Subst.": di.verbal_info,
    "Arrange (Verify)": di.arrange_correct,
    "Arrange (Order)":di.arrange_model_correct,
    "Spatials": di.spat_corr,
    "Conditionals": di.cnd_corr,
    "Syllogisms": di.syl_corr_jacc,
}

# Prepare heatmap data
labels = [x for x, y in features.items()]
mat_pval = np.zeros((len(labels), len(labels)))
mat_stat = np.zeros((len(labels), len(labels)))
for fn1, f1 in features.items():
    for fn2, f2 in features.items():
        corr = correl(f1, f2)
        print(fn1, fn2, corr)
        mat_pval[labels.index(fn1), labels.index(fn2)] = corr.pvalue
        mat_stat[labels.index(fn1), labels.index(fn2)] = corr.statistic

# Remove values for the triangle
mat_stat = np.delete(mat_stat, 0, 0)
mat_stat = np.delete(mat_stat, len(labels) - 1, 1)

# Draw with latex support for underline and bold printing
plt.rcParams.update({
    'text.usetex': True,
    'font.family': 'sans-serif',
})

# Mask matrix to create triangle
mask = np.zeros_like(mat_stat, dtype=bool)
mask[np.triu_indices_from(mask)] = True
mask[np.diag_indices_from(mask)] = False

# Set up for drawing
fig, ax = plt.subplots(1, 1, figsize=(8, 8))

hm_ax = sns.heatmap(mat_stat, ax=ax, mask=mask, cmap="Blues", cbar=False, vmin=0, linewidths=0.5, annot=True, fmt = '.2f')

hm_ax.set_xticks(np.arange(len(labels) - 1)+ 0.5)
hm_ax.set_xticklabels(labels[:-1], rotation=65, fontdict={"size" : 13}, ha="center")

hm_ax.set_yticks(np.arange(len(labels) - 1) + 0.5)
hm_ax.set_yticklabels(labels[1:], rotation=0, fontdict={"size" : 13})

# Mark the significant ones
for label in hm_ax.texts:
    x = int(label._x - 0.5)
    y = int(label._y - 0.5) + 1
    label.set_fontsize(12)
    if mat_pval[x, y] < 0.01:
        labeltext = "\\textbf{{{}}}".format(label.get_text())
        label.set_text(r'\underline{{{}}}'.format(labeltext))

# Save plot
plt.subplots_adjust(hspace=0)
plt.tight_layout()
plt.savefig("correls.pdf", bbox_inches='tight', pad_inches = 0)
plt.show()