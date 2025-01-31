const { createClient } = require('@supabase/supabase-js');

// Your Supabase URL and API key
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to validate API Key and get ai_device_id
const validateApiKey = async (apiKey) => {
  if (!apiKey) throw new Error('API key missing');

  // Validate API key against the AI_Devices table and get ai_device_id
  const { data, error } = await supabase
    .from('AI_Devices')
    .select('ai_device_id, api_key, theater_id, screen_id')
    .eq('api_key', apiKey)
    .single();
   console.log(data)
  if (error || !data) {
    throw new Error('Invalid API key');
  }

  return data; // Return device data
};

// Function to get equipment information based on theater_id and screen_id
const getEquipmentInfo = async (theaterId, screenId) => {
  const { data: equipment, error } = await supabase
    .from('Equipment')
    .select('equipment_id, eq_type, theater_id, screen_id')
    .eq('theater_id', theaterId)
    .eq('screen_id', screenId);
  console.log(equipment)
  if (error || !equipment) {
    throw new Error('No equipment found for the given theater and screen');
  }

  return equipment; // Return list of equipment associated with the theater_id and screen_id
};

// Function to get equipment modules based on equipment_id
const getEquipmentModules = async (equipmentIds) => {
  const { data: modules, error } = await supabase
    .from('Equipment_Moduels') // Ensure correct table name (it should be 'Equipment_Moduels')
    .select('module_name, topic_info, equipment_id')
    .in('equipment_id', equipmentIds); // Filter by the equipment_ids array

  if (error || !modules) {
    throw new Error('No modules found for the given equipment IDs');
  }

  return modules; // Return list of equipment modules
};

// Endpoint to fetch equipment data based on API key
const getEquipmentData = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']; // Extract API key from URL parameter

    if (!apiKey) {
      return res.status(401).json({ success: false, message: "API key missing in URL" });
    }

    // Validate the API key and fetch the ai_device_id and associated data
    const deviceData = await validateApiKey(apiKey);
    
    // Get equipment information based on theater_id and screen_id
    const equipmentInfo = await getEquipmentInfo(deviceData.theater_id, deviceData.screen_id);

    // Get a unique list of equipment_ids from the equipmentInfo
    const equipmentIds = [...new Set(equipmentInfo.map(eq => eq.equipment_id))];

    // Get the equipment modules for these equipment IDs
    const equipmentModules = await getEquipmentModules(equipmentIds);

    // Organize the equipment data into the desired response format
    const groupedData = equipmentInfo.reduce((acc, eq) => {
      // Filter modules that belong to this equipment
      const relatedModules = equipmentModules.filter(module => module.equipment_id === eq.equipment_id);

      // Check if this theater_id and screen_id already exists in the accumulator
      let theaterScreenGroup = acc.find(item => item.theater_id === eq.theater_id && item.screen_id === eq.screen_id);
      
      if (!theaterScreenGroup) {
        // If not, create a new group
        theaterScreenGroup = {
          theater_id: eq.theater_id,
          screen_id: eq.screen_id,
          theater_info: []
        };
        acc.push(theaterScreenGroup);
      }

      // Add equipment data to the theater_info
      relatedModules.forEach(module => {
        theaterScreenGroup.theater_info.push({
          equipment_id: eq.equipment_id,
          equipment_name: eq.eq_type,
          module_name: module.module_name,
          topic_name: module.topic_info
        });
      });

      return acc;
    }, []);

    // Send success response with the grouped data
    res.status(200).json({
      status: "Ok",
      data: groupedData
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
  }
};

module.exports = { getEquipmentData };
