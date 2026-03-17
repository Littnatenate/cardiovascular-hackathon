import kagglehub
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler

# 1. DOWNLOAD FROM KAGGLE
# This downloads the latest version of the dataset to a local cache
path = kagglehub.dataset_download("sulianova/cardiovascular-disease-dataset")

print("Path to dataset files:", path)

# 2. LOAD THE CSV
# Kaggle datasets usually come in a folder; we find the .csv file inside it
files = os.listdir(path)
csv_file = [f for f in files if f.endswith('.csv')][0]
file_path = os.path.join(path, csv_file)

# Note: This specific dataset uses ';' as a separator
df_base = pd.read_csv(file_path, sep=';')

# 3. PREPROCESS & BASELINE (Same as before)
df_base['age_years'] = (df_base['age'] / 365.25).round().astype(int)

features = ['age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active']
X = df_base[features]
y = df_base['cardio']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. TRAIN BASELINE
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# 5. EVALUATE
y_pred = model.predict(X_test_scaled)
print("\n--- Baseline Model Performance (Kaggle Data) ---")
print(classification_report(y_test, y_pred))