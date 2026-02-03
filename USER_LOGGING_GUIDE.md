# User Activity Logging System

## Overview
This logging system tracks all admin and superadmin actions in the Nature Escape CMS. It records who did what, when, and provides detailed information about each action.

## Features
- ✅ Automatic logging of user actions
- ✅ Tracks userId, username, role, action type, and details
- ✅ Only logs admin and superadmin actions
- ✅ Non-blocking (won't break main flow if logging fails)
- ✅ Query logs with filtering and pagination
- ✅ View statistics and analytics
- ✅ Automatic cleanup of old logs

## Architecture

### Files Created
1. **`models/log.model.js`** - MongoDB schema for logs
2. **`utils/logger.js`** - Logging utility functions
3. **`controllers/log.controller.js`** - API controllers for log management
4. **`route/log.route.js`** - API routes for logs

### Database Schema
```javascript
{
  userId: ObjectId,        // Reference to User
  username: String,        // User's email or username
  role: String,           // admin | superadmin
  action: String,         // Action type (e.g., "CREATE_PACKAGE")
  details: Object,        // Additional action details
  timestamp: Date,        // When the action occurred
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## Usage

### 1. Import the Logger
```javascript
import { logAction } from "../utils/logger.js";
```

### 2. Add Logging to Controller Actions

The `logAction` function requires:
- **user** - User object from `req.user` (must contain `sub`, `role`, and `email`/`username`)
- **action** - String describing the action (e.g., "CREATE_PACKAGE", "UPDATE_SERVICE")
- **details** - Object with additional information (optional)

#### Example: Create Action
```javascript
export const packageCreate = async (req, res) => {
  try {
    // ... your creation logic ...
    const pkg = await Package.create(packageData);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "CREATE_PACKAGE", {
        packageId: pkg._id,
        packageName: pkg.packageName,
        slug: pkg.slug,
        tourCategory: pkg.tourCategory
      });
    }
    
    res.status(201).json({ package: pkg, message: "Package created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

#### Example: Update Action
```javascript
export const packageEdit = async (req, res) => {
  try {
    // ... your update logic ...
    const pkg = await Package.findByIdAndUpdate(req.params.id, packageData, { new: true });
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "UPDATE_PACKAGE", {
        packageId: pkg._id,
        packageName: pkg.packageName,
        updatedFields: Object.keys(packageData)
      });
    }
    
    res.json({ package: pkg, message: "Package updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

#### Example: Delete Action
```javascript
export const packageDelete = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    // ... your deletion logic ...
    await Package.findByIdAndDelete(req.params.id);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "DELETE_PACKAGE", {
        packageId: pkg._id,
        packageName: pkg.packageName,
        slug: pkg.slug
      });
    }
    
    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### 3. Recommended Action Names

Use consistent, descriptive action names in SCREAMING_SNAKE_CASE:

**Packages:**
- `CREATE_PACKAGE`
- `UPDATE_PACKAGE`
- `DELETE_PACKAGE`

**Tours:**
- `CREATE_TOUR`
- `UPDATE_TOUR`
- `DELETE_TOUR`

**Services:**
- `CREATE_SERVICE`
- `UPDATE_SERVICE`
- `DELETE_SERVICE`

**Content Pages:**
- `UPDATE_HOME_PAGE`
- `UPDATE_ABOUT_PAGE`
- `UPDATE_CONTACT_PAGE`

**Reviews:**
- `APPROVE_REVIEW`
- `REJECT_REVIEW`
- `DELETE_REVIEW`

**User Management:**
- `CREATE_USER`
- `UPDATE_USER_ROLE`
- `DELETE_USER`

**Settings:**
- `UPDATE_SETTINGS`
- `CHANGE_PASSWORD`

## API Endpoints

### Get Logs
```http
GET /api/logs?userId=xxx&action=xxx&startDate=xxx&endDate=xxx&page=1&limit=50
```

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `action` (optional) - Filter by action type
- `startDate` (optional) - Filter logs after this date (ISO 8601)
- `endDate` (optional) - Filter logs before this date (ISO 8601)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "...",
      "userId": "...",
      "username": "admin@example.com",
      "role": "admin",
      "action": "CREATE_PACKAGE",
      "details": {
        "packageId": "...",
        "packageName": "Sigiriya Day Tour",
        "slug": "sigiriya-day-tour"
      },
      "timestamp": "2026-02-03T10:30:00.000Z",
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

### Get Log Statistics
```http
GET /api/logs/stats?startDate=xxx&endDate=xxx
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalLogs": 150,
    "topActions": [
      { "action": "UPDATE_PACKAGE", "count": 45 },
      { "action": "CREATE_PACKAGE", "count": 30 }
    ],
    "topUsers": [
      { "userId": "...", "username": "admin@example.com", "count": 75 },
      { "userId": "...", "username": "editor@example.com", "count": 50 }
    ]
  }
}
```

### Cleanup Old Logs
```http
DELETE /api/logs/cleanup?days=90
```

**Query Parameters:**
- `days` (optional) - Delete logs older than this many days (default: 90)

**Response:**
```json
{
  "success": true,
  "message": "Deleted 50 logs older than 90 days",
  "deletedCount": 50
}
```

## Authentication

All log endpoints require authentication. The user must be logged in and have a valid access token.

The `/me` endpoint has been updated to return full user information:
```javascript
{
  "user": {
    "id": "...",
    "sub": "...",      // For JWT compatibility
    "email": "admin@example.com",
    "username": "admin@example.com",  // Falls back to email if no username
    "role": "admin"
  }
}
```

## Integration Checklist

To add logging to a controller:

1. ✅ Import the logger: `import { logAction } from "../utils/logger.js";`
2. ✅ Ensure the route uses authentication middleware
3. ✅ After successful operation, call `logAction`:
   ```javascript
   if (req.user) {
     await logAction(req.user, "ACTION_NAME", { /* details */ });
   }
   ```
4. ✅ Use descriptive action names
5. ✅ Include relevant details (IDs, names, changed fields)

## Example: Complete Controller Integration

```javascript
import Tour from "../models/tours.model.js";
import { logAction } from "../utils/logger.js";

export const tourCreate = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "CREATE_TOUR", {
        tourId: tour._id,
        tourName: tour.name,
        category: tour.category
      });
    }
    
    res.status(201).json({ tour, message: "Tour created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const tourUpdate = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "UPDATE_TOUR", {
        tourId: tour._id,
        tourName: tour.name,
        updatedFields: Object.keys(req.body)
      });
    }
    
    res.json({ tour, message: "Tour updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const tourDelete = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    await Tour.findByIdAndDelete(req.params.id);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "DELETE_TOUR", {
        tourId: tour._id,
        tourName: tour.name
      });
    }
    
    res.json({ message: "Tour deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

## Testing

### Test with Postman

1. **Login first** to get authentication cookies
2. **Perform an action** (create/update/delete)
3. **View logs**:
   ```
   GET http://localhost:5000/api/logs
   ```

### Test Filtering
```
GET http://localhost:5000/api/logs?action=CREATE_PACKAGE&page=1&limit=10
```

### Test Statistics
```
GET http://localhost:5000/api/logs/stats
```

## Best Practices

1. **Always check `req.user`** before logging to prevent errors
2. **Use descriptive action names** that clearly indicate what happened
3. **Include relevant details** like IDs, names, and changed fields
4. **Don't log sensitive data** like passwords or tokens
5. **Keep details concise** - only include what's necessary for auditing
6. **Use consistent naming** - follow the SCREAMING_SNAKE_CASE convention

## Maintenance

### Automatic Cleanup
Set up a cron job to automatically clean up old logs:

```javascript
import cron from 'node-cron';
import { cleanupOldLogs } from './utils/logger.js';

// Run cleanup every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running log cleanup...');
  await cleanupOldLogs(90); // Keep 90 days of logs
});
```

### Manual Cleanup
```http
DELETE /api/logs/cleanup?days=30
```

## Troubleshooting

### Logs not appearing?
1. Check that the route has authentication middleware
2. Verify `req.user` exists and has the correct structure
3. Check console for any error messages from `logAction`
4. Ensure user role is 'admin' or 'superadmin'

### Database connection errors?
The logger automatically connects to the database, but ensure your MongoDB connection string is correct in `.env`.

### Performance concerns?
Logging is designed to be non-blocking. If logging fails, it won't affect the main operation. Consider:
- Regular cleanup of old logs
- Indexing on frequently queried fields (already implemented)
- Archiving very old logs to a separate collection

## Summary

The logging system is now fully integrated and ready to use. Simply:
1. Import `logAction` in your controllers
2. Call it after successful operations
3. View logs via the API endpoints
4. Monitor user activity and system usage

For questions or issues, refer to this guide or check the implementation in `controllers/packages.controller.js` for a working example.
