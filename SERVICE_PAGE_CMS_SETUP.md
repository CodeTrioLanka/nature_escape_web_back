# Service Page CMS - Backend Setup Complete ✅

## 📁 Files Created/Updated

### 1. **Model** - `models/service.model.js`
- Single document structure storing all service page data
- Two main sections:
  - `serviceheroes[]` - Hero section with image, title, subtitle, description
  - `services[]` - Service items with title, description, image

### 2. **Controller** - `controllers/servicePage.controller.js`
- `getData()` - Fetch all service page data
- `setData()` - Create new service page document
- `updateData()` - Update existing service page
- `deleteData()` - Delete service page and cleanup images
- Handles Cloudinary image uploads/deletions

### 3. **Routes** - `route/servicePage.route.js`
- `GET /api/service-page/getData` - Fetch service page data
- `POST /api/service-page/setData` - Create service page
- `PUT /api/service-page/:id` - Update service page
- `DELETE /api/service-page/:id` - Delete service page

### 4. **Main App** - `index.js`
- Registered `/api/service-page` endpoint

---

## 🚀 API Endpoints

### Base URL: `http://localhost:YOUR_PORT/api/service-page`

#### 1. **Get Service Page Data**
```http
GET /api/service-page/getData
```

**Response:**
```json
{
  "success": true,
  "message": "Service page data fetched successfully",
  "data": [
    {
      "_id": "...",
      "serviceheroes": [...],
      "services": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### 2. **Create Service Page**
```http
POST /api/service-page/setData
Content-Type: multipart/form-data
```

**Body (FormData):**
```javascript
{
  serviceheroes: [
    {
      heroImage: File,
      title: "Our Services",
      subtitle: "Nature Escape",
      description: "..."
    }
  ],
  services: [
    {
      title: "MICE",
      description: "...",
      image: File
    }
  ]
}
```

#### 3. **Update Service Page**
```http
PUT /api/service-page/:id
Content-Type: multipart/form-data or application/json
```

#### 4. **Delete Service Page**
```http
DELETE /api/service-page/:id
```

---

## 📊 Sample Data

Sample data file created: `sample_service_data.json`

To insert into MongoDB:
1. Use MongoDB Compass GUI
2. Use mongosh CLI
3. Use the API endpoint `/api/service-page/setData`

---

## 🎯 Next Steps for CMS Client

### Frontend Integration:

1. **Fetch Service Page Data:**
```javascript
const response = await fetch('http://localhost:PORT/api/service-page/getData');
const { data } = await response.json();
const servicePage = data[0]; // Get first (and only) document
```

2. **Update Service Page:**
```javascript
const formData = new FormData();
formData.append('serviceheroes', JSON.stringify([...]));
formData.append('services', JSON.stringify([...]));
// Add image files
formData.append('serviceheroes[0][heroImage]', imageFile);
formData.append('services[0][image]', imageFile);

await fetch(`http://localhost:PORT/api/service-page/${id}`, {
  method: 'PUT',
  body: formData
});
```

---

## ✨ Features

✅ Single document structure (like aboutUs)
✅ Image upload to Cloudinary
✅ Automatic old image deletion on update
✅ Full CRUD operations
✅ Support for both JSON and FormData
✅ Error handling and validation

---

## 🔧 Testing

Use tools like:
- **Postman** - API testing
- **MongoDB Compass** - Database viewing
- **Thunder Client** (VS Code) - Quick API tests

---

**Status:** Backend is ready! Server is running and endpoints are active. 🎉
