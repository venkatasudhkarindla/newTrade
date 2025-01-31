const { createClient } = require('@supabase/supabase-js');

// Your Supabase URL and API key
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to validate API Key and get device information
const validateApiKey = async (apiKey) => {
  if (!apiKey) throw new Error('API key missing');

  // Validate API key against the AI_Devices table
  const { data, error } = await supabase
    .from('AI_Devices')
    .select('*')
    .eq('api_key', apiKey); // Check if the API key matches in the database
  
  if (error || !data || data.length === 0) {
    throw new Error('Invalid API key');
  }

  return data; // Returning the device data associated with the API key
};

// Function to fetch device data by API key
const getDeviceData = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']; // Extract API key from URL parameter
    console.log(apiKey)
    if (!apiKey) {
      return res.status(401).json({ success: false, message: "API key missing in URL" });
    }

    // Validate the API key and fetch device data
    const deviceData = await validateApiKey(apiKey);

    // Prepare the response data
    const responseData = deviceData.map(device => {
      const { ai_device_id, theater_id, screen_id, start_date, end_date } = device;
      return {
        ai_device_id,
        theater_id,
        screen_id,
        start_date,
        end_date
      };
    });

    // Respond with the device data
    res.status(200).json({
      status: "Ok",
      data: responseData // This will now be an array of objects if there are multiple records
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
  }
};

module.exports = { getDeviceData };
