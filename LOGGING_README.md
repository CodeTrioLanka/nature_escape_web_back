# 📝 User Activity Logging System

A comprehensive logging system for tracking admin and superadmin actions in the Nature Escape CMS.

## 🎯 Quick Start

### 1. The logging system is already integrated! Just use it:

```javascript
import { logAction } from "../utils/logger.js";

export const yourController = async (req, res) => {
  try {
    // Your operation
    const item = await Model.create(data);
    
    // Log it
    if (req.user) {
      await logAction(req.user, "CREATE_ITEM", {
        itemId: item._id,
        itemName: item.name
      });
    }
    
    res.json({ item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### 2. View logs via API:

```bash
# Get all logs
GET http://localhost:5000/api/logs

# Filter by action
GET http://localhost:5000/api/logs?action=CREATE_PACKAGE

# Get statistics
GET http://localhost:5000/api/logs/stats
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[USER_LOGGING_GUIDE.md](./USER_LOGGING_GUIDE.md)** | Complete guide with examples, API docs, best practices |
| **[LOGGING_QUICK_REFERENCE.md](./LOGGING_QUICK_REFERENCE.md)** | Quick copy-paste templates for adding logging |
| **[LOGGING_ARCHITECTURE.md](./LOGGING_ARCHITECTURE.md)** | Visual diagrams and architecture overview |
| **[LOGGING_IMPLEMENTATION_SUMMARY.md](./LOGGING_IMPLEMENTATION_SUMMARY.md)** | What was implemented and next steps |

## 🚀 Features

- ✅ Automatic logging of admin/superadmin actions
- ✅ Tracks who, what, when, and details
- ✅ Non-blocking (won't slow down operations)
- ✅ Filter by user, action, date range
- ✅ Pagination support
- ✅ Statistics and analytics
- ✅ Automatic cleanup of old logs

## 📁 Files Structure

```
server/
├── models/
│   ├── log.model.js              # Log schema
│   └── user.model.js             # Updated with username field
├── utils/
│   └── logger.js                 # Core logging functions
├── controllers/
│   ├── log.controller.js         # Log management endpoints
│   └── packages.controller.js    # Example with logging
├── route/
│   └── log.route.js              # Log API routes
├── middleware/
│   └── auth.js                   # Enhanced auth middleware
└── Documentation/
    ├── USER_LOGGING_GUIDE.md
    ├── LOGGING_QUICK_REFERENCE.md
    ├── LOGGING_ARCHITECTURE.md
    └── LOGGING_IMPLEMENTATION_SUMMARY.md
```

## 🔌 API Endpoints

### Get Logs
```http
GET /api/logs?userId=xxx&action=xxx&startDate=xxx&endDate=xxx&page=1&limit=50
```

### Get Statistics
```http
GET /api/logs/stats
```

### Cleanup Old Logs
```http
DELETE /api/logs/cleanup?days=90
```

## 💡 Usage Examples

### Create Action
```javascript
const pkg = await Package.create(packageData);

if (req.user) {
  await logAction(req.user, "CREATE_PACKAGE", {
    packageId: pkg._id,
    packageName: pkg.packageName,
    slug: pkg.slug
  });
}
```

### Update Action
```javascript
const pkg = await Package.findByIdAndUpdate(id, data, { new: true });

if (req.user) {
  await logAction(req.user, "UPDATE_PACKAGE", {
    packageId: pkg._id,
    packageName: pkg.packageName,
    updatedFields: Object.keys(data)
  });
}
```

### Delete Action
```javascript
const pkg = await Package.findById(id);
await Package.findByIdAndDelete(id);

if (req.user) {
  await logAction(req.user, "DELETE_PACKAGE", {
    packageId: pkg._id,
    packageName: pkg.packageName
  });
}
```

## 🧪 Testing

### Using Postman
1. Import `Logging_System_Postman_Collection.json`
2. Login to get authentication cookies
3. Test the endpoints

### Using Test Script
```bash
node test-logging-system.js
```

## 📊 Example Log Entry

```json
{
  "_id": "65c1234567890abcdef12345",
  "userId": "65c0987654321fedcba09876",
  "username": "admin@example.com",
  "role": "admin",
  "action": "CREATE_PACKAGE",
  "details": {
    "packageId": "65c1111111111111111111111",
    "packageName": "Sigiriya Day Tour",
    "slug": "sigiriya-day-tour",
    "tourCategory": "65c2222222222222222222222"
  },
  "timestamp": "2026-02-03T10:30:00.000Z",
  "createdAt": "2026-02-03T10:30:00.000Z",
  "updatedAt": "2026-02-03T10:30:00.000Z"
}
```

## 🎯 Action Naming Convention

Use SCREAMING_SNAKE_CASE:

**Packages:**
- `CREATE_PACKAGE`, `UPDATE_PACKAGE`, `DELETE_PACKAGE`

**Tours:**
- `CREATE_TOUR`, `UPDATE_TOUR`, `DELETE_TOUR`

**Services:**
- `CREATE_SERVICE`, `UPDATE_SERVICE`, `DELETE_SERVICE`

**Content:**
- `UPDATE_HOME_PAGE`, `UPDATE_ABOUT_PAGE`, `UPDATE_CONTACT_PAGE`

**Reviews:**
- `APPROVE_REVIEW`, `REJECT_REVIEW`, `DELETE_REVIEW`

## ✅ Integration Checklist

To add logging to a controller:

1. [ ] Import logger: `import { logAction } from "../utils/logger.js";`
2. [ ] Ensure route has authentication middleware
3. [ ] After successful operation, call:
   ```javascript
   if (req.user) {
     await logAction(req.user, "ACTION_NAME", { details });
   }
   ```
4. [ ] Use descriptive action name
5. [ ] Include relevant details (ID, name, etc.)

## 🔒 Security

- All log endpoints require authentication
- Only admin and superadmin actions are logged
- Sensitive data (passwords, tokens) are never logged
- Logs include user identification for accountability

## 🛠️ Maintenance

### Automatic Cleanup (Optional)
```javascript
import cron from 'node-cron';
import { cleanupOldLogs } from './utils/logger.js';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await cleanupOldLogs(90); // Keep 90 days
});
```

### Manual Cleanup
```http
DELETE /api/logs/cleanup?days=30
```

## 📝 Next Steps

### Controllers to Update:
- [ ] tours.controller.js
- [ ] servicePage.controller.js
- [ ] home.controller.js
- [ ] aboutUs.controller.js
- [ ] review.controller.js
- [ ] excursion.controller.js
- [ ] thingsToDo.controller.js
- [ ] contactUs.controller.js

Use the templates in `LOGGING_QUICK_REFERENCE.md` for easy integration.

## 🆘 Troubleshooting

### Logs not appearing?
1. Check that route has authentication middleware
2. Verify `req.user` exists
3. Check console for error messages
4. Ensure user role is 'admin' or 'superadmin'

### Database errors?
Ensure MongoDB connection string is correct in `.env`

### Performance issues?
- Regular cleanup of old logs
- Indexes are already implemented
- Logging is non-blocking

## 📖 Learn More

- **Complete Guide**: [USER_LOGGING_GUIDE.md](./USER_LOGGING_GUIDE.md)
- **Quick Reference**: [LOGGING_QUICK_REFERENCE.md](./LOGGING_QUICK_REFERENCE.md)
- **Architecture**: [LOGGING_ARCHITECTURE.md](./LOGGING_ARCHITECTURE.md)
- **Implementation**: [LOGGING_IMPLEMENTATION_SUMMARY.md](./LOGGING_IMPLEMENTATION_SUMMARY.md)

## 🎉 Summary

The logging system is fully functional and ready to use! It provides:
- Complete audit trail of admin actions
- Easy-to-use API for viewing logs
- Statistics and analytics
- Flexible filtering and pagination
- Non-intrusive integration
- Comprehensive documentation

**Example implementation**: See `controllers/packages.controller.js`

---

**Need help?** Check the documentation files or the example implementation in `packages.controller.js`.
