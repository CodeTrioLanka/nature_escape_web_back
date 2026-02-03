# User Activity Logging System - Implementation Summary

## ✅ What Was Implemented

A complete user activity logging system that tracks all admin and superadmin actions in the Nature Escape CMS.

## 📁 Files Created

### Models
- **`models/log.model.js`** - MongoDB schema for storing user activity logs

### Utilities
- **`utils/logger.js`** - Core logging functions:
  - `logAction()` - Log user actions
  - `getLogs()` - Retrieve logs with filtering/pagination
  - `cleanupOldLogs()` - Delete old logs

### Controllers
- **`controllers/log.controller.js`** - API controllers for log management:
  - `getLogsController` - Get logs with filters
  - `getLogStatsController` - Get statistics
  - `cleanupLogsController` - Cleanup old logs

### Routes
- **`route/log.route.js`** - API endpoints for logs

### Documentation
- **`USER_LOGGING_GUIDE.md`** - Complete documentation
- **`LOGGING_QUICK_REFERENCE.md`** - Quick reference for developers

## 🔧 Files Modified

### Models
- **`models/user.model.js`**
  - Added `username` field (optional)
  - Added `superadmin` to role enum

### Controllers
- **`controllers/auth.controller.js`**
  - Updated `/me` endpoint to return full user details (email, username)
  
- **`controllers/packages.controller.js`** *(Example Implementation)*
  - Added logging to `packageCreate`
  - Added logging to `packageEdit`
  - Added logging to `packageDelete`

### Middleware
- **`middleware/auth.js`**
  - Enhanced to fetch full user details from database
  - Added `authenticate` alias for `verifyToken`
  - Updated `isAdmin` to support `superadmin` role

### Main App
- **`index.js`**
  - Added log routes: `/api/logs`

## 🎯 Features

### Core Functionality
✅ Automatic logging of user actions  
✅ Tracks userId, username, role, action type, and details  
✅ Only logs admin and superadmin actions  
✅ Non-blocking (won't break main flow if logging fails)  
✅ Database indexes for efficient querying  

### API Endpoints
✅ `GET /api/logs` - Get logs with filtering and pagination  
✅ `GET /api/logs/stats` - Get statistics and analytics  
✅ `DELETE /api/logs/cleanup` - Cleanup old logs  

### Query Filters
✅ Filter by userId  
✅ Filter by action type  
✅ Filter by date range  
✅ Pagination support  

## 📊 Database Schema

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

## 🔌 API Endpoints

### Get Logs
```http
GET /api/logs?userId=xxx&action=xxx&startDate=xxx&endDate=xxx&page=1&limit=50
```

### Get Statistics
```http
GET /api/logs/stats?startDate=xxx&endDate=xxx
```

### Cleanup Old Logs
```http
DELETE /api/logs/cleanup?days=90
```

## 💡 Usage Example

```javascript
import { logAction } from "../utils/logger.js";

export const packageCreate = async (req, res) => {
  try {
    const pkg = await Package.create(packageData);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "CREATE_PACKAGE", {
        packageId: pkg._id,
        packageName: pkg.packageName,
        slug: pkg.slug
      });
    }
    
    res.status(201).json({ package: pkg });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

## 🚀 How to Use

### 1. For Developers Adding Logging to Controllers

```javascript
// 1. Import the logger
import { logAction } from "../utils/logger.js";

// 2. After successful operation, log it
if (req.user) {
  await logAction(req.user, "ACTION_NAME", {
    // relevant details
  });
}
```

### 2. For Admins Viewing Logs

**View all logs:**
```
GET http://localhost:5000/api/logs
```

**Filter by action:**
```
GET http://localhost:5000/api/logs?action=CREATE_PACKAGE
```

**View statistics:**
```
GET http://localhost:5000/api/logs/stats
```

## 📝 Action Naming Convention

Use SCREAMING_SNAKE_CASE:
- `CREATE_PACKAGE`
- `UPDATE_PACKAGE`
- `DELETE_PACKAGE`
- `UPDATE_HOME_PAGE`
- `APPROVE_REVIEW`
- etc.

## ✨ Example Implementation

The `packages.controller.js` has been updated with full logging implementation. Use it as a reference for adding logging to other controllers.

## 🔒 Security

- All log endpoints require authentication
- Only admin and superadmin actions are logged
- Sensitive data (passwords, tokens) should never be logged
- Logs include user identification for accountability

## 🧪 Testing

1. **Login** to get authentication cookies
2. **Perform an action** (create/update/delete a package)
3. **View logs**:
   ```
   GET http://localhost:5000/api/logs
   ```
4. **Verify** the log entry contains correct details

## 📚 Documentation

- **Complete Guide**: `USER_LOGGING_GUIDE.md`
- **Quick Reference**: `LOGGING_QUICK_REFERENCE.md`
- **Example**: `controllers/packages.controller.js`

## 🎯 Next Steps

### To Add Logging to Other Controllers:

1. Open the controller file
2. Import `logAction` from `../utils/logger.js`
3. Add logging after successful operations
4. Use the patterns in `LOGGING_QUICK_REFERENCE.md`

### Recommended Controllers to Update:
- [ ] `tours.controller.js`
- [ ] `servicePage.controller.js`
- [ ] `home.controller.js`
- [ ] `aboutUs.controller.js`
- [ ] `review.controller.js`
- [ ] `excursion.controller.js`
- [ ] `thingsToDo.controller.js`
- [ ] `contactUs.controller.js`

## 🛠️ Maintenance

### Automatic Cleanup (Optional)
Set up a cron job to clean old logs:
```javascript
import cron from 'node-cron';
import { cleanupOldLogs } from './utils/logger.js';

cron.schedule('0 2 * * *', async () => {
  await cleanupOldLogs(90); // Keep 90 days
});
```

### Manual Cleanup
```http
DELETE /api/logs/cleanup?days=30
```

## 🎉 Summary

The logging system is now fully functional and ready to use! It provides:
- ✅ Complete audit trail of admin actions
- ✅ Easy-to-use API for viewing logs
- ✅ Statistics and analytics
- ✅ Flexible filtering and pagination
- ✅ Non-intrusive integration
- ✅ Comprehensive documentation

For questions or issues, refer to `USER_LOGGING_GUIDE.md` or check the example implementation in `controllers/packages.controller.js`.
