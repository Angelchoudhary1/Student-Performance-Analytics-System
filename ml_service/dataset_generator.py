import os
import random
import csv

def generate_student_dataset(filename="student_academic_data.csv", num_samples=1200):
    os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else ".", exist_ok=True)
    
    headers = [
        "attendance_rate",
        "internal_avg",
        "assignment_avg",
        "midterm_avg",
        "previous_cgpa",
        "study_hours_week",
        "backlogs",
        "final_cgpa",
        "risk_level",
        "pass_result"
    ]

    rows = []
    random.seed(42)

    for _ in range(num_samples):
        # Base aptitude & consistency factor (0.2 to 1.0)
        aptitude = random.uniform(0.35, 0.98)
        effort = random.uniform(0.3, 1.0)
        
        # Correlated features
        attendance = min(100.0, max(35.0, (effort * 65.0 + aptitude * 35.0) + random.gauss(0, 5)))
        study_hours = max(2.0, min(35.0, effort * 25.0 + random.gauss(0, 3)))
        
        internal = max(4.0, min(20.0, (aptitude * 14.0 + effort * 6.0) + random.gauss(0, 1.5)))
        assignment = max(2.0, min(10.0, (effort * 7.5 + aptitude * 2.5) + random.gauss(0, 0.8)))
        midterm = max(5.0, min(30.0, (aptitude * 20.0 + effort * 10.0) + random.gauss(0, 2.2)))
        
        prev_cgpa = max(3.5, min(9.9, (aptitude * 6.0 + effort * 4.0) + random.gauss(0, 0.5)))
        
        # Backlog probability increases with low attendance and low previous cgpa
        if prev_cgpa < 5.5 or attendance < 65:
            backlogs = random.choices([0, 1, 2, 3, 4], weights=[0.2, 0.35, 0.25, 0.15, 0.05])[0]
        else:
            backlogs = random.choices([0, 1, 2], weights=[0.85, 0.12, 0.03])[0]

        # Target variable calculation (Final CGPA)
        score_norm = (
            (attendance / 100.0) * 0.20 +
            (internal / 20.0) * 0.15 +
            (assignment / 10.0) * 0.10 +
            (midterm / 30.0) * 0.25 +
            (prev_cgpa / 10.0) * 0.30 -
            (backlogs * 0.08)
        )
        
        final_cgpa = min(10.0, max(2.0, (score_norm * 10.0) + random.gauss(0, 0.25)))
        final_cgpa = round(final_cgpa, 2)
        attendance = round(attendance, 2)
        internal = round(internal, 2)
        assignment = round(assignment, 2)
        midterm = round(midterm, 2)
        prev_cgpa = round(prev_cgpa, 2)
        study_hours = round(study_hours, 1)

        # Risk Classification
        if final_cgpa < 5.0 or attendance < 60 or backlogs >= 2:
            risk = "Critical"
        elif final_cgpa < 6.2 or attendance < 72 or backlogs == 1:
            risk = "High"
        elif final_cgpa < 7.5 or attendance < 80:
            risk = "Moderate"
        else:
            risk = "Low"

        pass_result = 1 if final_cgpa >= 5.0 and attendance >= 65 else 0

        rows.append([
            attendance,
            internal,
            assignment,
            midterm,
            prev_cgpa,
            study_hours,
            backlogs,
            final_cgpa,
            risk,
            pass_result
        ])

    with open(filename, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"Generated {num_samples} academic samples saved to {filename}")

if __name__ == "__main__":
    generate_student_dataset("ml_service/student_academic_data.csv")
