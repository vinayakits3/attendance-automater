# Attendance Automater Project Overview

## Project Purpose
The Attendance Automater is a Node.js web application designed to automate the processing and management of employee attendance data. It specifically handles "Four Punch" attendance system reports where employees are required to punch in/out four times daily:
1. Morning check-in
2. Lunch break out 
3. Lunch break in
4. Evening check-out

## Key Features
- **Excel File Processing**: Parses Four Punch attendance reports in XLSX format
- **Attendance Analysis**: Automatically identifies attendance issues including:
  - Missing punch-ins/punch-outs
  - Late arrivals (after 10:00 AM)
  - Early departures (before 6:15 PM) 
  - Absent days
  - Missing lunch break punches
  - Excessive morning punches (>2)
- **Automated Email Notifications**: Sends detailed monthly attendance reports to employees with identified issues
- **Web Interface**: Provides a web-based interface for uploading files and managing the process

## Business Logic
- Standard work hours: 10:00 AM to 6:15 PM
- Four punch system: InTime1 → OutTime1 (lunch) → InTime2 → OutTime2
- Maximum 2 morning punches allowed
- Automatic detection of weekends (WO) and holidays (H)
- Severity-based issue classification (HIGH/MEDIUM)