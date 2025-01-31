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
  console.log("this is data", data);
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
  console.log(shows);
  if (error || !shows) {
    throw new Error('No shows found for this theater and screen');
  }

  return shows.map(show => show.show_id); // Return an array of show_ids
};

// Function to get equipment schedules based on show_ids
const getEquipmentSchedules = async (showIds) => {
  const { data: schedules, error } = await supabase
    .from('Ai_Device_Schedules')
    .select('ai_device_id, start_time, end_time, show_id, ai_module_id')
    .in('show_id', showIds)
    .order('ai_module_id')
    .order('show_id', { ascending: true }); // Filter by the show_ids array
  console.log(schedules);
  if (error || !schedules) {
    throw new Error('No schedules found for the given show IDs');
  }

  return schedules; // Return schedules
};

// Function to get equipment types based on equipment_ids
// Endpoint to fetch schedules based on API key
const getDeviceSchedules = async (req, res) => {
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
    const equipmentIds = [...new Set(schedules.map(schedule => schedule.ai_device_id))];

    // Initialize arrays to store schedules for different modules
    const schedulesByModule = {
      "M1": { name: "ai_admits_entry", schedules: [] },
      "M2": { name: "ai_admits_exit", schedules: [] },
      "M3": { name: "ai_f&b", schedules: [] },
      "M4": { name: "ai_parking_entry", schedules: [] },
      "M5": { name: "ai_parking_exit", schedules: [] }
    };

    // Group the schedules by ai_module_id and the module names
    schedules.forEach(schedule => {
      const formattedSchedule = {
        show_id: schedule.show_id,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      };

      if (schedule.ai_module_id === 'M1') {
        schedulesByModule['M1'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M2') {
        schedulesByModule['M2'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M3') {
        schedulesByModule['M3'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M4') {
        schedulesByModule['M4'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M5') {
        schedulesByModule['M5'].schedules.push(formattedSchedule);
      }
      else if (schedule.ai_module_id === 'M6') {
        schedulesByModule['M6'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M7') {
        schedulesByModule['M7'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M8') {
        schedulesByModule['M8'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M9') {
        schedulesByModule['M9'].schedules.push(formattedSchedule);
      } else if (schedule.ai_module_id === 'M10') {
        schedulesByModule['M10'].schedules.push(formattedSchedule);
      }
    });

    // Organize schedules into the desired response format
    const allSchedules = [];

    // Push the schedules for each module into the response
    for (const [moduleId, moduleData] of Object.entries(schedulesByModule)) {
      if (moduleData.schedules.length > 0) {
        allSchedules.push({
          ai_module_id: moduleId,
          moduel_name: moduleData.name,
          schedules: moduleData.schedules
        });
      }
    }

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

module.exports = { getDeviceSchedules };
