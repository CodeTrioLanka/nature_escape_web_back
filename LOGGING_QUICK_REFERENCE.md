# Quick Reference: Adding Logging to Controllers

## Step-by-Step Guide

### 1. Import the Logger
At the top of your controller file:
```javascript
import { logAction } from "../utils/logger.js";
```

### 2. Add Logging After Successful Operations

#### Pattern for CREATE operations:
```javascript
export const createItem = async (req, res) => {
  try {
    const item = await Model.create(req.body);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "CREATE_ITEM", {
        itemId: item._id,
        itemName: item.name,
        // Add other relevant fields
      });
    }
    
    res.status(201).json({ item, message: "Item created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

#### Pattern for UPDATE operations:
```javascript
export const updateItem = async (req, res) => {
  try {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "UPDATE_ITEM", {
        itemId: item._id,
        itemName: item.name,
        updatedFields: Object.keys(req.body)
      });
    }
    
    res.json({ item, message: "Item updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

#### Pattern for DELETE operations:
```javascript
export const deleteItem = async (req, res) => {
  try {
    const item = await Model.findById(req.params.id);
    await Model.findByIdAndDelete(req.params.id);
    
    // Log the action
    if (req.user) {
      await logAction(req.user, "DELETE_ITEM", {
        itemId: item._id,
        itemName: item.name
      });
    }
    
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

## Common Action Names

| Controller | Create | Update | Delete | Other |
|------------|--------|--------|--------|-------|
| Packages | CREATE_PACKAGE | UPDATE_PACKAGE | DELETE_PACKAGE | - |
| Tours | CREATE_TOUR | UPDATE_TOUR | DELETE_TOUR | - |
| Services | CREATE_SERVICE | UPDATE_SERVICE | DELETE_SERVICE | - |
| Reviews | CREATE_REVIEW | UPDATE_REVIEW | DELETE_REVIEW | APPROVE_REVIEW, REJECT_REVIEW |
| Home Page | - | UPDATE_HOME_PAGE | - | - |
| About Page | - | UPDATE_ABOUT_PAGE | - | - |
| Contact | - | UPDATE_CONTACT_PAGE | - | - |
| Users | CREATE_USER | UPDATE_USER | DELETE_USER | UPDATE_USER_ROLE |

## What to Include in Details

### Minimum (Always Include):
- Primary ID (e.g., `itemId`, `packageId`, `tourId`)
- Name/Title (e.g., `itemName`, `packageName`, `tourName`)

### Optional (When Relevant):
- Slug
- Category
- Status changes
- Updated fields (for updates)
- Related IDs (e.g., `tourCategory`)

### Example:
```javascript
{
  packageId: pkg._id,
  packageName: pkg.packageName,
  slug: pkg.slug,
  tourCategory: pkg.tourCategory,
  updatedFields: ["hero", "overview", "itinerary"]
}
```

## Checklist

Before deploying a controller with logging:

- [ ] Imported `logAction` from `../utils/logger.js`
- [ ] Added `if (req.user)` check before logging
- [ ] Used descriptive SCREAMING_SNAKE_CASE action name
- [ ] Included minimum details (ID and name)
- [ ] Placed logging AFTER successful operation
- [ ] Route has authentication middleware

## Testing

1. Login to get authentication
2. Perform the action (create/update/delete)
3. Check logs:
   ```
   GET http://localhost:5000/api/logs
   ```
4. Verify log entry contains correct details

## Example: Complete Controller

```javascript
import Service from "../models/service.model.js";
import { logAction } from "../utils/logger.js";

export const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    
    if (req.user) {
      await logAction(req.user, "CREATE_SERVICE", {
        serviceId: service._id,
        serviceName: service.name,
        category: service.category
      });
    }
    
    res.status(201).json({ service, message: "Service created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (req.user) {
      await logAction(req.user, "UPDATE_SERVICE", {
        serviceId: service._id,
        serviceName: service.name,
        updatedFields: Object.keys(req.body)
      });
    }
    
    res.json({ service, message: "Service updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    await Service.findByIdAndDelete(req.params.id);
    
    if (req.user) {
      await logAction(req.user, "DELETE_SERVICE", {
        serviceId: service._id,
        serviceName: service.name
      });
    }
    
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

## Need Help?

See `USER_LOGGING_GUIDE.md` for complete documentation or check `controllers/packages.controller.js` for a working example.
