/**
 * Test script for the User Activity Logging System
 * 
 * This script tests:
 * 1. Log creation
 * 2. Log retrieval with filters
 * 3. Log statistics
 * 
 * Prerequisites:
 * - Server must be running
 * - You must be logged in as admin/superadmin
 * - You need valid authentication cookies
 */

const BASE_URL = 'http://localhost:5000';

// Test 1: Create a test package (this will generate a log)
async function testCreatePackage() {
    console.log('\n📝 Test 1: Creating a package (will generate a log)...');

    const response = await fetch(`${BASE_URL}/api/packages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
            data: JSON.stringify({
                packageName: 'Test Package for Logging',
                slug: 'test-package-logging-' + Date.now(),
                hero: {
                    title: 'Test Package',
                    subtitle: 'Testing logging system'
                },
                overview: {
                    duration: '1 Day',
                    description: 'Test package to verify logging'
                }
            })
        })
    });

    const data = await response.json();
    console.log('Response:', data);
    return data.package?._id;
}

// Test 2: Get all logs
async function testGetLogs() {
    console.log('\n📋 Test 2: Fetching all logs...');

    const response = await fetch(`${BASE_URL}/api/logs`, {
        credentials: 'include'
    });

    const data = await response.json();
    console.log('Total logs:', data.pagination?.total);
    console.log('Recent logs:', data.logs?.slice(0, 3));
    return data;
}

// Test 3: Get logs filtered by action
async function testGetLogsByAction() {
    console.log('\n🔍 Test 3: Fetching logs filtered by CREATE_PACKAGE...');

    const response = await fetch(`${BASE_URL}/api/logs?action=CREATE_PACKAGE&limit=5`, {
        credentials: 'include'
    });

    const data = await response.json();
    console.log('CREATE_PACKAGE logs:', data.logs?.length);
    console.log('Sample log:', data.logs?.[0]);
    return data;
}

// Test 4: Get log statistics
async function testGetStats() {
    console.log('\n📊 Test 4: Fetching log statistics...');

    const response = await fetch(`${BASE_URL}/api/logs/stats`, {
        credentials: 'include'
    });

    const data = await response.json();
    console.log('Statistics:', data.stats);
    return data;
}

// Test 5: Test /me endpoint (should return user details)
async function testMeEndpoint() {
    console.log('\n👤 Test 5: Testing /me endpoint...');

    const response = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: 'include'
    });

    const data = await response.json();
    console.log('User details:', data.user);
    return data;
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting User Activity Logging System Tests...');
    console.log('='.repeat(60));

    try {
        // Test /me endpoint first
        await testMeEndpoint();

        // Create a package (generates a log)
        const packageId = await testCreatePackage();

        // Wait a bit for the log to be saved
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get all logs
        await testGetLogs();

        // Get filtered logs
        await testGetLogsByAction();

        // Get statistics
        await testGetStats();

        console.log('\n✅ All tests completed!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run tests
runTests();
