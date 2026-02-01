# Review System - Sample Data & Testing Guide

## Sample Review Data

You can use this sample data to test the review system by adding reviews through the admin panel.

### Sample Admin Reviews

```json
[
  {
    "name": "Sarah Johnson",
    "email": "sarah.j@example.com",
    "rating": 5,
    "reviewText": "Absolutely amazing experience! The tour was well-organized, and our guide was incredibly knowledgeable. The scenery was breathtaking, and every detail was taken care of. Highly recommend Nature Scape for anyone looking for an unforgettable adventure!",
    "avatarUrl": "",
    "reviewDate": "2026-01-15T10:30:00Z"
  },
  {
    "name": "Michael Chen",
    "email": "m.chen@example.com",
    "rating": 5,
    "reviewText": "Best vacation we've ever had! The team at Nature Scape went above and beyond to make our trip special. From the booking process to the actual tour, everything was seamless. The wildlife safari was a dream come true!",
    "avatarUrl": "",
    "reviewDate": "2026-01-10T14:20:00Z"
  },
  {
    "name": "Emily Rodriguez",
    "email": "emily.r@example.com",
    "rating": 4,
    "reviewText": "Great experience overall! The accommodations were comfortable, and the itinerary was well-planned. Only minor suggestion would be to have more time at some of the scenic spots. But overall, a fantastic trip that I'd recommend to friends and family.",
    "avatarUrl": "",
    "reviewDate": "2026-01-05T09:15:00Z"
  },
  {
    "name": "David Thompson",
    "email": "d.thompson@example.com",
    "rating": 5,
    "reviewText": "Nature Scape delivered an exceptional experience from start to finish. The attention to detail, professional guides, and stunning locations made this trip unforgettable. Already planning our next adventure with them!",
    "avatarUrl": "",
    "reviewDate": "2025-12-28T16:45:00Z"
  },
  {
    "name": "Lisa Anderson",
    "email": "lisa.a@example.com",
    "rating": 5,
    "reviewText": "If you're looking for an authentic nature experience, look no further! The guides were passionate and knowledgeable, the locations were pristine, and the whole experience felt very personal and special. Worth every penny!",
    "avatarUrl": "",
    "reviewDate": "2025-12-20T11:30:00Z"
  }
]
```

## API Testing Guide

### 1. User Review Submission (Public)

**Endpoint:** `POST /api/reviews/submit`

```bash
# Using curl
curl -X POST http://localhost:YOUR_PORT/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "reviewText": "Amazing experience! Highly recommended."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thank you for your review! It will be published after approval.",
  "data": { ... }
}
```

### 2. Get Public Reviews

**Endpoint:** `GET /api/reviews/public`

```bash
# Get all approved reviews
curl http://localhost:YOUR_PORT/api/reviews/public

# With pagination
curl http://localhost:YOUR_PORT/api/reviews/public?page=1&limit=10

# Filter by rating
curl http://localhost:YOUR_PORT/api/reviews/public?rating=5
```

### 3. Admin - Add Review (Protected)

**Endpoint:** `POST /api/reviews/admin`

**Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

```bash
curl -X POST http://localhost:YOUR_PORT/api/reviews/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "rating": 5,
    "reviewText": "Absolutely amazing experience!",
    "reviewDate": "2026-01-15T10:30:00Z"
  }'
```

### 4. Admin - Get All Reviews (Protected)

**Endpoint:** `GET /api/reviews/all`

```bash
# Get all reviews
curl http://localhost:YOUR_PORT/api/reviews/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by source
curl http://localhost:YOUR_PORT/api/reviews/all?source=user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by approval status
curl http://localhost:YOUR_PORT/api/reviews/all?isApproved=false \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Admin - Approve Review (Protected)

**Endpoint:** `PATCH /api/reviews/:id/approve`

```bash
curl -X PATCH http://localhost:YOUR_PORT/api/reviews/REVIEW_ID/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Admin - Toggle Visibility (Protected)

**Endpoint:** `PATCH /api/reviews/:id/visibility`

```bash
curl -X PATCH http://localhost:YOUR_PORT/api/reviews/REVIEW_ID/visibility \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"isVisible": false}'
```

### 7. Admin - Sync Google Reviews (Protected)

**Endpoint:** `GET /api/reviews/google/sync`

```bash
curl http://localhost:YOUR_PORT/api/reviews/google/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** This requires valid Google Places API credentials in your `.env` file.

### 8. Get Review Statistics

**Endpoint:** `GET /api/reviews/stats`

```bash
curl http://localhost:YOUR_PORT/api/reviews/stats
```

## Google Places API Setup

### Step 1: Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Places API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

### Step 2: Find Your Google Place ID

**Method 1: Using Place ID Finder**
1. Go to [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Search for your business
3. Copy the Place ID

**Method 2: Using Google Maps**
1. Search for your business on Google Maps
2. Copy the URL
3. The Place ID is in the URL after `!1s` or use the Place ID Finder tool

### Step 3: Update .env File

```bash
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_PLACE_ID=ChIJXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 4: Test the Integration

```bash
# Sync Google reviews
curl http://localhost:YOUR_PORT/api/reviews/google/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Review Workflow

### User-Submitted Reviews
1. User submits review via website form
2. Review saved with `isApproved: false`
3. Admin reviews in admin panel
4. Admin approves → Review becomes public
5. Review appears on public website

### Admin-Curated Reviews
1. Admin adds review directly
2. Review saved with `isApproved: true`, `source: 'admin'`
3. Review immediately visible on public website

### Google Reviews
1. Admin triggers sync
2. System fetches reviews from Google Places API
3. New reviews added with `source: 'google'`, `isApproved: true`
4. Existing reviews updated if changed
5. All Google reviews immediately visible

## Database Schema

```javascript
{
  name: String,              // Reviewer name
  email: String,             // Optional email
  rating: Number,            // 1-5 stars
  reviewText: String,        // Review content
  source: String,            // 'google', 'user', 'admin'
  googleReviewId: String,    // For Google reviews
  isApproved: Boolean,       // Approval status
  isVisible: Boolean,        // Display control
  reviewDate: Date,          // Review date
  avatarUrl: String,         // Profile photo
  googleData: {              // Additional Google data
    authorUrl: String,
    relativeTimeDescription: String
  },
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

## Common Issues & Solutions

### Issue: Google API returns error
**Solution:** Check that:
- API key is valid
- Places API is enabled in Google Cloud Console
- Place ID is correct
- API key has no restrictions blocking the request

### Issue: Reviews not appearing publicly
**Solution:** Check that:
- `isVisible: true`
- `isApproved: true` (for user reviews)
- Review is not filtered by rating

### Issue: Cannot delete Google reviews
**Solution:** Google reviews cannot be deleted, only hidden. Use the visibility toggle instead.
