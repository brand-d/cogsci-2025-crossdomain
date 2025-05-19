# cogsci-2025-crossdomain
Companion repository for the 2025 article "Using Cross-Domain Data to Predict Syllogistic Reasoning Behavior" published in the proceedings of the 47th Annual Meeting of the Cognitive Science Society.

## Overview

- `analysis`: Contains the analysis scripts used in the paper
    - `correl.py`: Generates the correlation heatmap
    - `domain_info.py`: Helper file loading and processing all domain data CSV
    - `get_metrics_table.py`: Generates two CSVs that compare different correctness metrics and informations from the other domain to the syllogistic correctness
    - `performance_plot.py`: Generates the performance plot from the recommender results (reco.py needs to be run first)
    - `reco.py`: Performs the recommender run
    - `syl_corr.py`: Generates `syl_correct.csv` in the data folder, which more conveniently offers the correctness metrics
- `data`: Contains the datasets with for all tested domains (with all participants, each):
    - `carddir_data.csv`: Data containing cardinal direction responses, where participants had two premises and had to conclude the relation between the two end-terms
    - `conditionals_data.csv`: Contains responses to conditional questions (MP, MT, AC, DA) for counterfactual and normal presentation
    - `corsi_data.csv`: Contains the results and responses for the CORSI block tapping task
    - `crt_data.csv`: Contains the results and responses for the Cognitive Reflection Test (7 items)
    -  `mental_rotation_data.csv`: Contains the results and responses for the mental rotation tasks
    - `nfc_data`: Contains the answers to the Need for cognition short scale (4 items)
    - `spatial_arrangement_data.csv`: Contains the results and responses for the spatial arrangement tasks (Correctness and arrangements, as well as interactions)
    - `spatial_rel_data`: Contains the results and responses for the spatial relational tasks (with premises constantly visible and premises to memorize)
    - `syl_correct.csv`: Generated file containing the correctness in the syllogistic tasks for all participants and tasks according to different metrics: Jaccard, MAE, and Hitrate
    - `syllog_data.csv`: Contains the results and responses for the 64 syllogistic reasoning tasks
    - `verbal_data.csv`: Contains the results and responses for the verbal substitution tasks
    - `wason_data.csv`: Contains the results and responses for the Wason card selection task (with different metrics for correctness to allow for partial correctness, too)

## Requirements
- Python 3.12
    - Pandas
    - Numpy
    - CCOBRA
    - matplotlib
    - Scipy
    - Seaborn

All dependecnies can be installed via `pip`.

## Usage
After cloning/downloading the repository, switch to the analysis subfolder:

 ```
cd /path/to/repository/
```

Then, each script can be executed without arguments:
 ```
$> python <script.py>
```

## References

Brand, D., & Ragni, M. (2025). Using Cross-Domain Data to Predict Syllogistic Reasoning Behavior. *Proceedings of the 47th Annual Meeting of the Cognitive Science Society*. 