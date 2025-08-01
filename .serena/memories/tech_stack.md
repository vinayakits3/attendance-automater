# Tech Stack and Dependencies

## Runtime Environment
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework

## Core Dependencies
- **express**: ^4.18.2 - Web server framework
- **multer**: ^1.4.5-lts.1 - File upload middleware
- **xlsx**: ^0.18.5 - Excel file parsing and processing
- **nodemailer**: ^6.9.7 - Email sending functionality
- **dotenv**: ^16.3.1 - Environment variable management
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **body-parser**: ^1.20.2 - Request body parsing middleware
- **moment**: ^2.29.4 - Date/time manipulation and formatting

## Development Dependencies
- **nodemon**: ^3.0.1 - Development server with auto-restart

## Architecture
- **Backend**: Node.js/Express API server
- **Frontend**: Static files served from Express (public directory)
- **File Processing**: Server-side Excel parsing
- **Email System**: SMTP-based email sending
- **Storage**: Local file system for temporary file uploads

## Entry Point
- Main server file: `server.js`
- Port: 3000 (default) or environment variable PORT