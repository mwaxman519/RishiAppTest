module.exports = async function (context, req) {
  context.log('Health check request received');
  
  context.res = {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: {
      status: "healthy",
      service: "Rishi Platform",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: "Azure Static Web Apps"
    }
  };
};