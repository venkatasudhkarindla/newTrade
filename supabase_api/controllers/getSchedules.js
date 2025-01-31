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

// Function to get the show IDs from the MovieShows table based on theater_id and screen_id
const getShowIds = async (theaterId, screenId) => {
  const { data: shows, error } = await supabase
    .from('MovieShow')
    .select('show_id')
    .eq('theater_id', theaterId)
    .eq('screen_id', screenId);
   console.log(shows)
  if (error || !shows) {
    throw new Error('No shows found for this theater and screen');
  }

  return shows.map(show => show.show_id); // Return an array of show_ids
};

// Function to get equipment schedules based on show_ids
const getEquipmentSchedules = async (showIds) => {
  const { data: schedules, error } = await supabase
    .from('EquipmentSchedules')
    .select('equipment_id, start_time, end_time, show_id')
    .in('show_id', showIds)
    .order('show_id', { ascending: true });
     // Filter by the show_ids array
   console.log(schedules)
  if (error || !schedules) {
    throw new Error('No schedules found for the given show IDs');
  }

  return schedules; // Return schedules
};

// Function to get equipment types based on equipment_ids
const getEquipmentTypes = async (equipmentIds) => {
  const { data: equipment, error } = await supabase
    .from('Equipment')
    .select('equipment_id, eq_type')
    .in('equipment_id', equipmentIds); // Filter by the equipment_ids array

  if (error || !equipment) {
    throw new Error('No equipment types found for the given equipment IDs');
  }

  const equipmentMap = equipment.reduce((acc, eq) => {
    acc[eq.equipment_id] = eq.eq_type;
    return acc;
  }, {});

  return equipmentMap; // Return a map of equipment_id to eq_type
};

// Endpoint to fetch schedules based on API key
const getSchedules = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']; // Extract API key from URL parameter

    if (!apiKey) {
      return res.status(401).json({ success: false, message: "API key missing in URL" });
    }

    // Validate the API key and fetch the ai_device_id and associated data
    const deviceData = await validateApiKey(apiKey);
    
    // Get the show IDs for the given theater_id and screen_id
    const showIds = await getShowIds(deviceData.theater_id, deviceData.screen_id);
    
    // Get equipment schedules for these show IDs
    const schedules = await getEquipmentSchedules(showIds);

    // Get a unique list of equipment_ids from the schedules
    const equipmentIds = [...new Set(schedules.map(schedule => schedule.equipment_id))];

    // Get the equipment types for these equipment IDs
    const equipmentTypes = await getEquipmentTypes(equipmentIds);

    // Organize schedules into the desired response format
    const allSchedules = [];
    
    equipmentIds.forEach(eqId => {
      const equipmentSchedules = schedules.filter(schedule => schedule.equipment_id === eqId);
      const formattedSchedules = equipmentSchedules.map(schedule => ({
        show_id: schedule.show_id,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      }));

      allSchedules.push({
        eq_id: eqId,
        eq_type: equipmentTypes[eqId], // Add eq_type from the equipmentTypes map
        schedules: formattedSchedules
      });
    });

    // Send success response with the schedules
    res.status(200).json({
      status: "Ok",
      data: {
        all_schedules: allSchedules
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
  }
};

module.exports = { getSchedules };
