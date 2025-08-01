# Attendance Intelligence Platform

A modern, web-based attendance management system with intelligent analysis capabilities. Features a sleek black and white interface with drag-and-drop Excel file processing and real-time attendance insights.

## Features

- **Modern Landing Page**: Sleek black and white design with minimalist aesthetics
- **Drag & Drop Upload**: Simply drag your Excel files onto the interface
- **Real-time Processing**: Instant analysis with visual progress indicators  
- **Intelligent Analysis**: Advanced four-punch system validation and issue detection
- **Department Filtering**: Specialized processing for specific departments (INN focus)
- **Visual Dashboard**: Clean, grid-based layout with comprehensive metrics
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Fixed File Processing**: Quick analysis of pre-configured attendance files

## Excel File Format Support

The system is designed to work with your specific Excel format:
- **Department Row**: Looks for "INN" in row 190, column E
- **Employee Blocks**: Each employee has a 12-row data block
- **Date Headers**: Extracts dates from row 6 (format: "1 S", "2 M", etc.)
- **Four Punch Data**: Processes InTime1, OutTime1, InTime2, OutTime2 for each day

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Your Excel file should be located at: `C:\Users\Rizvi\Downloads\Jun2025.xlsx`

### Backend Setup
1. Navigate to the backend directory:
   ```cmd
   cd backend
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

3. Start the backend server:
   ```cmd
   npm run dev
   ```
   
   The server will run on `http://localhost:3000`

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```cmd
   cd frontend
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

3. Start the frontend development server:
   ```cmd
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

## Usage

### Option 1: Upload Any Excel File
1. **Open the web interface**: Go to `http://localhost:5173`
2. **Upload via button**: Click "Upload Excel File" and select your attendance file
3. **Or drag & drop**: Simply drag your Excel file onto the drop zone
4. **Instant analysis**: The system will process your file and show results immediately

### Option 2: Process Fixed File
1. **Ensure your Excel file is in place**: Make sure `Jun2025.xlsx` is in your Downloads folder
2. **Click "Process Fixed File"**: For quick analysis of your standard file
3. **View INN department results**: Get specialized analysis for INN department employees

### What You'll See:
- **Landing Page**: Modern, professional interface with clear calls-to-action
- **Upload Zone**: Intuitive drag-and-drop area with visual feedback
- **Real-time Processing**: Loading indicators and progress updates
- **Results Dashboard**: Clean metrics cards showing attendance summary
- **Detailed Analysis**: Employee-by-employee breakdown of issues
- **Issue Classification**: Color-coded severity levels (high/medium)
- **Responsive Layout**: Optimized for all screen sizes

## API Endpoints

- `GET /api/process-inn-attendance` - Process the Excel file and return complete analysis
- `GET /api/inn-summary` - Get summary statistics only
- `GET /api/config` - Get system configuration
- `GET /api/health` - Health check and file existence verification

## Attendance Rules

- **Standard Work Hours**: 10:00 AM to 6:15 PM
- **Four Punch System**: InTime1 → OutTime1 (lunch) → InTime2 → OutTime2
- **Issue Detection**:
  - Missing punch-in/punch-out
  - Late arrivals (after 10:00 AM)
  - Early departures (before 6:15 PM)
  - Incomplete shifts (less than 4 punches)
  - Absent days

## Issue Severity Levels

- **High Severity**: Missing punches, absences, late/early >30 minutes
- **Medium Severity**: Incomplete shifts, late/early <30 minutes

## Customization

To change the Excel file path, edit the `EXCEL_FILE_PATH` constant in `backend/server.js`:

```javascript
const EXCEL_FILE_PATH = 'C:\\Users\\YourUsername\\Downloads\\YourFile.xlsx';
```

## Troubleshooting

### Common Issues

1. **"Excel file not found"**: 
   - Ensure the file exists at `C:\Users\Rizvi\Downloads\Jun2025.xlsx`
   - Check file permissions

2. **"INN Department not found"**:
   - Verify the Excel file has "INN" in the correct location (row 190, column E)
   - Check if the file format matches the expected structure

3. **Server connection errors**:
   - Ensure both backend (port 3000) and frontend (port 5173) are running
   - Check for port conflicts

### Health Check

Visit `http://localhost:3000/api/health` to verify:
- Server is running
- Excel file exists and is accessible
- System configuration

## File Structure

```
attendance-automater/
├── backend/
│   ├── server.js          # Main server with INN department logic
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Styling
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── index.html         # HTML template
└── README.md              # This file
```

## Support

For issues or customizations:
1. Check the console logs in both backend and frontend
2. Verify the Excel file format matches the expected structure
3. Ensure all dependencies are installed correctly

## Next Steps

- Add email notification functionality
- Export reports to PDF/Excel
- Add employee-specific filtering
- Implement date range selection
- Add more detailed analytics
