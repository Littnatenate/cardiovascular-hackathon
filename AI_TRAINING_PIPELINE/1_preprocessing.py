import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
df = pd.read_csv(r'C:\Users\524yu\Dev\cardiovascular-hackathon\DATASET\heart_failure_clinical_records_dataset.csv')

print(df.head())
print(df.info())
print(df.tail())

