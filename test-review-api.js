// Quick API Test Script for Review System
// Run with: node test-review-api.js

const API_BASE = 'http://localhost:5000/api/reviews';

// Test 1: Submit a user review
async function testSubmitReview() {
    console.log('\n📝 Testing: Submit User Review');
    try {
        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                rating: 5,
                reviewText: 'This is a test review from the API test script!'
            })
        });
        const data = await response.json();
        console.log('✅ Response:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 2: Get public reviews
async function testGetPublicReviews() {
    console.log('\n📖 Testing: Get Public Reviews');
    try {
        const response = await fetch(`${API_BASE}/public`);
        const data = await response.json();
        console.log('✅ Response:', data);
        console.log(`   Found ${data.data?.length || 0} reviews`);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 3: Get review statistics
async function testGetStats() {
    console.log('\n📊 Testing: Get Review Statistics');
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        console.log('✅ Response:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting Review API Tests...');
    console.log('📍 API Base URL:', API_BASE);

    await testSubmitReview();
    await testGetPublicReviews();
    await testGetStats();

    console.log('\n✨ Tests completed!\n');
}

runTests();
