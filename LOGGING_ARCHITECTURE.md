# User Activity Logging System - Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                               │
│                    (Admin/Superadmin User)                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION MIDDLEWARE                         │
│                    (middleware/auth.js)                              │
│                                                                       │
│  1. Verify JWT token from cookies                                   │
│  2. Fetch user details from database                                │
│  3. Attach to req.user:                                             │
│     - sub (user ID)                                                 │
│     - role (admin/superadmin)                                       │
│     - email                                                         │
│     - username                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CONTROLLER                                   │
│                  (e.g., packages.controller.js)                      │
│                                                                       │
│  export const packageCreate = async (req, res) => {                │
│    try {                                                            │
│      // 1. Perform the main operation                              │
│      const pkg = await Package.create(packageData);                │
│                                                                       │
│      // 2. Log the action                                          │
│      if (req.user) {                                               │
│        await logAction(req.user, "CREATE_PACKAGE", {               │
│          packageId: pkg._id,                                       │
│          packageName: pkg.packageName,                             │
│          slug: pkg.slug                                            │
│        });                                                          │
│      }                                                              │
│                                                                       │
│      // 3. Send response                                           │
│      res.status(201).json({ package: pkg });                       │
│    } catch (error) {                                               │
│      res.status(400).json({ error: error.message });              │
│    }                                                                │
│  };                                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LOGGER UTILITY                                 │
│                      (utils/logger.js)                               │
│                                                                       │
│  export async function logAction(user, action, details) {          │
│    // 1. Validate user object                                      │
│    if (!user || !user.sub) return;                                 │
│                                                                       │
│    // 2. Check role (only admin/superadmin)                        │
│    if (!["admin", "superadmin"].includes(user.role)) return;       │
│                                                                       │
│    // 3. Connect to database                                       │
│    await connectDB();                                              │
│                                                                       │
│    // 4. Create log entry                                          │
│    const log = new Log({                                           │
│      userId: user.sub,                                             │
│      username: user.email || user.username,                        │
│      role: user.role,                                              │
│      action,                                                        │
│      details                                                        │
│    });                                                              │
│                                                                       │
│    // 5. Save to database (non-blocking)                           │
│    await log.save();                                               │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB)                             │
│                      logs Collection                                 │
│                                                                       │
│  {                                                                  │
│    _id: ObjectId("..."),                                           │
│    userId: ObjectId("..."),                                        │
│    username: "admin@example.com",                                  │
│    role: "admin",                                                  │
│    action: "CREATE_PACKAGE",                                       │
│    details: {                                                      │
│      packageId: "...",                                             │
│      packageName: "Sigiriya Day Tour",                             │
│      slug: "sigiriya-day-tour"                                     │
│    },                                                              │
│    timestamp: ISODate("2026-02-03T10:30:00.000Z"),                │
│    createdAt: ISODate("2026-02-03T10:30:00.000Z"),                │
│    updatedAt: ISODate("2026-02-03T10:30:00.000Z")                 │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Viewing Logs Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                               │
│                  GET /api/logs?action=CREATE_PACKAGE                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION MIDDLEWARE                         │
│                      Verify user is logged in                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LOG CONTROLLER                                 │
│                  (controllers/log.controller.js)                     │
│                                                                       │
│  export const getLogsController = async (req, res) => {            │
│    const { action, userId, startDate, endDate, page, limit }       │
│      = req.query;                                                   │
│                                                                       │
│    const filters = { action, userId, startDate, endDate };         │
│    const result = await getLogs(filters, page, limit);             │
│                                                                       │
│    res.json({ success: true, ...result });                         │
│  };                                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LOGGER UTILITY                                 │
│                      (utils/logger.js)                               │
│                                                                       │
│  export async function getLogs(filters, page, limit) {             │
│    // Build query from filters                                     │
│    const query = {};                                               │
│    if (filters.action) query.action = filters.action;              │
│    if (filters.userId) query.userId = filters.userId;              │
│                                                                       │
│    // Fetch logs with pagination                                   │
│    const logs = await Log.find(query)                              │
│      .sort({ timestamp: -1 })                                      │
│      .skip((page - 1) * limit)                                     │
│      .limit(limit);                                                │
│                                                                       │
│    return { logs, pagination: {...} };                             │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE QUERY                                 │
│                                                                       │
│  db.logs.find({ action: "CREATE_PACKAGE" })                        │
│    .sort({ timestamp: -1 })                                        │
│    .skip(0)                                                         │
│    .limit(50)                                                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         RESPONSE TO CLIENT                           │
│                                                                       │
│  {                                                                  │
│    success: true,                                                  │
│    logs: [                                                         │
│      {                                                             │
│        userId: "...",                                              │
│        username: "admin@example.com",                              │
│        role: "admin",                                              │
│        action: "CREATE_PACKAGE",                                   │
│        details: { packageId: "...", packageName: "..." },          │
│        timestamp: "2026-02-03T10:30:00.000Z"                       │
│      }                                                             │
│    ],                                                              │
│    pagination: {                                                   │
│      total: 150,                                                   │
│      page: 1,                                                      │
│      limit: 50,                                                    │
│      pages: 3                                                      │
│    }                                                               │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                         MODELS                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  user.model.js │  │  log.model.js  │  │ package.model.js │  │
│  │                │  │                │  │                  │  │
│  │ - email        │  │ - userId       │  │ - packageName    │  │
│  │ - username     │  │ - username     │  │ - slug           │  │
│  │ - role         │  │ - role         │  │ - hero           │  │
│  │ - password     │  │ - action       │  │ - overview       │  │
│  └────────────────┘  │ - details      │  └──────────────────┘  │
│                      │ - timestamp    │                         │
│                      └────────────────┘                         │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ uses
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       UTILITIES                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  logger.js                                                  │ │
│  │                                                             │ │
│  │  - logAction(user, action, details)                        │ │
│  │  - getLogs(filters, page, limit)                           │ │
│  │  - cleanupOldLogs(daysToKeep)                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ used by
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CONTROLLERS                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ log.controller   │  │ packages.ctrl    │  │ tours.ctrl    │ │
│  │                  │  │                  │  │               │ │
│  │ - getLogs        │  │ - packageCreate  │  │ - tourCreate  │ │
│  │ - getStats       │  │   (logs action)  │  │   (logs)      │ │
│  │ - cleanup        │  │ - packageEdit    │  │ - tourEdit    │ │
│  └──────────────────┘  │   (logs action)  │  │   (logs)      │ │
│                        │ - packageDelete  │  │ - tourDelete  │ │
│                        │   (logs action)  │  │   (logs)      │ │
│                        └──────────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ exposed via
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         ROUTES                                    │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  log.route.js  │  │ packages.route   │  │  tours.route    │ │
│  │                │  │                  │  │                 │ │
│  │ GET /logs      │  │ POST /packages   │  │ POST /tours     │ │
│  │ GET /stats     │  │ PUT /packages/:id│  │ PUT /tours/:id  │ │
│  │ DELETE /cleanup│  │ DELETE /packages │  │ DELETE /tours   │ │
│  └────────────────┘  └──────────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               │
                               │ registered in
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         index.js                                  │
│                                                                   │
│  app.use('/api/logs', logRoute);                                 │
│  app.use('/api/packages', packagesRoute);                        │
│  app.use('/api/tours', toursRoute);                              │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Creating a Package

```
1. User Action
   └─> Admin clicks "Create Package" in frontend

2. HTTP Request
   └─> POST /api/packages
       Body: { packageName: "Sigiriya Tour", ... }
       Cookies: { accessToken: "..." }

3. Authentication
   └─> Middleware verifies token
   └─> Fetches user from database
   └─> Attaches to req.user

4. Controller Execution
   └─> packageCreate() runs
   └─> Creates package in database
   └─> Package saved successfully

5. Logging
   └─> logAction() called
   └─> Validates user (admin/superadmin)
   └─> Creates log document
   └─> Saves to logs collection

6. Response
   └─> Returns package data to client
   └─> Log saved in background (non-blocking)

7. View Logs Later
   └─> GET /api/logs?action=CREATE_PACKAGE
   └─> Returns all package creation logs
```

## Key Features

✅ **Non-Blocking**: Logging doesn't slow down main operations
✅ **Automatic**: Just call logAction() after operations
✅ **Filtered**: Query by user, action, date range
✅ **Paginated**: Handle large log volumes efficiently
✅ **Indexed**: Fast queries on userId, action, timestamp
✅ **Secure**: Only admin/superadmin actions logged
✅ **Detailed**: Captures who, what, when, and details
