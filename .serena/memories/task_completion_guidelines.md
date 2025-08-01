# Task Completion Guidelines

## After Making Code Changes

### 1. Manual Testing
Since there are no automated tests configured:
- **Start the server**: `npm run dev` or `npm start`
- **Test API endpoints**: Use browser or Postman to verify functionality
- **Test file upload**: Upload a sample Excel file to `/api/upload`
- **Test email sending**: Verify email functionality with test data
- **Check logs**: Monitor console output for errors

### 2. Code Validation
- **Syntax Check**: Ensure Node.js can parse the code without errors
- **Dependency Check**: Verify all required npm packages are installed
- **Environment Variables**: Confirm all required env vars are set

### 3. File Management
- **Clean up uploads**: Remove any test files from uploads/ directory
- **Check permissions**: Ensure uploads/ directory is writable
- **Verify file paths**: Confirm all file references use correct paths

### 4. Documentation Updates
- **Update comments**: Add/modify inline code comments if needed
- **Update memory files**: Use Serena's write_memory if architecture changes
- **Document new features**: Note any new functionality or API changes

### 5. Version Control (if applicable)
- **Review changes**: Check all modified files
- **Commit changes**: Use descriptive commit messages
- **Test after commit**: Verify the application still works after commit

## Pre-Deployment Checklist
- [ ] Server starts without errors
- [ ] All API endpoints respond correctly
- [ ] File upload and processing works
- [ ] Email configuration is valid
- [ ] Environment variables are set
- [ ] No sensitive data in code
- [ ] Console logs are appropriate level
- [ ] Error handling covers edge cases

## No Automated Tools Available
This project doesn't currently have:
- Linting tools (ESLint)
- Code formatting (Prettier)
- Automated testing (Jest, Mocha)
- Build processes
- Pre-commit hooks

Consider adding these tools for better code quality in future iterations.