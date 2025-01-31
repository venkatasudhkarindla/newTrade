const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to get all theaters
const getAllTheaters = async (req, res) => {
  try {
    // Query the TheaterInfo table to get all theater_name and theater_id
    const { data, error } = await supabase
      .from('TheaterInfo')
      .select('theater_id, theater_name,image_url');
    
    // Handle error if query fails
    if (error || !data) {
      throw new Error('Failed to fetch theaters');
    }

    // Send success response with the fetched theater data
    res.status(200).json({
      status: "fetched successfully",
      data: data
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
  }
};


const getScreensByTheater = async (req, res) => {
    try {
      // Extract the theater_id from the headers
      const theaterId = req.headers['theater_id']; // 'theater_id' should be passed in the headers
  
      // If the theater_id is not provided, return an error
      if (!theaterId) {
        return res.status(400).json({ success: false, message: "Theater ID missing in headers" });
      }
  
      // Query the ScreenMaster table to get screen details based on theater_id
      const { data, error } = await supabase
        .from('ScreenMaster')
        .select('screen_id, screen_name, img_url')
        .eq('theater_id', theaterId); // Filter by the provided theater_id
      
      // Handle error if query fails
      if (error || !data) {
        throw new Error('Failed to fetch screens for the specified theater');
      }
  
      // Send success response with the fetched screen data
      res.status(200).json({
        status: "fetched successfully",
        data: data
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
    }
  };

  const getShowsByTheaterAndScreen = async (req, res) => {
    try {
        // Extract theater_id and screen_id from the headers
        const theaterId = req.headers['theater_id']; // 'theater_id' should be passed in the headers
        const screenId = req.headers['screen_id'];

        // Validate if both theater_id and screen_id are provided
        if (!theaterId || !screenId) {
            return res.status(400).json({ success: false, message: "Theater ID and Screen ID are required in headers" });
        }

        // Step 1: Fetch ScreenMaster information for the given screen_id
        const { data: screenData, error: screenError } = await supabase
            .from('ScreenMaster')
            .select('screen_id, screen_name, img_url')
            .eq('screen_id', screenId);

        // Handle error if fetching screen info fails
        if (screenError || !screenData || screenData.length === 0) {
            throw new Error('Failed to fetch screen information');
        }

        // Step 2: Query the MovieShows table to get show details based on theater_id and screen_id
        const { data: movieShows, error: movieShowsError } = await supabase
            .from('MovieShow')
            .select('*')
            .eq('theater_id', theaterId)
            .eq('screen_id', screenId); // Filter by both theater_id and screen_id

        // Handle error if fetching movie shows fails
        if (movieShowsError || !movieShows) {
            throw new Error('Failed to fetch shows for the specified theater and screen');
        }

        // Step 3: Fetch show_type_name for each show using show_type_id
        const showTypeIds = movieShows.map(show => show.show_type_id); // Get all show_type_ids from the fetched shows
        const { data: showTypes, error: showTypesError } = await supabase
            .from('ShowTypeMaster') // Table containing show type information
            .select('show_type_id, show_type_name')
            .in('show_type_id', showTypeIds); // Get show_type_name for each show_type_id

        // Handle error if fetching show types fails
        if (showTypesError || !showTypes) {
            throw new Error('Failed to fetch show types');
        }

        // Step 4: Map show type names and screen information to the shows
        const showsWithTypeAndScreen = movieShows.map(show => {
            const showType = showTypes.find(type => type.show_type_id === show.show_type_id);
            return {
                ...show,
                show_type_name: showType ? showType.show_type_name : 'Unknown', // Add show_type_name to the show
                screen_name: screenData[0].screen_name // Add screen_name from ScreenMaster
            };
        });

        // Step 5: Send success response with the fetched show data
        res.status(200).json({
            status: "fetched successfully",
            data: showsWithTypeAndScreen
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
    }
};



  const getEquipmentByTheater = async (req, res) => {
    try {
      // Extract the theater_id from the headers
      const theaterId = req.headers['theater_id']; // 'theater_id' should be passed in the headers
      console.log(theaterId)
      // If theater_id is not provided, return an error
      if (!theaterId) {
        return res.status(400).json({ success: false, message: "Theater ID missing in headers" });
      }
  
      // Query the Equipment table to get equipment details based on theater_id
      const { data, error } = await supabase
      .from('Equipment')  // Use the table name as it appears in the database
      .select('*')        // Select all columns
      .eq('theater_id', theaterId);
      // Handle error if query fails
      if (error || !data) {
        throw new Error('Failed to fetch equipment for the specified theater');
      }
  
      // Send success response with the fetched equipment data
      res.status(200).json({
        status: "fetched successfully",
        data: data
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
    }
  };
  

  const getShowInfoByTheater = async (req, res) => {
    try {
      // Retrieve theater_name from request headers
      const theater_id = req.headers['theater_id'];
      
  
      // Check if theater_name is provided
      if (!theater_id) {
        return res.status(400).json({ status: false, message: "theater_name is missing in headers" });
      }
  
      // Step 1: Fetch the theater_id from the theater_info table using the theater_name
      const { data: theaterData, error: theaterError } = await supabase
        .from('TheaterInfo') // Table where theater information is stored
        .select('theater_id')
        .eq('theater_id', theater_id)
        .single(); // Expecting one record (single theater)
        console.log(theaterData)
      // If there is an error fetching the theater_id
      if (theaterError || !theaterData) {
        return res.status(404).json({ status: false, message: "Theater not found" });
      }
  
      const theater_id2 = theaterData.theater_id; // Extract theater_id
  
      // Step 2: Use the theater_id to fetch movie show information from the MovieShow table
      const { data: showData, error: showError } = await supabase
        .from('MovieShow') // Table containing show information
        .select('show_id, Movie-Name, show_start_time, show_end_time')
        .eq('theater_id', theater_id2); // Query with the retrieved theater_id
  
      // If there is an error fetching movie show data
      if (showError) {
        return res.status(500).json({ status: false, message: showError.message || "An error occurred while fetching movie shows" });
      }
  
      // Step 3: Return the show data
      return res.status(200).json({
        status: "Ok",
        data: showData
      });
  
    } catch (err) {
      console.log("Error", err);
      return res.status(500).json({ success: false, message: err.message || "An unexpected error occurred" });
    }
  };
  
  
  
  
  
module.exports = { getAllTheaters,getScreensByTheater,getShowsByTheaterAndScreen,getEquipmentByTheater,getShowInfoByTheater };
