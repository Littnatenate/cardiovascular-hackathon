import kagglehub
import os
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt
import seaborn as sns

# 1. LOAD DATA
path = kagglehub.dataset_download("ahiduzzaman28/nhanes-cvd-raw-data-2017-23")
csv_path = ""
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith('.csv'):
            csv_path = os.path.join(root, file)

df_raw = pd.read_csv(csv_path)

# 2. COMPREHENSIVE PREPROCESSING
def prepare_full_nhanes_data(df):
    # Filter for adults
    df = df[df['Age'] >= 20].copy()

    # Create Target: Congestive Heart Failure
    df = df[df['Congestive'].isin([1, 2])].copy()
    df['target'] = df['Congestive'].map({1: 1, 2: 0})

    # Drop ID and other cardiovascular outcome columns to prevent "data leakage"
    # We want to predict HF using health/nutrition markers, not other diagnoses
    to_drop = ['SEQN', 'Congestive', 'Coronary', 'Heart_attack', 'Stroke', 'Angina', 'target']
    
    # Identify all numerical columns to use as features
    features_df = df.drop(columns=to_drop)
    features_df = features_df.select_dtypes(include=[np.number])
    
    # Recombine with target
    df_clean = pd.concat([features_df, df['target']], axis=1)

    # Handle missing values globally using median imputation
    df_clean = df_clean.fillna(df_clean.median())
    
    return df_clean

df_final = prepare_full_nhanes_data(df_raw)
print(f"Model is now training on {df_final.shape[1] - 1} unique health and nutritional factors.")

# 3. TRAIN/TEST SPLIT
X = df_final.drop('target', axis=1)
y = df_final['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 4. TRAIN XGBOOST
# Calculating ratio to handle the heavy class imbalance shown in your results
ratio = (len(y) - sum(y)) / sum(y)

model = XGBClassifier(
    n_estimators=150,
    learning_rate=0.03,
    max_depth=5,
    scale_pos_weight=ratio,
    random_state=42
)

model.fit(X_train, y_train)

# 5. EVALUATION
y_pred = model.predict(X_test)
print("\n--- Full Factor Heart Failure Model Performance ---")
print(classification_report(y_test, y_pred))

# 6. IMPROVED FEATURE IMPORTANCE PLOT
importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
# Only show top 20 for readability
top_20 = importances.head(20)

plt.figure(figsize=(12, 8))
sns.barplot(x=top_20, y=top_20.index, palette='viridis')

# Adding the missing axis labels
plt.title("Innovation Analysis: Top 20 Predictors of Heart Failure (Full NHANES Suite)")
plt.xlabel("F-Score (Feature Importance Score)")
plt.ylabel("Health & Nutritional Markers")
plt.grid(axis='x', linestyle='--', alpha=0.7)
plt.tight_layout()
plt.show()