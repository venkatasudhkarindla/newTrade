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
    .select('ai_device_id, api_key, theater_id, screen_id, start_date, end_date')
    .eq('api_key', apiKey)
    .single();
  
  if (error || !data) {
    throw new Error('Invalid API key');
  }

  return data; // Return device data
};

// Function to get AI device module info based on ai_device_id
const getDeviceModules = async (aiDeviceId) => {
  // Fetch all modules for the given ai_device_id
  const { data: modules, error } = await supabase
    .from('ai_device_modules')
    .select('ai_device_module_id, module_name, inference_model')
    .eq('ai_device_id', aiDeviceId);

  if (error || !modules) {
    throw new Error('Modules not found');
  }

  return modules; // Return list of modules
};

// Function to fetch camera settings
const getAICameraSettings = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']; // Extract API key from URL parameter
    
    if (!apiKey) {
      return res.status(401).json({ success: false, message: "API key missing in URL" });
    }

    // Validate the API key and fetch the ai_device_id and associated data
    const deviceData = await validateApiKey(apiKey);
    
    // Get all modules for the given ai_device_id
    const modules = await getDeviceModules(deviceData.ai_device_id);

    console.log('Modules:', modules);

    // Prepare to store camera settings grouped by processing type and ai_device_id
    let aiCameraSettings = [];

    // Loop over each module and fetch its camera settings
    for (const module of modules) {
      console.log('Module:', module.ai_device_module_id);

      const { data: cameras, error: cameraError } = await supabase
        .from('RTSP_Cameras_Settings')
        .select('*')
        .eq('ai_device_module_id', module.ai_device_module_id);
      console.log(cameras)
      if (cameraError || !cameras) {
        console.error("Error fetching camera settings:", cameraError);
        continue;
      }

      // Find the processing type and inference model for this module
      const processingType = module.module_name; // Example: "people_counting_stream", "f&b_counting_stream"
      const inferenceModel = module.inference_model; // Example: "Model_A", "Model_B", "Model_C"

      // Create the structure for each ai_device_id and processing type
      let aiDeviceSettings = aiCameraSettings.find(item => item.ai_device_id === deviceData.ai_device_id && item.processing_type === processingType);

      if (!aiDeviceSettings) {
        aiDeviceSettings = {
          ai_device_id: deviceData.ai_device_id,
          processing_type: processingType,
          inference_model: inferenceModel,
          streaming: true,
          rtsp_cameras_settings: []
        };
        aiCameraSettings.push(aiDeviceSettings);
      }

      // Add the camera settings under the corresponding processing type
      cameras.forEach(camera => {
        aiDeviceSettings.rtsp_cameras_settings.push({
          rtsp_url: camera.rtsp_url, // Secure the password
          camera_name: camera.camera_name,
          camera_id: camera.camera_id,
          stream_id: camera.stream_id,
          focus_area: {
            x: camera.focus_area_x,
            y: camera.focus_area_y,
            width: camera.focus_area_width,
            height: camera.focus_area_height
          },
          counting_line: {
            x1: camera.counting_line_x1,
            y1: camera.counting_line_y1,
            x2: camera.counting_line_x2,
            y2: camera.counting_line_y2
          },
          no_of_lines: camera.no_of_lines,
          resolution: {
            width: camera.resolution_width,
            height: camera.resolution_height
          },
          fps: camera.fps,
          topic_info: camera.topic_info
        });
      });
    }

    // Send success response
    res.status(200).json({
      status: "Ok",
      data: aiCameraSettings
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
  }
};

module.exports = { getAICameraSettings };
