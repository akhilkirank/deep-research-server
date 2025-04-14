// Simple script to test the Deep Research Server API
const fetch = require('node-fetch');

async function testApi() {
  console.log('Testing Deep Research Server API...');
  
  try {
    // Test the research/query endpoint
    const response = await fetch('http://localhost:3000/api/research/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'History of artificial intelligence',
        language: 'en-US',
        provider: 'google',
        model: 'gemini-1.5-flash',
        searchProvider: 'tavily',
        maxIterations: 1,
        maxResults: 3
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('API test successful!');
      console.log('Report preview (first 300 characters):');
      console.log(data.report.substring(0, 300) + '...');
    } else {
      console.error('API test failed with status:', response.status);
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Only run if executed directly
if (require.main === module) {
  testApi();
}

module.exports = { testApi };
