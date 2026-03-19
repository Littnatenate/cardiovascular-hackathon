# Product Specification

## Overview
A tool designed to assist in discharge counseling for cardiovascular patients, ensuring they have all necessary information and education before leaving the hospital.

## Core Features
1. Education material generation.
2. Escalation summary for doctors.
3. Patient-friendly data visualization.

## Original Project Details & Datasets
- **Kaggle Datasets**:
  - [Cardiovascular Disease Dataset](https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset)
  - [NHANES CVD Raw Data](https://www.kaggle.com/datasets/ahiduzzaman28/nhanes-cvd-raw-data-2017-23)
  - [Heart Failure Clinical Data](https://www.kaggle.com/datasets/andrewmvd/heart-failure-clinical-data)

### Dataset Download Script (KaggleHub)
```python
import kagglehub
path = kagglehub.dataset_download("andrewmvd/heart-failure-clinical-data")
print("Path to dataset files:", path)
```
