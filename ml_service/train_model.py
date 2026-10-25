import os
import sys

def run_training():
    try:
        import pandas as pd
        import numpy as np
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
        from sklearn.preprocessing import StandardScaler
        from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
        import joblib
    except ImportError:
        print("[ML Training] Scikit-Learn or Pandas not found. Please install requirements: pip install -r requirements.txt")
        return False

    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, "student_academic_data.csv")
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(dataset_path):
        from dataset_generator import generate_student_dataset
        generate_student_dataset(dataset_path)

    print("[ML Training] Loading student dataset from:", dataset_path)
    df = pd.read_csv(dataset_path)

    features = [
        "attendance_rate",
        "internal_avg",
        "assignment_avg",
        "midterm_avg",
        "previous_cgpa",
        "study_hours_week",
        "backlogs"
    ]

    X = df[features]
    y_cgpa = df["final_cgpa"]
    y_risk = df["risk_level"]
    y_pass = df["pass_result"]

    # Train/Test Split
    X_train, X_test, y_cgpa_train, y_cgpa_test = train_test_split(X, y_cgpa, test_size=0.2, random_state=42)
    _, _, y_risk_train, y_risk_test = train_test_split(X, y_risk, test_size=0.2, random_state=42)
    _, _, y_pass_train, y_pass_test = train_test_split(X, y_pass, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Regressor for CGPA
    cgpa_regressor = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    cgpa_regressor.fit(X_train_scaled, y_cgpa_train)
    cgpa_preds = cgpa_regressor.predict(X_test_scaled)
    r2 = r2_score(y_cgpa_test, cgpa_preds)
    mse = mean_squared_error(y_cgpa_test, cgpa_preds)
    print(f"[CGPA Model] R^2 Score: {r2:.4f}, MSE: {mse:.4f}")

    # 2. Classifier for Risk Level
    risk_classifier = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    risk_classifier.fit(X_train_scaled, y_risk_train)
    risk_preds = risk_classifier.predict(X_test_scaled)
    risk_acc = accuracy_score(y_risk_test, risk_preds)
    print(f"[Risk Classifier] Accuracy: {risk_acc * 100:.2f}%")

    # 3. Classifier for Pass Probability
    pass_classifier = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    pass_classifier.fit(X_train_scaled, y_pass_train)
    pass_preds = pass_classifier.predict(X_test_scaled)
    pass_acc = accuracy_score(y_pass_test, pass_preds)
    print(f"[Pass Classifier] Accuracy: {pass_acc * 100:.2f}%")

    # Save models
    joblib.dump(scaler, os.path.join(models_dir, "scaler.pkl"))
    joblib.dump(cgpa_regressor, os.path.join(models_dir, "cgpa_regressor.pkl"))
    joblib.dump(risk_classifier, os.path.join(models_dir, "risk_classifier.pkl"))
    joblib.dump(pass_classifier, os.path.join(models_dir, "pass_classifier.pkl"))

    print(f"[ML Training] Models saved successfully in: {models_dir}")
    return True

if __name__ == "__main__":
    run_training()
