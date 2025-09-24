# MongoDB Connection Check Command

## Overview

The MongoDB connection check command allows you to test your MongoDB connection without triggering connections during the build process. This is similar to the existing Google Sheets check command.

## Usage

```bash
npm run check:mongodb
```

## What It Checks

The command performs comprehensive MongoDB connection testing:

### 1. **Environment Validation**
- ✅ Verifies `MONGODB_URI` environment variable exists
- ✅ Validates MongoDB URI format (`mongodb://` or `mongodb+srv://`)
- ✅ Shows connection details (with credentials masked)

### 2. **Connection Testing**
- ✅ Establishes connection to MongoDB
- ✅ Tests database ping functionality
- ✅ Verifies database access permissions

### 3. **Database Operations**
- ✅ Lists existing collections
- ✅ Tests write access (creates test document)
- ✅ Tests read access (reads test document)
- ✅ Cleans up test data

### 4. **Error Handling**
- ✅ Provides detailed error messages
- ✅ Offers troubleshooting hints based on error type
- ✅ Handles authentication, network, and SSL issues

## Example Output

```
=== MongoDB Connection Check ===

» MongoDB URI:               mongodb+srv://***:***@cluster0.bz27cmw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
» Environment:               development

Connecting to MongoDB...
✔ Connected successfully
Testing database access...
✔ Database ping successful
Checking collections...
» Collections found:         2
  - schema_definitions
  - forms
Testing write access...
✔ Write test successful
Testing read access...
✔ Read test successful
✔ Cleanup successful

All checks passed. ✅
```

## Troubleshooting

The command provides specific hints for common issues:

### Authentication Errors
- Check MongoDB username and password
- Ensure user has proper permissions

### Network/Timeout Errors
- Check network connection
- Verify MongoDB server is running
- For MongoDB Atlas, check IP whitelist settings

### SSL/TLS Errors
- For MongoDB Atlas, ensure using `mongodb+srv://`
- Check MongoDB Atlas cluster status

## Benefits

1. **Faster Builds**: MongoDB connections no longer happen during build
2. **Better Debugging**: Dedicated command for connection testing
3. **Comprehensive Testing**: Tests all aspects of MongoDB connectivity
4. **Clear Error Messages**: Detailed troubleshooting guidance
5. **Safe Testing**: Creates and cleans up test data automatically

## Integration with Development Workflow

Use this command:
- Before deploying to verify MongoDB connectivity
- When debugging connection issues
- As part of your CI/CD pipeline
- When setting up the project for the first time

The command is safe to run multiple times and won't leave any test data in your database.
