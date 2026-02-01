# Postman Testing Guide - Review System

Complete guide to test all review API endpoints using Postman.

---

## Setup

### Base URL
```
http://localhost:5000/api/reviews
```

### Authentication (For Admin Endpoints)

1. First, login to get your JWT token:
   - **POST** `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "your_admin_email@example.com",
       "password": "your_password"
     }
     ```
   - Copy the `token` from the response

2. For protected endpoints, add header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE`

---

## 1. Submit User Review (Public)

**No authentication required**

### Request
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/reviews/submit`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "reviewText": "Amazing experience! The tour was well-organized and the scenery was breathtaking. Highly recommend Nature Scape!"
  }
  ```

### Expected Response (201)
```json
{
  "success": true,
  "message": "Thank you for your review! It will be published after approval.",
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "reviewText": "Amazing experience!...",
    "source": "user",
    "isApproved": false,
    "isVisible": true,
    "reviewDate": "2026-02-01T08:01:44.000Z",
    "createdAt": "2026-02-01T08:01:44.000Z",
    "updatedAt": "2026-02-01T08:01:44.000Z"
  }
}
```

---

## 2. Get Public Reviews

**No authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reviews/public`

### Optional Query Parameters
```
http://localhost:5000/api/reviews/public?page=1&limit=10&rating=5
```
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `rating` - Filter by rating (1-5)

### Expected Response (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123...",
      "name": "Sarah Johnson",
      "rating": 5,
      "reviewText": "Absolutely amazing!",
      "source": "admin",
      "isApproved": true,
      "isVisible": true,
      "reviewDate": "2026-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

---

## 3. Get Review Statistics

**No authentication required**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reviews/stats`

### Expected Response (200)
```json
{
  "success": true,
  "data": {
    "totalReviews": 25,
    "averageRating": 4.8,
    "ratingDistribution": [
      { "_id": 5, "count": 20 },
      { "_id": 4, "count": 4 },
      { "_id": 3, "count": 1 }
    ]
  }
}
```

---

## 4. Get All Reviews (Admin)

**Requires authentication**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reviews/all`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

### Optional Query Parameters
```
http://localhost:5000/api/reviews/all?source=user&isApproved=false&page=1&limit=20
```
- `source` - Filter by source: `google`, `user`, or `admin`
- `isApproved` - Filter by approval: `true` or `false`
- `page` - Page number
- `limit` - Items per page

### Expected Response (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 5,
      "reviewText": "Amazing experience!",
      "source": "user",
      "isApproved": false,
      "isVisible": true,
      "reviewDate": "2026-02-01T08:01:44.000Z",
      "createdAt": "2026-02-01T08:01:44.000Z",
      "updatedAt": "2026-02-01T08:01:44.000Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 20,
    "pages": 2
  },
  "stats": {
    "bySource": [
      { "_id": "user", "count": 15, "avgRating": 4.5 },
      { "_id": "admin", "count": 10, "avgRating": 5 },
      { "_id": "google", "count": 5, "avgRating": 4.8 }
    ],
    "pendingApproval": 8
  }
}
```

---

## 5. Add Admin Review (Admin)

**Requires authentication**

### Request
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/reviews/admin`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "rating": 5,
    "reviewText": "Absolutely amazing experience! The tour was well-organized, and our guide was incredibly knowledgeable. The scenery was breathtaking!",
    "avatarUrl": "https://example.com/avatar.jpg",
    "reviewDate": "2026-01-15T10:30:00Z"
  }
  ```

### Field Details
- `name` - **Required** - Reviewer name
- `email` - Optional - Email address
- `rating` - **Required** - Rating (1-5)
- `reviewText` - **Required** - Review content
- `avatarUrl` - Optional - Profile photo URL
- `reviewDate` - Optional - Custom review date (defaults to now)

### Expected Response (201)
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "_id": "65abc456...",
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "rating": 5,
    "reviewText": "Absolutely amazing experience!...",
    "source": "admin",
    "isApproved": true,
    "isVisible": true,
    "reviewDate": "2026-01-15T10:30:00.000Z",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

---

## 6. Update Review (Admin)

**Requires authentication**

### Request
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/reviews/REVIEW_ID_HERE`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Sarah Johnson Updated",
    "rating": 4,
    "reviewText": "Updated review text",
    "isVisible": true
  }
  ```

### Notes
- Replace `REVIEW_ID_HERE` with actual review `_id`
- Cannot edit Google reviews
- Only include fields you want to update

### Expected Response (200)
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "65abc456...",
    "name": "Sarah Johnson Updated",
    "rating": 4,
    "reviewText": "Updated review text",
    "isVisible": true
  }
}
```

---

## 7. Delete Review (Admin)

**Requires authentication**

### Request
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/reviews/REVIEW_ID_HERE`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

### Notes
- Replace `REVIEW_ID_HERE` with actual review `_id`
- Cannot delete Google reviews (use visibility toggle instead)

### Expected Response (200)
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## 8. Approve Review (Admin)

**Requires authentication**

### Request
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/reviews/REVIEW_ID_HERE/approve`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "isApproved": true,
    "isVisible": true
  }
}
```

---

## 9. Toggle Visibility (Admin)

**Requires authentication**

### Request
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/reviews/REVIEW_ID_HERE/visibility`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- **Body (raw JSON):**
  ```json
  {
    "isVisible": false
  }
  ```

### Notes
- Set `isVisible` to `true` to show, `false` to hide
- Omit body to toggle current state

### Expected Response (200)
```json
{
  "success": true,
  "message": "Review visibility updated",
  "data": {
    "_id": "65abc123...",
    "isVisible": false
  }
}
```

---

## 10. Sync Google Reviews (Admin)

**Requires authentication & Google API setup**

### Request
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reviews/google/sync`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

### Prerequisites
- Google Places API key configured in `.env`
- Google Place ID configured in `.env`

### Expected Response (200)
```json
{
  "success": true,
  "message": "Google reviews synced successfully",
  "data": {
    "total": 10,
    "new": 3,
    "updated": 7,
    "errors": 0
  }
}
```

---

## Quick Testing Workflow

### Step 1: Submit a User Review
```
POST /api/reviews/submit
```

### Step 2: Login as Admin
```
POST /api/auth/login
```
Copy the token from response.

### Step 3: View All Reviews (Including Pending)
```
GET /api/reviews/all
Headers: Authorization: Bearer YOUR_TOKEN
```

### Step 4: Approve the Review
```
PATCH /api/reviews/REVIEW_ID/approve
Headers: Authorization: Bearer YOUR_TOKEN
```

### Step 5: Check Public Reviews
```
GET /api/reviews/public
```
The approved review should now appear.

---

## Postman Collection Setup

### Create a Collection

1. **Create New Collection:** "Nature Scape Reviews"

2. **Add Environment Variables:**
   - `base_url`: `http://localhost:5000`
   - `token`: (will be set after login)

3. **Use Variables in Requests:**
   - URL: `{{base_url}}/api/reviews/submit`
   - Header: `Authorization: Bearer {{token}}`

### Pre-request Script (For Auth)

Add this to requests that need auth:

```javascript
pm.environment.set("token", pm.response.json().token);
```

---

## Common Errors

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```
**Solution:** Add Authorization header with valid token.

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name, rating, and review text are required"
}
```
**Solution:** Check that all required fields are included.

### 403 Forbidden
```json
{
  "success": false,
  "message": "Cannot edit Google reviews"
}
```
**Solution:** Google reviews cannot be edited or deleted.

### 404 Not Found
```json
{
  "success": false,
  "message": "Review not found"
}
```
**Solution:** Check that the review ID is correct.

---

## Tips

1. **Save Requests:** Save all requests in a Postman collection for reuse

2. **Use Variables:** Store `base_url` and `token` as environment variables

3. **Test in Order:** 
   - First test public endpoints (no auth)
   - Then test admin endpoints (with auth)

4. **Copy IDs:** After creating a review, copy its `_id` for update/delete tests

5. **Check Response:** Always check the response status and body

6. **Use Postman Console:** View detailed request/response in console (View → Show Postman Console)

---

## Sample Test Data

### User Review
```json
{
  "name": "Emily Rodriguez",
  "email": "emily@example.com",
  "rating": 5,
  "reviewText": "Best vacation ever! The team went above and beyond."
}
```

### Admin Review
```json
{
  "name": "Michael Chen",
  "rating": 5,
  "reviewText": "Exceptional service and breathtaking locations!",
  "reviewDate": "2026-01-20T14:30:00Z"
}
```

---

## Next Steps

1. ✅ Test all public endpoints first
2. ✅ Get admin token via login
3. ✅ Test all admin endpoints
4. ✅ Try different query parameters
5. ✅ Test error cases (missing fields, invalid IDs, etc.)
6. ✅ Set up Google API and test sync (optional)

Happy testing! 🚀
