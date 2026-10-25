from predict import predict_single
import json

sample_data = {
    "attendanceRate": 88.5,
    "internalAvg": 17.0,
    "assignmentAvg": 9.0,
    "midtermAvg": 26.0,
    "previousCgpa": 8.6,
    "backlogs": 0,
    "studyHoursPerWeek": 16.0
}

result = predict_single(sample_data)
print("PREDICTION RESULT:")
print(json.dumps(result, indent=2))
