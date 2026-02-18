
import requests
import pandas as pd
import io
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

# Create a sample dataframe with USER'S column names
data = {
    "S.No": [1, 2],
    "ROLL NO": ["123456", "789012"],
    "STUDENT NAME": ["John Doe", "Jane Smith"],
    "BRANCH": ["CSE", "ECE"],
    "YEAR": [3, 2],
    "CONTACT": ["9999999999", "8888888888"]
}

df = pd.DataFrame(data)

# Save to bytes buffer
output = io.BytesIO()
with pd.ExcelWriter(output, engine='openpyxl') as writer:
    df.to_excel(writer, index=False)
output.seek(0)

# API URL
API_URL = "http://localhost:8000/api/students/upload"

# Login first
LOGIN_URL = "http://localhost:8000/api/auth/login"
admin_data = {
    "username": "admin",
    "password": "admin123"
}

print("Logging in as admin...")
try:
    response = requests.post(LOGIN_URL, data=admin_data)
    response.raise_for_status()
    token = response.json()["access_token"]
    print("Login successful.")
except Exception as e:
    print(f"Login failed: {e}")
    if response:
        print(response.text)
    exit(1)

# Upload file
print("Uploading file...")
files = {'file': ('students_v2.xlsx', output, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
headers = {'Authorization': f'Bearer {token}'}

try:
    response = requests.post(API_URL, files=files, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Upload failed: {e}")
