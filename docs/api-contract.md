# API Contract

## POST /api/v1/generate-education
**Request Body**:
```json
{
  "patient_id": "uuid",
  "notes": "string"
}
```
**Response**:
```json
{
  "education_plan": "markdown string"
}
```
