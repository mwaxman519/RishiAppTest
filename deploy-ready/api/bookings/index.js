module.exports = async function (context, req) {
  context.log('Bookings API request received');
  
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'GET') {
    // Return sample cannabis booking data
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: {
        bookings: [
          {
            id: "bkg_001",
            title: "Denver Dispensary Grand Opening",
            client: "Green Valley Dispensary",
            location: "Denver, CO",
            date: "2025-01-15",
            status: "confirmed",
            staffRequired: 8,
            budget: 2400
          },
          {
            id: "bkg_002", 
            title: "Portland Product Launch Event",
            client: "Emerald Coast Cannabis",
            location: "Portland, OR",
            date: "2025-01-22",
            status: "pending",
            staffRequired: 12,
            budget: 3600
          },
          {
            id: "bkg_003",
            title: "Seattle Cannabis Education Fair",
            client: "Pacific Northwest Cannabis",
            location: "Seattle, WA", 
            date: "2025-01-28",
            status: "confirmed",
            staffRequired: 15,
            budget: 4500
          }
        ],
        total: 3,
        timestamp: new Date().toISOString()
      }
    };
  } else if (req.method === 'POST') {
    // Handle booking creation
    const booking = req.body;
    context.res = {
      status: 201,
      headers: corsHeaders,
      body: {
        success: true,
        booking: {
          id: `bkg_${Date.now()}`,
          ...booking,
          status: "pending",
          createdAt: new Date().toISOString()
        }
      }
    };
  } else {
    context.res = {
      status: 405,
      headers: corsHeaders,
      body: { error: "Method not allowed" }
    };
  }
};