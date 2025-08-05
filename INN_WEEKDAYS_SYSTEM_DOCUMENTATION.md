# INN Department Weekdays-Only Attendance System

## System Overview

This is a **dedicated attendance management system** designed exclusively for **INN Department employees** with **weekdays-only processing** (Monday through Friday).

## Core System Features

### 🏢 Department Focus
- **INN Department Only**: System processes only employees from the INN department
- **Automatic Filtering**: All other departments are automatically filtered out
- **Department Verification**: System validates that processed employees belong to INN

### 📅 Weekdays-Only Processing
- **Monday-Friday Only**: Attendance is calculated only for weekdays
- **Weekend Exclusion**: Saturday (St) and Sunday (S) are automatically excluded
- **Excel Day Detection**: Uses day abbreviations from Excel row 6 to determine weekdays vs weekends
- **Working Days**: Only weekdays count as working days in all calculations

## System Configuration

### Attendance Rules
- **Check-in Deadline**: 10:01 AM
- **Check-out Minimum**: 6:30 PM (18:30)
- **Working Days**: Monday, Tuesday, Wednesday, Thursday, Friday
- **Excluded Days**: Saturday, Sunday (marked as WO - Weekend Off)

### Excel Format Support
- **Four Punch System**: InTime1 → OutTime1 (lunch) → InTime2 → OutTime2
- **Day Headers**: Reads from row 6 (M, T, W, Th, F, St, S)
- **Department Detection**: Searches for "INN" in department columns
- **Employee Blocks**: Processes 12-row employee data blocks

## API Endpoints

### Core Endpoints
- `GET /api/attendance/process` - Process INN attendance from fixed file
- `POST /api/upload` - Upload and process INN department Excel files
- `GET /api/config` - Get system configuration
- `GET /api/health` - System health check

### Legacy Compatibility
- `GET /api/process-inn-attendance` - Process INN attendance
- `GET /api/inn-summary` - Get INN department summary

## Frontend Components

### Main Views
1. **Hero Section**: INN-branded landing with system description
2. **Upload Section**: INN-specific file upload with weekdays-only badges
3. **Results Section**: Comprehensive analysis with INN branding

### Key Features
- **INN Department Badge**: Visual indicator of department focus
- **Weekdays-Only Notice**: Clear explanation of processing policy
- **Attendance Analysis**: Detailed breakdown of weekday attendance only
- **Issue Detection**: Late arrivals, early departures, missing punches

## Processing Logic

### Employee Selection
1. Parse Excel file for all employees
2. Filter for INN department only
3. Exclude all other departments
4. Validate INN employee data

### Day Processing
1. Read day headers from Excel row 6
2. Identify weekdays (M, T, W, Th, F)
3. Identify weekends (St, S)
4. Process only weekday attendance
5. Mark weekends as WO (Weekend Off)

### Attendance Calculation
1. Count only weekday present/absent days
2. Calculate attendance rate based on weekdays only
3. Exclude weekends from all statistics
4. Generate weekdays-only summary

## System Messages

### Processing Notes
- "This system exclusively processes INN department employees and counts only weekdays (Monday-Friday) for attendance calculations."
- "Weekend days (Saturday, Sunday) are automatically excluded from all attendance analysis."
- "This system is dedicated to INN department only. Other departments will be filtered out."

### User Interface Messages
- **Upload**: "Upload INN Department Excel File"
- **Processing**: "Processing INN Department attendance (weekdays only)..."
- **Results**: "INN Department Attendance Analysis - Weekdays-Only Processing"

## File Structure

```
attendance-automater/
├── backend/
│   ├── controllers/
│   │   ├── attendanceController.js    # INN-specific processing
│   │   ├── uploadController.js        # INN-only file uploads
│   │   └── fixedFileController.js     # INN fixed file processing
│   ├── services/
│   │   ├── excelParser.js            # INN filtering + weekdays-only parsing
│   │   └── attendanceAnalyzer.js     # Weekdays-only analysis
│   ├── utils/
│   │   └── constants.js              # INN + weekdays-only configuration
│   └── server.js                     # INN-branded server startup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sections/
│   │   │   │   ├── Hero/             # INN-branded hero section
│   │   │   │   ├── Upload/           # INN-specific upload
│   │   │   │   └── Results/          # INN results with weekdays notice
│   │   │   └── UI/
│   │   └── App.jsx                   # Main INN application
│   └── package.json
└── README.md
```

## Testing

### Test Scripts
- `backend/test-inn-only-processing.js` - Verify INN-only filtering
- `backend/test-weekdays-only.js` - Verify weekdays-only processing

### Verification Points
✅ Only INN department employees are processed  
✅ Only Monday-Friday are included in calculations  
✅ Saturday/Sunday are marked as WO and excluded  
✅ Working days count includes only weekdays  
✅ Attendance rates are calculated on weekdays only  
✅ Frontend shows INN branding and weekdays policy

## System Startup

When the system starts, it displays:
```
================================================================================
🏢 INN Department Weekdays-Only Attendance Automater
================================================================================
🚀 Server running on port 3000
📅 Processing Policy: WEEKDAYS ONLY (Monday-Friday)
🏢 Department Focus: INN DEPARTMENT ONLY
⏰ Work hours: 10:01 - 18:30
📋 SYSTEM FEATURES:
   ✅ INN Department employees only
   ✅ Monday-Friday attendance calculation
   ❌ Weekend days automatically excluded
   ✅ Four-punch attendance system support
   ✅ Late arrival and early departure detection
================================================================================
```

## Usage Workflow

1. **File Upload**: Upload Excel file containing INN department data
2. **Automatic Filtering**: System filters for INN employees only
3. **Weekday Processing**: Process only Monday-Friday attendance
4. **Analysis**: Generate weekdays-only attendance analysis
5. **Results**: Display comprehensive INN department results

## Version Information

- **System Name**: INN Department Weekdays-Only Attendance Automater
- **Version**: 2.0 - INN Department Weekdays-Only Edition
- **Department Focus**: INN Only
- **Processing Policy**: Weekdays Only (Monday-Friday)
- **Weekend Policy**: Automatically Excluded
