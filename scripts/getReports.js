#!/usr/bin/env node

// Test script for GET /list-reports endpoint
// Usage: API_URL=https://your-api-url.com/dev node scripts/getReports.js

const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error('❌ Please set API_URL environment variable');
  console.error('Example: API_URL=https://rup8z25us6.execute-api.ap-southeast-2.amazonaws.com/dev node scripts/getReports.js');
  process.exit(1);
}

const queryParams = new URLSearchParams({
  lat: -33.8688,      // Sydney coordinates
  lng: 151.2093,
  radiusKm: 2,         // 2km radius
  days: 30,            // Last 30 days
  limit: 10            // Limit to 10 results
});

async function getReports() {
  try {
    console.log('📥 Fetching reports...');
    console.log('📍 Location: Sydney (-33.8688, 151.2093)');
    console.log('🔍 Radius: 2km');
    console.log('📅 Timeframe: Last 30 days');
    console.log('🔗 API URL:', API_URL);
    
    const response = await fetch(`${API_URL}/list-reports?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Reports fetched successfully!');
      console.log(`📊 Found ${data.items.length} reports`);
      
      if (data.items.length > 0) {
        console.log('\n📋 Recent Reports:');
        data.items.forEach((report, index) => {
          console.log(`\n${index + 1}. ${report.type.toUpperCase()}`);
          console.log(`   📝 ${report.text}`);
          console.log(`   📍 ${report.lat}, ${report.lng}`);
          console.log(`   📅 ${report.createdAt}`);
          if (report.areaCode) {
            console.log(`   🏷️  Area: ${report.areaCode}`);
          }
        });
      } else {
        console.log('📭 No reports found in the area');
      }
    } else {
      console.error('❌ Failed to fetch reports:', data.error || data.message);
      console.log('📊 Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error fetching reports:', error.message);
  }
}

getReports();
