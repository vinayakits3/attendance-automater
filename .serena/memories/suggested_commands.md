# Suggested Commands for Development

## Installation and Setup
```cmd
# Install dependencies
npm install

# Copy environment variables template (if available)
copy .env.example .env
```

## Development Commands
```cmd
# Start development server with auto-reload
npm run dev

# Start production server
npm start
# or
node server.js
```

## Environment Configuration
Set up the following environment variables in `.env`:
```
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Windows-specific Commands
```cmd
# Directory navigation
cd /d C:\innovatefiles\nodeapps\attendance-automater
dir /s /b *.js    # Find JavaScript files
dir /s /b *.json  # Find JSON files

# Process management
tasklist | findstr node    # Find running Node processes
taskkill /f /im node.exe   # Kill Node processes

# Git operations (if needed)
git status
git add .
git commit -m "message"
git push
```

## Testing the Application
```cmd
# Test server health
curl http://localhost:3000/api/health

# Test file upload endpoint
# Use Postman or browser to upload Excel files to /api/upload
```

## Useful System Commands
```cmd
# Check Node.js version
node --version
npm --version

# Clear npm cache (if issues)
npm cache clean --force

# View logs (if using PM2 or similar)
# Not configured by default - logs go to console
```