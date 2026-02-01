import axios from 'axios';

class GooglePlacesService {
    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
        this.placeId = process.env.GOOGLE_PLACE_ID;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    }

    /**
     * Fetch reviews from Google Places API
     * @returns {Promise<Array>} Array of reviews
     */
    async fetchGoogleReviews() {
        try {
            if (!this.apiKey || !this.placeId) {
                console.warn('Google Places API credentials not configured');
                return [];
            }

            const url = `${this.baseUrl}/details/json`;
            const params = {
                place_id: this.placeId,
                fields: 'reviews,rating,user_ratings_total',
                key: this.apiKey
            };

            const response = await axios.get(url, { params });

            if (response.data.status !== 'OK') {
                throw new Error(`Google Places API error: ${response.data.status}`);
            }

            const reviews = response.data.result?.reviews || [];

            // Transform Google reviews to our schema format
            return reviews.map(review => this.transformGoogleReview(review));
        } catch (error) {
            console.error('Error fetching Google reviews:', error.message);
            throw error;
        }
    }

    /**
     * Transform Google review format to our schema
     * @param {Object} googleReview - Raw Google review object
     * @returns {Object} Transformed review object
     */
    transformGoogleReview(googleReview) {
        return {
            name: googleReview.author_name,
            rating: googleReview.rating,
            reviewText: googleReview.text || 'No review text provided',
            source: 'google',
            googleReviewId: googleReview.time.toString(), // Use timestamp as unique ID
            isApproved: true,
            isVisible: true,
            reviewDate: new Date(googleReview.time * 1000), // Convert Unix timestamp
            avatarUrl: googleReview.profile_photo_url || '',
            googleData: {
                authorUrl: googleReview.author_url,
                relativeTimeDescription: googleReview.relative_time_description
            }
        };
    }

    /**
     * Get place details including overall rating
     * @returns {Promise<Object>} Place details
     */
    async getPlaceDetails() {
        try {
            if (!this.apiKey || !this.placeId) {
                return null;
            }

            const url = `${this.baseUrl}/details/json`;
            const params = {
                place_id: this.placeId,
                fields: 'name,rating,user_ratings_total,formatted_address',
                key: this.apiKey
            };

            const response = await axios.get(url, { params });

            if (response.data.status === 'OK') {
                return response.data.result;
            }

            return null;
        } catch (error) {
            console.error('Error fetching place details:', error.message);
            return null;
        }
    }
}

export default new GooglePlacesService();
