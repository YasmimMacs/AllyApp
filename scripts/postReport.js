#!/usr/bin/env node

// Test script for POST /reports endpoint
// Usage: API_URL=https://your-api-url.com/dev node scripts/postReport.js

const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error('❌ Please set API_URL environment variable');
  console.error('Example: API_URL=https://rup8z25us6.execute-api.ap-southeast-2.amazonaws.com/dev node scripts/postReport.js');
  process.exit(1);
}

const sampleReport = {
  type: "lighting",
  text: "Poor lighting in the park area, feels unsafe at night",
  lat: -33.8688,  // Sydney coordinates
  lng: 151.2093,
  areaCode: "2000"
};

async function postReport() {
  try {
    console.log('📤 Posting sample report...');
    console.log('📍 Location: Sydney (-33.8688, 151.2093)');
    console.log('📝 Type:', sampleReport.type);
    console.log('🔗 API URL:', API_URL);
    
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleReport)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Report posted successfully!');
      console.log('🆔 ID:', data.id);
      console.log('📅 Created:', data.createdAt);
      console.log('📍 Location:', `${data.lat}, ${data.lng}`);
      console.log('📝 Type:', data.type);
    } else {
      console.error('❌ Failed to post report:', data.error || data.message);
      console.log('📊 Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error posting report:', error.message);
  }
}

postReport();
