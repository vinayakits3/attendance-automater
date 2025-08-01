# Business Logic and Domain Knowledge

## Four Punch Attendance System
The application is specifically designed for organizations using a "Four Punch" attendance tracking system:

### Daily Punch Requirements
1. **InTime1**: Morning arrival (expected: 10:00 AM)
2. **OutTime1**: Lunch break start  
3. **InTime2**: Lunch break end
4. **OutTime2**: Evening departure (expected: 6:15 PM)

### Attendance Status Codes
- **P**: Present
- **A**: Absent  
- **WO**: Weekend/Week Off
- **H**: Holiday
- **Empty**: Treated as Present

### Issue Detection Rules
#### High Severity Issues
- **Missing Punch-in**: No InTime1 recorded
- **Missing Punch-out**: No OutTime2 recorded  
- **Absent Days**: Status marked as 'A'
- **Late Arrival**: InTime1 after 10:00 AM (>30 min = high severity)
- **Early Departure**: OutTime2 before 6:15 PM (>30 min = high severity)

#### Medium Severity Issues
- **Missing Lunch Punches**: OutTime1 or InTime2 missing
- **Excessive Morning Punches**: More than 2 punches before lunch
- **Minor Late/Early**: Less than 30 minutes deviation

### Excel File Format Expectations
- **Title Cell**: B1 contains "Four Punch" identifier
- **Date Headers**: Row 6 contains day numbers and month names
- **Employee Blocks**: Every 12 rows starting from row 10
- **Employee ID**: Column E in employee header row
- **Summary Statistics**: Column I with Present/Absent counts and time deviations

### Email Report Features
- **Monthly Summary**: Total counts of various issue types
- **Detailed Issue List**: Day-by-day breakdown with severity indicators
- **Policy Reminders**: Four punch system rules and timing expectations
- **Action Items**: Specific steps employees should take
- **HTML Formatting**: Professional styling with color-coded severity levels

### Configuration Constants
- Standard check-in: 10:00 AM
- Standard check-out: 6:15 PM  
- Maximum morning punches: 2
- Severity threshold: 30 minutes for late/early classification