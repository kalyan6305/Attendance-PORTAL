import pandas as pd
from io import BytesIO

def parse_student_excel(file_content: bytes) -> list:
    try:
        df = pd.read_excel(BytesIO(file_content))
        
        # Normalize columns: strip whitespace and convert to upper case for comparison
        df.columns = [str(col).strip().upper() for col in df.columns]
        
        # Ensure columns exist
        required_columns = ["S.NO", "ROLL NO", "STUDENT NAME", "BRANCH", "YEAR"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}. Found: {list(df.columns)}")
        
        # Convert to list of dicts
        students = df.to_dict(orient="records")
        
        # Clean data (ensure types)
        cleaned_students = []
        for student in students:
            contact = str(student.get("CONTACT", "")) if not pd.isna(student.get("CONTACT")) else None
            cleaned_students.append({
                "s_no": int(student["S.NO"]),
                "roll_number": str(student["ROLL NO"]),
                "name": str(student["STUDENT NAME"]),
                "branch": str(student["BRANCH"]),
                "year": int(student["YEAR"]),
                "contact": contact
            })
            
        return cleaned_students
    except Exception as e:
        raise ValueError(f"Error parsing Excel file: {str(e)}")
