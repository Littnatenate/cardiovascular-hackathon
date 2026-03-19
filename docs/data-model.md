# Data Model

## Patient Data
- `id`: UUID
- `name`: string
- `admission_date`: iso8601
- `diagnosis`: string[]
- `last_vitals`: object

## Discharge Note
- `patient_id`: string
- `author`: string
- `summary`: string
- `medications`: object[]
- `follow_up`: string
