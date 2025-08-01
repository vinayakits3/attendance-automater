# Code Style and Conventions

## JavaScript Style
- **ES6+ Features**: Uses modern JavaScript with const/let, arrow functions, async/await
- **Naming Convention**: camelCase for variables and functions, UPPER_CASE for constants
- **String Literals**: Uses template literals with backticks for multi-line strings and interpolation
- **Error Handling**: Try-catch blocks for async operations, error responses for API endpoints

## Code Organization
- **Single File Structure**: Main logic in `server.js` (monolithic approach)
- **Function Organization**: Utility functions defined before route handlers
- **Route Structure**: RESTful API routes under `/api/` prefix
- **Middleware**: Applied globally before routes (cors, body-parser, express.static)

## API Patterns
- **Response Format**: Consistent JSON responses with `success`, `error`, `data` fields
- **Error Responses**: Status codes with descriptive error messages
- **Request Handling**: Proper status codes (400, 500, 200)
- **File Upload**: Multer middleware with validation and temporary storage

## Data Processing Patterns
- **Excel Processing**: XLSX library for reading workbook sheets and ranges
- **Date Handling**: Moment.js for time parsing and comparisons
- **Email Templates**: HTML string concatenation with inline styles
- **Configuration**: Environment variables with fallback defaults

## Comments and Documentation
- **Inline Comments**: Descriptive comments for complex business logic
- **Function Comments**: Brief descriptions for major utility functions
- **API Documentation**: Comments describing route purposes and parameters
- **Configuration Comments**: Explanations for important settings

## Constants and Configuration
- **Time Constants**: CHECK_IN_TIME, CHECK_OUT_TIME defined as string literals
- **Magic Numbers**: MAX_MORNING_PUNCHES and similar values as named constants
- **Environment Variables**: Accessed via process.env with defaults