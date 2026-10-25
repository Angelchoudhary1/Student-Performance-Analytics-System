
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from predict import predict_single

app = FastAPI(title="Student Performance Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentData(BaseModel):
    attendanceRate: float = Field(default=80, ge=0, le=100)
    internalAvg: float = Field(default=15, ge=0, le=20)
    assignmentAvg: float = Field(default=8, ge=0, le=10)
    midtermAvg: float = Field(default=22, ge=0, le=30)
    previousCgpa: float = Field(default=7.5, ge=0, le=10)
    backlogs: int = Field(default=0, ge=0)
    studyHoursPerWeek: float = Field(default=14, ge=0)

@app.get("/")
def home():
    return {"message": "Student Performance API is running"}

@app.post("/predict")
def predict(data: StudentData):
    return predict_single(data.model_dump())