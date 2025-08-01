# INN Department Specialized Implementation

## Overview
Created a specialized attendance automater specifically for the INN department that processes Excel files in the specific format used by the user. The system focuses exclusively on INN department employees and their attendance data.

## Key Features Implemented

### Specialized Excel Parser
- **Target File**: `C:\Users\Rizvi\Downloads\Jun2025.xlsx`
- **Department Focus**: Only processes INN department (found at row 190, column E)
- **Format Support**: Handles the specific 12-row employee data blocks
- **Date Extraction**: Parses date headers from row 6 (format: "1 S", "2 M", etc.)

### Employee Data Structure
Each employee has a 12-row block containing:
1. Employee info with summary statistics
2. Status (WO=Weekend, A=Absent, P=Present)  
3. InTime1 (morning check-in)
4. OutTime1 (lunch break start)
5. InTime2 (lunch break end)
6. OutTime2 (evening check-out)
7. Duration
8. Late By
9. Early By
10. OT (overtime)
11. Shift
12. Empty separator

### API Endpoints Created
- `GET /api/process-inn-attendance` - Complete attendance analysis
- `GET /api/inn-summary` - Summary statistics only
- `GET /api/config` - System configuration
- `GET /api/health` - Health check with file existence verification

### Frontend Interface
- React-based dashboard for INN department
- Real-time attendance summary display
- Detailed issue breakdown by employee
- Employee grid with attendance statistics
- Mobile-responsive design

### Issue Detection Logic
- **High Severity**: Missing punches, absences, late/early >30 minutes
- **Medium Severity**: Incomplete shifts, late/early <30 minutes
- **Four Punch Validation**: Ensures all 4 daily punches are recorded
- **Time Analysis**: Compares against 10:00 AM - 6:15 PM schedule

## Technical Implementation
- **Backend**: Node.js/Express with XLSX library for Excel parsing
- **Frontend**: React with modern hooks (useState, useEffect)
- **Styling**: Custom CSS with responsive design
- **Data Flow**: RESTful API communication between frontend and backend

## File Structure
```
attendance-automater/
├── backend/
│   ├── server.js          # Specialized INN department logic
│   └── package.json       # Dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main attendance dashboard
│   │   └── App.css        # Responsive styling
│   └── package.json       # React dependencies
└── README.md              # Complete usage instructions
```

## Usage Workflow
1. User places Excel file in specified location
2. Runs backend server (npm run dev)
3. Runs frontend server (npm run dev) 
4. Opens web interface at localhost:5173
5. Clicks "Process Attendance" to analyze data
6. Reviews summary and detailed issues

## Future Enhancements Ready
- Email notification system (nodemailer already configured)
- Export functionality
- Date range filtering
- Additional analytics