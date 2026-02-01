# Quick Reference - Review API Endpoints

## Public Endpoints (No Auth Required)

### 1. Submit Review
```
POST http://localhost:5000/api/reviews/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "rating": 5,
  "reviewText": "Amazing experience!"
}
```

### 2. Get Public Reviews
```
GET http://localhost:5000/api/reviews/public
GET http://localhost:5000/api/reviews/public?page=1&limit=10&rating=5
```

### 3. Get Statistics
```
GET http://localhost:5000/api/reviews/stats
```

---

## Admin Endpoints (Auth Required)

**Add to all requests:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Get All Reviews
```
GET http://localhost:5000/api/reviews/all
GET http://localhost:5000/api/reviews/all?source=user&isApproved=false
```

### 5. Add Admin Review
```
POST http://localhost:5000/api/reviews/admin
Content-Type: application/json

{
  "name": "Sarah Johnson",
  "rating": 5,
  "reviewText": "Curated testimonial"
}
```

### 6. Update Review
```
PUT http://localhost:5000/api/reviews/REVIEW_ID
Content-Type: application/json

{
  "name": "Updated Name",
  "rating": 4,
  "reviewText": "Updated text"
}
```

### 7. Delete Review
```
DELETE http://localhost:5000/api/reviews/REVIEW_ID
```

### 8. Approve Review
```
PATCH http://localhost:5000/api/reviews/REVIEW_ID/approve
```

### 9. Toggle Visibility
```
PATCH http://localhost:5000/api/reviews/REVIEW_ID/visibility
Content-Type: application/json

{
  "isVisible": false
}
```

### 10. Sync Google Reviews
```
GET http://localhost:5000/api/reviews/google/sync
```

---

## Getting Your Auth Token

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

Copy the `token` from response and use it in Authorization header.

---

## Quick Test Sequence

1. **Submit Review:** POST `/api/reviews/submit`
2. **Login:** POST `/api/auth/login` → Get token
3. **View All:** GET `/api/reviews/all` (with token)
4. **Approve:** PATCH `/api/reviews/ID/approve` (with token)
5. **Check Public:** GET `/api/reviews/public`
