# Project Structure

## Root Directory Files
- **server.js**: Main application server and API endpoints
- **package.json**: Node.js dependencies and scripts  
- **package-new.json**: Duplicate of package.json (possibly backup)
- **.env**: Environment configuration (not in repo)
- **.env.example**: Environment template (if exists)
- **.gitattributes**: Git configuration for file handling

## Directory Structure
```
attendance-automater/
├── .serena/          # Serena configuration directory
├── backend/          # Contains backend package.json (minimal)
├── frontend/         # Empty directory (frontend not separated)
├── public/           # Static files served by Express
├── uploads/          # Temporary directory for uploaded Excel files (created at runtime)
├── server.js         # Main application file
├── package.json      # Project dependencies and scripts
└── .env             # Environment variables (create from .env.example)
```

## Application Architecture
- **Monolithic Structure**: Single server.js file contains all logic
- **Static File Serving**: Express serves files from public/ directory
- **File Upload Flow**: uploads/ directory for temporary Excel file processing
- **No Separate Frontend Build**: Frontend likely served as static HTML/JS/CSS

## API Endpoints
- `POST /api/upload` - Excel file upload and processing
- `POST /api/send-emails` - Send attendance report emails
- `GET /api/config` - Get application configuration
- `GET /api/health` - Health check endpoint

## Data Flow
1. Excel file uploaded to `/uploads/` directory
2. File parsed using XLSX library
3. Attendance data analyzed for issues
4. Email reports generated and sent
5. Temporary file cleaned up

## Missing Components
- No TypeScript configuration (despite being marked as TypeScript project)
- No separate frontend framework/build process  
- No database layer (processes files directly)
- No test files or testing framework
- No linting/formatting configuration files