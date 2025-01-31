const express = require('express');
const { InfluxDB, consoleLogger } = require('@influxdata/influxdb-client');
require('dotenv').config();

const INFLUXDB_URL = process.env.INFLUXDB_URL ;
const INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN ;
const INFLUXDB_ORG = process.env.INFLUXDB_ORG ;
const INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET ;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;



const influxDB = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });


const csvParser = require('csv-parser');
const fs = require('fs');

const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const getTopicInfoByTheaterAndModule = async (theaterId, moduleName) => {
console.log(theaterId,moduleName)  

  try {
      
      const { data: aiDevices, error: aiDeviceError } = await supabase
          .from('AI_Devices')
          .select('ai_device_id')
          .eq('theater_id', theaterId);
      console.log(aiDevices)
      if (aiDeviceError || !aiDevices || aiDevices.length === 0) {
          
          throw new Error('No AI devices found for the provided theater_id');
      }

      const aiDeviceIds = aiDevices.map(device => device.ai_device_id);
      //////consolelog('AI device IDs:', aiDeviceIds);

      // Step 2: Fetch AI device modules using ai_device_id and provided module_name
      const { data: aiModules, error: aiModuleError } = await supabase
          .from('ai_device_modules')
          .select('ai_device_module_id, module_name')
          .in('ai_device_id', aiDeviceIds)
          .in('module_name', moduleName);
        console.log(aiModules)
      if (aiModuleError || !aiModules || aiModules.length === 0) {
          //////consoleerror('Error fetching AI device modules:', aiModuleError);
          throw new Error('No AI device modules found for the provided module_name');
      }
      //////consolelog('Modules:', aiModules);

      // Step 3: Fetch topic_info for each ai_device_module_id
      const topicInfoPromises = aiModules.map(async (module) => {
          const { data: cameraSettings, error: cameraError } = await supabase
              .from('RTSP_Cameras_Settings')
              .select('topic_info')
              .eq('ai_device_module_id', module.ai_device_module_id);
            console.log(cameraSettings)
          if (cameraError || !cameraSettings || cameraSettings.length === 0) {
              //////consoleerror('Error fetching topic info for module:', module.module_name, cameraError);
              return null;
          }

          //////consolelog('Camera Settings:', cameraSettings);

          // Return object with theaterId, moduleName, and all topicInfo as an array
          return {
              theaterId,
              moduleName: module.module_name,
              topicInfo: cameraSettings.map(setting => setting.topic_info), // Include all topic_info entries
          };
      });

      // Wait for all promises to resolve
      const results = await Promise.all(topicInfoPromises);

      // Filter out any null results (error handling)
      const validResults = results.filter(result => result !== null);

      //////consolelog('Fetched Topic Info List:', validResults);
      return validResults; // Return as a list
  } catch (error) {
      //////consoleerror('Error:', error.message);
      throw new Error('Failed to fetch topic info for the given theater_id and module_name');
  }
};

function parseTimeToDate(timeString) {
  const date = new Date();
  const [hours, minutes, seconds] = timeString.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
  return date;
}
function checkShowTimes(responseData, showsData) {
  ////consolelog("this is only working here",responseData,showsData)
  responseData.forEach(response => {
    const startTime = parseTimeToDate(response._time);
    // const endTime = parseTimeToDate(response._stop);
    //consolelog(response._time)
    ////consolelog(startTime,endTime)
    // Add show_id and movie_name to the response if the times are within any show
    const matchingShows = showsData.filter(show => {
      const showStartTime = parseTimeToDate(show.show_start_time);
      

      // Check if response start and end time are within the showtime range
      return (startTime >= showStartTime );
    });
    //consolelog(matchingShows)
    // If matching shows are found, add show_id and movie_name
    if (matchingShows.length > 0) {
      response.show_details = matchingShows.map(show => ({
        show_id: show.show_id,
        movie_name: show["Movie-Name"],
        show_type:show['show_type_name']
      }));
    } else {
      response.show_details = []; // No matching shows
    }
  });
  ////consolelog(responseData)
  return responseData;
}

function checkShowTimes2(responseData, showsData) {
  ////consolelog("this is only working here",responseData,showsData)
  //consolelog(showsData)
  //consolelog(responseData)
  responseData.forEach(response => {
    const startTime = parseTimeToDate(response.time);
    // const endTime = parseTimeToDate(response._stop);
    //consolelog(response.time)
    ////consolelog(startTime,endTime)
    // Add show_id and movie_name to the response if the times are within any show
    const matchingShows = showsData.filter(show => {
      const showStartTime = parseTimeToDate(show.start_time);
      

      // Check if response start and end time are within the showtime range
      return (startTime >= showStartTime );
    });
    //consolelog(matchingShows)
    // If matching shows are found, add show_id and movie_name
    if (matchingShows.length > 0) {
      response.show_details = matchingShows.map(show => ({
        show_id: show.show_id,
        movie_name: show["Movie-Name"],
        show_type:show['show_type_name']
      }));
    } else {
      response.show_details = []; // No matching shows
    }
  });
  ////consolelog(responseData)
  return responseData;
}

function checkShowTimes3(responseData, showsData) {
  ////consolelog("this is only working here",responseData,showsData)
  //consolelog(showsData)
  //consolelog(responseData)
  responseData.forEach(response => {
    const startTime = parseTimeToDate(response.time);
    // const endTime = parseTimeToDate(response._stop);
    //consolelog(response.time)
    ////consolelog(startTime,endTime)
    // Add show_id and movie_name to the response if the times are within any show
    const matchingShows = showsData.filter(show => {
      const showStartTime = parseTimeToDate(show.start_time);
      

      // Check if response start and end time are within the showtime range
      return (startTime >= showStartTime );
    });
    //consolelog(matchingShows)
    // If matching shows are found, add show_id and movie_name
    if (matchingShows.length > 0) {
      response.show_details = matchingShows.map(show => ({
        show_id: show.show_id,
        movie_name: show["movie_name"],
        show_type:show['show_type']
      }));
    } else {
      response.show_details = []; // No matching shows
    }
  });
  ////consolelog(responseData)
  return responseData;
}


const getParkingInfoByTheater = async (theater_id,module_name) => {
  try {
    // Check if theater_id is provided
    if (!theater_id) {
      throw new Error("theater_id is missing");
    }

    // Step 1: Fetch the ai_device_id using the theater_id from AI_Devices table
    const { data: aiDeviceData, error: aiDeviceError } = await supabase
      .from('AI_Devices')
      .select('ai_device_id')
      .eq('theater_id', theater_id); // Query with the provided theater_id

    // If there is an error fetching the ai_device_id or no device found
    if (aiDeviceError || !aiDeviceData || aiDeviceData.length === 0) {
      throw new Error("AI Device not found for the provided theater_id");
    }

    const aiDeviceId = aiDeviceData[0].ai_device_id; // Extract the ai_device_id

    // Step 2: Fetch ai_device_module_id for the 'parking_counting_stream' from ai_device_modules table
    const { data: aiDeviceModuleData, error: aiDeviceModuleError } = await supabase
      .from('ai_device_modules')
      .select('ai_device_module_id')
      .eq('ai_device_id', aiDeviceId)
      .in('module_name', module_name); // Filtering for the 'parking_counting_stream' module
    ////consolelog("ai_device_info",aiDeviceModuleData)
    // If there is an error fetching the module or no module found
    if (aiDeviceModuleError || !aiDeviceModuleData || aiDeviceModuleData.length === 0) {
      throw new Error("No parking counting stream module found for this device");
    }

    const aiDeviceModuleId = aiDeviceModuleData[0].ai_device_module_id; // Extract the module ID

    // Step 3: Fetch schedules for this ai_device_module_id from Ai_Device_Schedules table
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('Ai_Device_Schedules')
      .select('schedule_id, start_time, end_time, show_id, show_type_id, ai_module_id')
      .eq('ai_module_id', aiDeviceModuleId); // Query schedules based on the module id

    // If there is an error fetching schedules data
    if (schedulesError || !schedulesData || schedulesData.length === 0) {
      throw new Error("No schedules found for this device module");
    }

    // Step 4: Fetch movie show names and show type names using show_id
    const updatedSchedulesData = await Promise.all(
      schedulesData.map(async (schedule) => {
        // Fetch movie name from MovieShow using show_id
        const { data: movieShowData, error: movieShowError } = await supabase
          .from('MovieShow')
          .select('Movie-Name')
          .eq('show_id', schedule.show_id)
          .single(); // Fetch the movie name for this show_id

        if (movieShowError || !movieShowData) {
          schedule.movie_name = "Unknown Movie"; // Set default movie name if error occurs
        } else {
          schedule.movie_name = movieShowData['Movie-Name']; // Add movie name to the schedule
        }

        // Fetch show type name from ShowTypeMaster using show_type_id
        const { data: showTypeData, error: showTypeError } = await supabase
          .from('ShowTypeMaster')
          .select('show_type_name')
          .eq('show_type_id', schedule.show_type_id)
          .single(); // Fetch the show type name for this show_type_id

        if (showTypeError || !showTypeData) {
          schedule.show_type = "Unknown Type"; // Set default show type if error occurs
        } else {
          schedule.show_type = showTypeData.show_type_name; // Add show type to the schedule
        }

        return schedule; // Return the updated schedule
      })
    );

    // Step 5: Return the updated schedules data with movie name and show type
    return {
      status: "Ok",
      data: updatedSchedulesData.map(schedule => ({
        show_id: schedule.show_id,
        movie_name: schedule.movie_name,
        show_type: schedule.show_type,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      })),
    };

  } catch (err) {
    ////consolelog("Error:", err);
    return {
      status: false,
      message: err.message || "An unexpected error occurred",
    };
  }
};

const getAdmitsInfoByTheater = async (theater_id,module_name) => {
  console.log(module_name)
  try {
    // Check if theater_id is provided
    if (!theater_id) {
      throw new Error("theater_id is missing");
    }

    // Step 1: Fetch the ai_device_id using the theater_id from AI_Devices table
    const { data: aiDeviceData, error: aiDeviceError } = await supabase
      .from('AI_Devices')
      .select('ai_device_id')
      .eq('theater_id', theater_id); // Query with the provided theater_id
      console.log("calling ai_device_data",aiDeviceData)
    // If there is an error fetching the ai_device_id or no device found
    if (aiDeviceError || !aiDeviceData || aiDeviceData.length === 0) {
      throw new Error("AI Device not found for the provided theater_id");
    }

    const aiDeviceId = aiDeviceData[0].ai_device_id; // Extract the ai_device_id

    // Step 2: Fetch ai_device_module_id for the 'parking_counting_stream' from ai_device_modules table
    const { data: aiDeviceModuleData, error: aiDeviceModuleError } = await supabase
  .from('ai_device_modules')
  .select('ai_device_module_id')
  .eq('ai_device_id', aiDeviceId)
  .in('module_name', module_name); // Check for multiple module names
  console.log("ai_device_info",aiDeviceModuleData)
    // If there is an error fetching the module or no module found
    if (aiDeviceModuleError || !aiDeviceModuleData || aiDeviceModuleData.length === 0) {
      throw new Error("No parking counting stream module found for this device");
    }

    const aiDeviceModuleId = aiDeviceModuleData[0].ai_device_module_id; // Extract the module ID

    // Step 3: Fetch schedules for this ai_device_module_id from Ai_Device_Schedules table
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('Ai_Device_Schedules')
      .select('schedule_id, start_time, end_time, show_id, show_type_id, ai_module_id')
      .eq('ai_module_id', aiDeviceModuleId); // Query schedules based on the module id

    // If there is an error fetching schedules data
    if (schedulesError || !schedulesData || schedulesData.length === 0) {
      throw new Error("No schedules found for this device module");
    }

    // Step 4: Fetch movie show names and show type names using show_id
    const updatedSchedulesData = await Promise.all(
      schedulesData.map(async (schedule) => {
        // Fetch movie name from MovieShow using show_id
        const { data: movieShowData, error: movieShowError } = await supabase
          .from('MovieShow')
          .select('Movie-Name')
          .eq('show_id', schedule.show_id)
          .single(); // Fetch the movie name for this show_id

        if (movieShowError || !movieShowData) {
          schedule.movie_name = "Unknown Movie"; // Set default movie name if error occurs
        } else {
          schedule.movie_name = movieShowData['Movie-Name']; // Add movie name to the schedule
        }

        // Fetch show type name from ShowTypeMaster using show_type_id
        const { data: showTypeData, error: showTypeError } = await supabase
          .from('ShowTypeMaster')
          .select('show_type_name')
          .eq('show_type_id', schedule.show_type_id)
          .single(); // Fetch the show type name for this show_type_id

        if (showTypeError || !showTypeData) {
          schedule.show_type = "Unknown Type"; // Set default show type if error occurs
        } else {
          schedule.show_type = showTypeData.show_type_name; // Add show type to the schedule
        }

        return schedule; // Return the updated schedule
      })
    );

    // Step 5: Return the updated schedules data with movie name and show type
    return {
      status: "Ok",
      data: updatedSchedulesData.map(schedule => ({
        show_id: schedule.show_id,
        movie_name: schedule.movie_name,
        show_type: schedule.show_type,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      })),
    };

  } catch (err) {
    ////consolelog("Error:", err);
    return {
      status: false,
      message: err.message || "An unexpected error occurred",
    };
  }
};
  

const getShowInfoByTheater = async (theater_id) => {
  console.log("calling getShowInfoByTheater function")
  try {
    // Check if theater_id is provided
    if (!theater_id) {
      throw new Error("theater_id is missing");
    }
    console.log(theater_id)
    // Step 1: Fetch the theater details using the theater_id
    const { data: theaterData, error: theaterError } = await supabase
      .from('TheaterInfo') // Table where theater information is stored
      .select('theater_id')
      .eq('theater_id', theater_id)
      .single(); // Expecting one record (single theater)
    console.log(theaterData)
    // If there is an error fetching the theater_id
    if (theaterError || !theaterData) {
      throw new Error("Theater not found");
    }

    const theater_id2 = theaterData.theater_id; // Extract theater_id

    // Step 2: Fetch movie show information from the MovieShow table using theater_id
    const { data: showData, error: showError } = await supabase
      .from('MovieShow') // Table containing show information
      .select('*')
      .eq('theater_id', theater_id); // Query with the retrieved theater_id
    console.log(showData)
    // If there is an error fetching movie show data
    if (showError) {
      throw new Error("An error occurred while fetching movie shows");
    }

    // Step 3: Fetch show type information from the ShowTypeMaster table
    // Map over the showData and fetch the corresponding show type name based on show_type_id
    const updatedShowData = await Promise.all(
      showData.map(async (show) => {
        const { data: showTypeData, error: showTypeError } = await supabase
          .from('ShowTypeMaster') // Table containing show types
          .select('show_type_name')
          .eq('show_type_id', show.show_type_id)
          .single(); // Expecting one record (single show type)
        console.log("showtypedata",showTypeData)
        // If there is an error or no data, default to 'Unknown'
        if (showTypeError || !showTypeData) {
          show.show_type_name = "Unknown"; // Set a default value
        } else {
          show.show_type_name = showTypeData.show_type_name; // Add the show type name
        }

        return show; // Return the updated show data
      })
    );

    // Step 4: Return the show data with show type names
    return {
      status: "Ok",
      data: updatedShowData, // Return the updated data with show_type_name
    };

  } catch (err) {
    ////consolelog("Error", err);
    return {
      status: false,
      message: err.message || "An unexpected error occurred",
    };
  }
};


function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to format the time as HH:MM:SS
function formatTime(date) {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}


const fetchMulFandBData = async (req, res) => {
  const theaterId = req.headers['theater_id']; // 'theater_id' should be passed in the headers
  let  module_name = req.headers['module_name'];

  console.log("modName",module_name);
  if (module_name === 'ai_f&b') {
         module_name = ['ai_f&b'];
  }console.log(typeof(module_name))
  console.log(module_name)
  const [startday, startmonth, startyear] = req.headers['startdate'].split('-').map(Number);
  const startdate = new Date(Date.UTC(startyear, startmonth - 1, startday ));
  const startDate = startdate.toISOString(); 

  const [endday, endmonth, endyear] = req.headers['enddate'].split('-').map(Number);
  const enddate = new Date(Date.UTC(endyear, endmonth - 1, endday ));
  enddate.setUTCHours(23, 59, 59, 999);
  const endDate = enddate.toISOString()

    //consolelog(startdate); 
    //consolelog('DAte....',typeof(startDate),endDate)
  const result = await getShowInfoByTheater(theaterId,module_name);
  console.log("this is result",result['data'])
  const show_data=result['data']
  const { data: aiDeviceData, error: aiDeviceError } = await supabase
      .from('Product')
      .select('product_name,cost'); 
      ////consolelog("this is products information",aiDeviceData)
  const product_info=aiDeviceData
  try {
    //////consolelog('Fetching F&B data...');

    
    const dataList = await getTopicInfoByTheaterAndModule(theaterId, module_name);
    //////consolelog('Topic Info:', dataList);

    const parseData = (topicInfo) => {
      const parts = topicInfo.split('/');
      return {
        theater: parts[0],
        moduleType: parts[1],
        category: parts[2],
        subcategory: parts[4],
        metric: parts[5],
      };
    };

    const parsedData = dataList
      .flatMap((module) => {
        const topicInfos = Array.isArray(module.topicInfo) ? module.topicInfo : [module.topicInfo];
        return topicInfos.map(parseData);
      })
      .filter((data) => data !== null);

    if (parsedData.length === 0) {
      throw new Error('No valid topic URLs to process');
    }

    const theater = parsedData[0].theater;
    const moduleType = parsedData[1].moduleType;
    const categories = [...new Set(parsedData.map((item) => item.category))];
    const subcategories = [...new Set(parsedData.map((item) => item.subcategory))];
    const metric = parsedData[0].metric;
    const product = ['pepsmall','popmid','popbig']
    //consolelog("mod,,,,,,,,,,",moduleType)

    //////consolelog('Parsed Data:',  theater, categories, subcategories, metric );

    const bucket = req.query.bucket || 'tms_cloud_insights_bucket';

    // Construct dynamic category filter
    const categoryFilter = categories
  .map((category) => `r["category"] == "${category}"`) // Correct string interpolation
  .join(' or ');
  const productFilter = product
      .map((product) => `r["subcategory"] == "${product}"`)
      .join(' or ');


    const query = `
      from(bucket: "${INFLUXDB_BUCKET}")
        |> range(start: ${startDate}, stop: ${endDate})
        |> filter(fn: (r) => r["_measurement"] == "theater_metrics")
        |> filter(fn: (r) => r["theater"] == "${theater}")
        |> filter(fn: (r) => r["screen"] =="${moduleType}")
        |> filter(fn: (r) => ${categoryFilter})
        |> filter(fn: (r) => ${productFilter})
        |> filter(fn: (r) => r["metric"] == "${metric}")
        |> filter(fn: (r) => r["_field"] == "value")
        |> window(every: 1d)
          |> sort(columns: ["_time"], desc: true)
          |> first()
          |> yield(name: "daily_last")
    `;

    ////consolelog('Executing query:', query);

    const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);
    const rows = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        //consolelog(data)
         ////consolelog(data['_start'],data['_stop']);
         data['POS_Count']=0
         product_info.forEach(product => {
          ////consolelog(product.product_name,product.cost)
          
          if (product.product_name===data['subcategory']){
          
            const cost=data['_value']*product.cost
            data['AI_Amount']=cost
            
          }
        });
       
        data['POS_Sales_Amount']=0;
        data['Difference']=0
        const startDate = new Date(data['_start']);
        const stopDate = new Date(data['_stop']);
        const time = new Date(data['_time'])
        const startDateStr = formatDate(startDate);
        const startTimeStr = formatTime(startDate);
        
        const check_time= formatTime(time)
        //consolelog("this is time",check_time)
        const stopDateStr = formatDate(stopDate);
        const stopTimeStr = formatTime(stopDate);
        data['_start']=startTimeStr
        data['_stop']=stopTimeStr
        data['start_date']=startDateStr
        data['stop_date']=stopDateStr
        data['_time']=check_time
        
        
        rows.push(data);
        const result=checkShowTimes(rows,show_data)
         ////consolelog("this is result",result)
        // ////consolelog(rows)
      },
      
      error(error) {
        //////consoleerror('Query Error:', error);
        res.status(500).json({ success: false, error: error.message });
      },
      complete() {
        res.status(200).json({ success: true, data: rows });
      },
    });
  } catch (error) {
    //////consoleerror('Request Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


const fetchParkingData = async (req, res) => {
  const theaterId = req.headers['theater_id']; // 'theater_id' should be passed in the headers
  let module_name = req.headers['module_name'];
  const [startday, startmonth, startyear] = req.headers['startdate'].split('-').map(Number);
  const startdate = new Date(Date.UTC(startyear, startmonth - 1, startday ));
  const startDate = startdate.toISOString(); 

  const [endday, endmonth, endyear] = req.headers['enddate'].split('-').map(Number);
  const enddate = new Date(Date.UTC(endyear, endmonth - 1, endday ));
  enddate.setUTCHours(23, 59, 59, 999);
  const endDate = enddate.toISOString()
  console.log(startdate);
  console.log('DAte....',typeof(startDate),endDate)
  if (module_name === "parking_counting_stream"){
        module_name = ['ai_parking_entry','ai_parking_exit']
  }
  //consolelog(startdate); 
  //consolelog('DAte....',typeof(startDate),endDate)
  const result = await getParkingInfoByTheater(theaterId,module_name);
  ////consolelog("this is result",result['data'])
  const show_data=result['data']
  try {
    ////consolelog('Fetching parking data...');

   

    // Fetch data based on theater_id and moduleName
    const dataList = await getTopicInfoByTheaterAndModule(theaterId, module_name);
      //consolelog('Parking DataList:', dataList);
  
      // Parse the topicInfo array
      const parseData = (topicInfo) => {
        const parts = topicInfo.split('/');
        return parts.length === 7
          ? {
              theater: parts[0],
              screen: parts[1],
              category: parts[2],
              zone: parts[3],
              subcategory: parts[4],
              gate: parts[5],
              metric: parts[6],
            }
          : null; // Handle unexpected data structure
      };
  
      const parsedData = dataList
        .flatMap((module) => module.topicInfo.map(parseData))
        .filter((data) => data !== null);
  
      if (parsedData.length === 0) {
        throw new Error('No valid topic URLs to process');
      }
  
      // Extract unique values for filters
      const theater = parsedData[0].theater; // Assuming all share the same theater
      const screens = [...new Set(parsedData.map((item) => item.screen))];
      const categories = [...new Set(parsedData.map((item) => item.category))];
      const zones = [...new Set(parsedData.map((item) => item.zone))];
      const subcategories = [...new Set(parsedData.map((item) => item.subcategory))];
      const gates = [...new Set(parsedData.map((item) => item.gate))];
      const vehicles = ['car','motorcycle']
      const metric = parsedData[0].metric; // Assuming metric is consistent
      const field = req.query.field || 'value'; // Default field
      const bucket = req.query.bucket || 'tms_cloud_insights_bucket'; // Default bucket
  
      //consolelog('Parsed Data:', { screens, categories, zones, subcategories, gates });
  
      // Create dynamic filters for Flux query
      const screenFilter = screens.length
        ? `${screens.map((screen) => `r["screen"] == "${screen}"`).join(' or ')}`
        : 'true'; // Allow all if no filter
      const categoryFilter = categories.length
        ? `${categories.map((category) => `r["category"] == "${category}"`).join(' or ')}`
        : 'true';
      const zoneFilter = zones.length
        ? `${zones.map((zone) => `r["subcategory"] == "${zone}"`).join(' or ')}`
        : 'true';
      const subcategoryFilter = subcategories.length
        ? `${subcategories.map((subcategory) => `r["metric"] == "${subcategory}"`).join(' or ')}`
        : 'true';
      const gateFilter = gates.length
        ? `${gates.map((gate) => `r["gate"] == "${gate}"`).join(' or ')}`
        : 'true';
      const vehiclesFilter = vehicles.length
        ? `${vehicles.map((vehicle) => `r["vehicle"] == "${vehicle}"`).join(' or ')}`
        : 'true';
  
        //consolelog('Data:', { screenFilter, categoryFilter, zoneFilter, subcategoryFilter, gateFilter, vehiclesFilter });

      // Construct the Flux query based on the provided query
      const query = `
        from(bucket: "${INFLUXDB_BUCKET}")
          |> range(start: ${startDate}, stop: ${endDate})
          |> filter(fn: (r) => r["_measurement"] == "theater_metrics")
          |> filter(fn: (r) => r["theater"] == "${theater}")
          |> filter(fn: (r) => ${screenFilter})
          |> filter(fn: (r) => ${categoryFilter})
          |> filter(fn: (r) => ${zoneFilter})
          |> filter(fn: (r) => ${subcategoryFilter})
          |> filter(fn: (r) => ${gateFilter})
          |> filter(fn: (r) => ${vehiclesFilter})
          |> filter(fn: (r) => r["_field"] == "${field}")
          |> window(every: 1d)
          |> sort(columns: ["_time"], desc: true)
          |> first()
          |> yield(name: "daily_last")
      `;
  
      // //consolelog('Executing Query:', query);
    ////consolelog('Executing Query:', query);

    // Execute the query
    const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);
    const rows = [];
      
    queryApi.queryRows(query, {
      
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        //consolelog('Data',data)
        const startDate = new Date(data['_start']);
        const stopDate = new Date(data['_stop']);
        const time = new Date(data['_time'])
        const startDateStr = formatDate(startDate);
        const startTimeStr = formatTime(startDate);
        
        const check_time= formatTime(time)
        //consolelog("this is time",check_time)
        const stopDateStr = formatDate(stopDate);
        const stopTimeStr = formatTime(stopDate);
        data['_start']=startTimeStr
        data['_stop']=stopTimeStr
        data['start_date']=startDateStr
        data['stop_date']=stopDateStr
        data['_time']=check_time
        // //consolelog(data['start_date'],data['stop_date'])
        ////consolelog(data)
//         const validTimestamp = data['_time'].split('.')[0] + 'Z'; // Use only the seconds and 'Z' for UTC

// // Create a Date object from the valid timestamp
//         const date = new Date(validTimestamp);

//         const hours = String(date.getUTCHours()).padStart(2, '0');
//         const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//         const seconds = String(date.getUTCSeconds()).padStart(2, '0');

// // Format the time as HH:MM:SS
//         const formattedTime = `${hours}:${minutes}:${seconds}`;
//         data['_time']=formattedTime
        ////consolelog(data['_time'])
        // //consolelog("this is another one",data)
        rows.push({
          time: data._time,
          theater: data.theater,
          screen: data.screen,
          category: data.category,
          zone: data.zone,
          subcategory: data.subcategory,
          gate: data.gate,
          metric: data.metric,
          vehicle : data.vehicle,
          field: data._field,
          value: data._value,
          entry_pos_count:0,
          exit_pos_count:0,
          entry_difference:0,
          exit_difference:0,
          start_date:data.start_date,
          end_date:data.stop_date,
          start_time:data._start,
          end_time:data._stop

        });
        console.log("this is rows information",rows)
        const parking_result=checkShowTimes2(rows,show_data)
        ////consolelog("please note this is parking result",parking_result)
      },
      error(error) {
        ////consoleerror('Query Error:', error);
        res.status(500).json({ success: false, error: error.message });
      },
      complete() {
        res.status(200).json({ success: true, data: rows });
      },
    });
  } catch (error) {
    ////consoleerror('Request Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const fetchadmitsCount = async (req, res) => {
  console.log("calling this function")
  const theaterId = req.headers['theater_id']; // 'theater_id' should be passed in the headers
  module_name = req.headers['module_name'];
  module_name=['ai_admits_entry','ai_admits_exit']

  
  //console.log(module_name)
  const [startday, startmonth, startyear] = req.headers['startdate'].split('-').map(Number);
  const startdate = new Date(Date.UTC(startyear, startmonth - 1, startday ));
  const startDate = startdate.toISOString(); 

  const [endday, endmonth, endyear] = req.headers['enddate'].split('-').map(Number);
  const enddate = new Date(Date.UTC(endyear, endmonth - 1, endday ));
  enddate.setUTCHours(23, 59, 59, 999);
  const endDate = enddate.toISOString()
  console.log(startdate);
    console.log('DAte....',typeof(startDate),endDate)
  if (module_name === "people_counting_stream") {
        module_name = ["ai_admits_entry","ai_admits_exit"];
  }
    //consolelog(startdate); 
    //consolelog('DAte....',typeof(startDate),endDate)
  ////consolelog('DAte....',typeof(startDate),endDate)

  const result = await getAdmitsInfoByTheater(theaterId,module_name);
  //console.log(result)
  ////consolelog("this is fetchadminExitcount result",result['data'])
  const show_data=result['data']
  try {
    ////consolelog('Fetching adminExitcount...');

    
    const dataList = await getTopicInfoByTheaterAndModule(theaterId, module_name);

    ////consolelog('DataList:', dataList);

    // Parse the topicInfo array and extract relevant details
    const parseData = (topicInfo) => {
      const parts = topicInfo.split('/');
      return {
        theater: parts[0], // e.g., 'ravikala'
        screen: parts[1], // e.g., 'Screen1', 'Screen2'
        category: parts[2], // e.g., 'admits'
        subcategory: parts[3], // e.g., 'entry', 'exit'
        zone: parts[4], // e.g., 'z1', 'z2'
        metric: parts[5], // e.g., 'count'
      };
    };

    const parsedData = dataList
      .flatMap((module) => module.topicInfo.map(parseData))
      .filter((data) => data !== null);

    if (parsedData.length === 0) {
      throw new Error('No valid topic URLs to process');
    }


    const theater = parsedData[0].theater; // Assuming all share the same theater
    const screens = [...new Set(parsedData.map((item) => item.screen))]; // Unique screens
    const categories = [...new Set(parsedData.map((item) => item.category))]; // Unique categories
    const subcategories = [...new Set(parsedData.map((item) => item.subcategory))]; // Unique subcategories
    const zones = [...new Set(parsedData.map((item) => item.zone))]; // Unique zones
    const metric = parsedData[0].metric; // Assuming metric is consistent


    const field = req.query.field || 'value'; // Default field
    const bucket = req.query.bucket || 'tms_cloud_insights_bucket'; // Default bucket

    //console.log("data",screens,categories,subcategories,zones,metric)

    // Create dynamic filters for Flux query
    const screenFilter = screens.map((screen) => `r["screen"] == "${screen}"`).join(' or ');
    const categoryFilter = categories.map((category) => `r["category"] == "${category}"`).join(' or ');
    const subcategoryFilter = subcategories.map((subcategory) => `r["subcategory"] == "${subcategory}"`).join(' or ');
    const zoneFilter = zones.map((zone) => `r["metric"] == "${zone}"`).join(' or ');

    //console.log("data",screenFilter,categoryFilter,typeof(subcategoryFilter),zoneFilter,)

    // Construct the Flux query
    const query = `
      from(bucket: "${INFLUXDB_BUCKET}")
        |> range(start: ${startDate}, stop: ${endDate})
        |> filter(fn: (r) => r["_measurement"] == "theater_metrics")
        |> filter(fn: (r) => r["theater"] == "${theater}")
        |> filter(fn: (r) => ${screenFilter})
        |> filter(fn: (r) => ${categoryFilter})
        |> filter(fn: (r) => ${subcategoryFilter})
        |> filter(fn: (r) => ${zoneFilter})
        |> filter(fn: (r) => r["value"] == "${metric}")
        |> filter(fn: (r) => r["_field"] == "${field}")
        |> window(every: 1d)
        |> sort(columns: ["_time"], desc: true)
        |> first()
        |> yield(name: "daily_last")
    `;

    //consolelog('Executing query:', query);

    // Execute the query
    const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);
    const rows = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        //consolelog(data)
//         const validTimestamp = data['_time'].split('.')[0] + 'Z'; // Use only the seconds and 'Z' for UTC

// // Create a Date object from the valid timestamp
//         const date = new Date(validTimestamp);

//         const hours = String(date.getUTCHours()).padStart(2, '0');
//         const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//         const seconds = String(date.getUTCSeconds()).padStart(2, '0');

// // Format the time as HH:MM:SS
//         const formattedTime = `${hours}:${minutes}:${seconds}`;
//         data['_time']=formattedTime
          const startDate = new Date(data['_start']);
          const stopDate = new Date(data['_stop']);
          const time = new Date(data['_time'])
          const startDateStr = formatDate(startDate);
          const startTimeStr = formatTime(startDate);

          const check_time= formatTime(time)
          //consolelog("this is time",check_time)
          const stopDateStr = formatDate(stopDate);
          const stopTimeStr = formatTime(stopDate);
          data['_start']=startTimeStr
          data['_stop']=stopTimeStr
          data['start_date']=startDateStr
          data['stop_date']=stopDateStr
          data['_time']=check_time
          //consolelog(data['start_date'],data['stop_date'])
        
        ////consolelog(data)
        rows.push({
          time: data._time,
          theater: data.theater,
          screen: data.screen,
          category: data.category,
          subcategory: data.subcategory,
          zone: data.zone,
          metric: data.metric,
          field: data._field,
          value: data._value,
          Entry_POS_Count:0,
          Exit_POS_Count:0,
          Entry_Difference:0,
          Exit_Differnce:0,
          start_date:data.start_date,
          end_date:data.stop_date,
          start_time:data._start,
          end_time:data._stop
        });
        const parking_result=checkShowTimes3(rows,show_data)
        //////consolelog("please note this is parking result",parking_result)
      },
      error(error) {
        ////consoleerror('Query Error:', error);
        res.status(500).json({ success: false, error: error.message });
      },
      complete() {
        res.status(200).json({ success: true, data: rows });
      },
    });
  } catch (error) {
    ////consoleerror('Request Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTopicInfoByEquipmentAndModule = async (theaterId, moduleNames) => {
  console.log('Fetching topic info for theater_id:', theaterId, 'and module_names:', moduleNames);

  try {
      // Step 1: Fetch Equipment for the provided theater_id
      const { data: equipment, error: equipmentError } = await supabase
          .from('Equipment')
          .select('equipment_id')
          .eq('theater_id', theaterId);

      // Error handling for Equipment fetch
      if (equipmentError || !equipment || equipment.length === 0) {
          console.error('Error fetching Equipment:', equipmentError);
          throw new Error('No Equipment found for the provided theater_id');
      }

      const equipmentIds = equipment.map(item => item.equipment_id);
      console.log('Equipment IDs:', equipmentIds);

      // Step 2: Fetch equipment modules using equipment_id and provided module_names
      const { data: equipmentModules, error: equipmentModuleError } = await supabase
          .from('Equipment_Moduels')
          .select('equipment_id, module_name, topic_info')
          .in('equipment_id', equipmentIds)
          .in('module_name', moduleNames);
      console.log(moduleNames)
      // Error handling for equipment modules fetch
      if (equipmentModuleError || !equipmentModules || equipmentModules.length === 0) {
          console.error('Error fetching Equipment Modules:', equipmentModuleError);
          throw new Error('No equipment modules found for the provided module_names');
      }
      console.log('Equipment Modules:', equipmentModules);

      // Step 3: Combine all topic_info into a single array
      const combinedTopicInfo = equipmentModules.flatMap(module => module.topic_info.split(',')); // Flattened array

      // Create a single object with combined topicInfo
      const result = [{
          theaterId,
          topicInfo: combinedTopicInfo
      }];

      console.log('Fetched Combined Topic Info:', result);
      return result; // Return the combined result as a single object
  } catch (error) {
      // General error handling
      console.error('Error:', error.message);
      throw new Error('Failed to fetch topic info for the given theater_id and module_names');
  }
};

const fetchTempSensorData = async (req, res) => {
  try {
      console.log('Fetching climate data...');

      const theater_id = req.headers['theater_id'];
      let module_name = req.headers['module_name'];

      const [startday, startmonth, startyear] = req.headers['startdate'].split('-').map(Number);
      const startDate = new Date(Date.UTC(startyear, startmonth - 1, startday)).toISOString();

      const [endday, endmonth, endyear] = req.headers['enddate'].split('-').map(Number);
      const enddate = new Date(Date.UTC(endyear, endmonth - 1, endday));
      enddate.setUTCHours(23, 59, 59, 999);
      const endDate = enddate.toISOString();

      console.log('Start Date:', startDate, 'End Date:', endDate);

      if (module_name === "TemperatureSensor") {
        module_name = ['TemperatureSensor1','TemperatureSensor2','TemperatureSensor3','TemperatureSensor4'];
      }

      // Fetch topicInfo data for the given theater and module names
      const dataList = await getTopicInfoByEquipmentAndModule(theater_id, module_name);
      console.log('Climate DataList:', dataList);

      // Parse the topicInfo array
      const parseData = (topicInfo) => {
          if (!topicInfo) return null; // Guard against null or undefined
          const parts = topicInfo.split('/');
          console.log('PARTS', parts, parts.length);
          return parts.length === 7
              ? {
                    theater: parts[1],
                    screen: parts[2],
                    category: parts[3],
                    subcategory: parts[4],
                    metric: parts[5],
                    field: parts[6],
                }
              : null; // Handle unexpected data structure
      };

      const parsedData = dataList
          .flatMap((module) => module.topicInfo.map(parseData))
          .filter((data) => data !== null);

      if (parsedData.length === 0) {
          throw new Error('No valid topic URLs to process');
      }

      // Extract unique values for filters
      const theater = parsedData[0].theater; // Assuming all share the same theater
      const screens = [...new Set(parsedData.map((item) => item.screen))];
      const categories = [...new Set(parsedData.map((item) => item.category))];
      const subcategories = [...new Set(parsedData.map((item) => item.subcategory))];
      const metrics = [...new Set(parsedData.map((item) => item.metric))];
      const fields = [...new Set(parsedData.map((item) => item.field))];
      const bucket = req.query.bucket || 'tms_cloud_insights_bucket'; // Default bucket

      console.log('Parsed Data:', { screens, categories, subcategories, metrics, fields });

      // Create dynamic filters for Flux query
      const screenFilter = screens.length
          ? screens.map(screen => `r["screen"] == "${screen}"`).join(' or ')
          : 'true'; // Allow all if no filter
      const categoryFilter = categories.length
          ? categories.map(category => `r["category"] == "${category}"`).join(' or ')
          : 'true';
      const subcategoryFilter = subcategories.length
          ? subcategories.map(subcategory => `r["subcategory"] == "${subcategory}"`).join(' or ')
          : 'true';
      const metricFilter = metrics.length
          ? metrics.map(metric => `r["metric"] == "${metric}"`).join(' or ')
          : 'true';
      const fieldFilter = fields.length
          ? fields.map(field => `r["_field"] == "${field}"`).join(' or ')
          : 'true';

      console.log('Filters:', { screenFilter, categoryFilter, subcategoryFilter, metricFilter, fieldFilter });

      // Construct the Flux query based on the provided query
      const query = `
          from(bucket: "${INFLUXDB_BUCKET}")
            |> range(start: ${startDate}, stop: ${endDate})
            |> filter(fn: (r) => r["_measurement"] == "theater_metrics")
            |> filter(fn: (r) => r["theater"] == "${theater}")
            |> filter(fn: (r) => ${screenFilter})
            |> filter(fn: (r) => ${categoryFilter})
            |> filter(fn: (r) => ${subcategoryFilter})
            |> filter(fn: (r) => ${metricFilter})
            |> filter(fn: (r) => ${fieldFilter})
            |> window(every: 1d)
            |> sort(columns: ["_time"], desc: true)
            |> first()
            |> yield(name: "daily_last")
      `;

      console.log('Executing Query:', query);

      // Execute the query
      const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);
      const rows = [];
      queryApi.queryRows(query, {
          next(row, tableMeta) {
              const data = tableMeta.toObject(row);
              const startDate = new Date(data['_start']);
              const stopDate = new Date(data['_stop']);
              const time = new Date(data['_time'])
              const startDateStr = formatDate(startDate);
              const startTimeStr = formatTime(startDate);

              const check_time= formatTime(time)
          //consolelog("this is time",check_time)
              const stopDateStr = formatDate(stopDate);
              const stopTimeStr = formatTime(stopDate);
              data['_start']=startTimeStr
              data['_stop']=stopTimeStr
              data['start_date']=startDateStr
              data['stop_date']=stopDateStr
              data['_time']=check_time
          //consolelog(data['start_date'],data['stop_date'])
        
              console.log('FluxData:', data);
              rows.push({
                  time: data._time,
                  theater: data.theater,
                  screen: data.screen,
                  category: data.category,
                  zone: data.zone,
                  subcategory: data.subcategory,
                  metric: data.metric,
                  field: data._field,
                  value: data._value,
                  start_date:data.start_date,
                  end_date:data.stop_date,
                  start_time:data._start,
                  end_time:data._stop
              });
          },
          error(error) {
              console.error('Query Error:', error);
              res.status(500).json({ success: false, error: error.message });
          },
          complete() {
              res.status(200).json({ success: true, data: rows });
          },
      });
  } catch (error) {
      console.error('Request Error:', error);
      res.status(500).json({ success: false, error: error.message });
  }
};

const fetchAcSensorData = async (req, res) => {
  try {
      console.log('Fetching AC sensor data...');

      const theater_id = req.headers['theater_id'];
      let module_name = req.headers['module_name'];

      const [startday, startmonth, startyear] = req.headers['startdate'].split('-').map(Number);
      const startDate = new Date(Date.UTC(startyear, startmonth - 1, startday)).toISOString();

      const [endday, endmonth, endyear] = req.headers['enddate'].split('-').map(Number);
      const enddate = new Date(Date.UTC(endyear, endmonth - 1, endday));
      enddate.setUTCHours(23, 59, 59, 999);
      const endDate = enddate.toISOString();

      console.log('Start Date:', startDate, 'End Date:', endDate);

      if (module_name === 'AC Units') {
        module_name = ['AC1 indoor unit', 'AC2 indoor unit', 'AC3 indoor unit', 'AC4 indoor unit', 'AC5 outdoor unit', 'AC6 outdoor unit', 'AC7 outdoor unit', 'AC8 outdoor unit', 'AC9 outdoor unit', 'AC10 outdoor unit'];
      }

      console.log('Sensor Module:', module_name);

      // Simulating the topicInfo data for demonstration purposes
      const dataList = await getTopicInfoByEquipmentAndModule(theater_id, module_name);
      console.log('Climate DataList:', dataList);

      // Check if dataList is valid and contains topicInfo
      if (!dataList || dataList.length === 0 || !dataList[0].topicInfo) {
          throw new Error('No topicInfo data found for the given theater and modules.');
      }

      // Parse the topicInfo array
      const parseData = (topicInfo) => {
          if (!topicInfo) return null; // Guard against null or undefined
          const parts = topicInfo.split('/');
          console.log('Len', parts.length);
          return parts.length === 8
              ? {
                    theater: parts[1],
                    screen: parts[2],
                    category: parts[3],
                    subcategory: parts[4],
                    acNumber: parts[5],
                    acType: parts[6],
                    statusField: parts[7]
                }
              : null; // Handle unexpected data structure
      };

      const parsedData = dataList
          .flatMap((module) => module.topicInfo.map(parseData))
          .filter((data) => data !== null);

      if (parsedData.length === 0) {
          throw new Error('No valid topic URLs to process');
      }

      // Extract unique values for filters
      const theater = parsedData[0].theater; // Assuming all share the same theater
      const screens = [...new Set(parsedData.map((item) => item.screen))];
      const categories = [...new Set(parsedData.map((item) => item.category))];
      const subcategories = [...new Set(parsedData.map((item) => item.subcategory))];
      const acTypes = [...new Set(parsedData.map((item) => item.acType))];
      const acNumbers = [...new Set(parsedData.map((item) => item.acNumber))];
      const fields = [...new Set(parsedData.map((item) => item.statusField))]; // Assuming "status" is always the field

      console.log('Parsed Data:', { screens, subcategories, acTypes, acNumbers, fields });

      // Create dynamic filters for Flux query
      const screenFilter = screens.length
          ? screens.map((screen) => `r["screen"] == "${screen}"`).join(' or ')
          : 'true';
      const categoryFilter = categories.length
          ? categories.map((category) => `r["category"] == "${category}"`).join(' or ')
          : 'true';
      const subcategoryFilter = subcategories.length
          ? subcategories.map((subcategory) => `r["subcategory"] == "${subcategory}"`).join(' or ')
          : 'true';
      const acTypeFilter = acTypes.length
          ? acTypes.map((acType) => `r["acType"] == "${acType}"`).join(' or ')
          : 'true';
      const acNumberFilter = acNumbers.length
          ? acNumbers.map((acNumber) => `r["acNumber"] == "${acNumber}"`).join(' or ')
          : 'true';
      const fieldFilter = fields.length
          ? fields.map((field) => `r["_field"] == "${field}"`).join(' or ')
          : 'true';

      console.log('Filters:', { screenFilter, categoryFilter, subcategoryFilter, acTypeFilter, acNumberFilter, fieldFilter });

      // Construct the Flux query based on the provided query
      const bucket = req.query.bucket || 'tms_cloud_insights_bucket'; // Default bucket
      const query = `
          from(bucket: "${INFLUXDB_BUCKET}")
            |> range(start: ${startDate}, stop: ${endDate})
            |> filter(fn: (r) => r["_measurement"] == "theater_metrics")
            |> filter(fn: (r) => r["theater"] == "${theater}")
            |> filter(fn: (r) => ${screenFilter})
            |> filter(fn: (r) => ${categoryFilter})
            |> filter(fn: (r) => ${subcategoryFilter})
            |> filter(fn: (r) => ${acNumberFilter})
            |> filter(fn: (r) => ${acTypeFilter})
            |> filter(fn: (r) => ${fieldFilter})
            |> window(every: 1d)
            |> sort(columns: ["_time"], desc: true)
            |> first()
            |> yield(name: "daily_last")
      `;

      console.log('Executing Query:', query);

      // Execute the query
      const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);
      const rows = [];
      queryApi.queryRows(query, {
          next(row, tableMeta) {
              const data = tableMeta.toObject(row);
              const startDate = new Date(data['_start']);
              const stopDate = new Date(data['_stop']);
              const time = new Date(data['_time'])
              const startDateStr = formatDate(startDate);
              const startTimeStr = formatTime(startDate);

              const check_time= formatTime(time)
          //consolelog("this is time",check_time)
              const stopDateStr = formatDate(stopDate);
              const stopTimeStr = formatTime(stopDate);
              data['_start']=startTimeStr
              data['_stop']=stopTimeStr
              data['start_date']=startDateStr
              data['stop_date']=stopDateStr
              data['_time']=check_time
         
              console.log('FluxData:', data);
              rows.push({
                  time: data._time,
                  theater: data.theater,
                  screen: data.screen,
                  zone: data.zone,
                  acType: data.acType,
                  acNumber: data.acNumber,
                  field: data._field,
                  value: data._value,
                  start_date:data.start_date,
                  end_date:data.stop_date,
                  start_time:data._start,
                  end_time:data._stop
              });
          },
          error(error) {
              console.error('Query Error:', error);
              res.status(500).json({ success: false, error: error.message });
          },
          complete() {
              res.status(200).json({ success: true, data: rows });
          },
      });
  } catch (error) {
      console.error('Request Error:', error);
      res.status(500).json({ success: false, error: error.message });
  }
};


const fetchSensorData = async (req, res) => {
  
  try {
      console.log('Fetching AC sensor data...');

      const theater_id = req.headers['theater_id'];
      let module_name = req.headers['module_name'];
      console.log(module_name)
      const [startday, startmonth, startyear] = req.headers['startdate'].split('-').map(Number);
      const startDate = new Date(Date.UTC(startyear, startmonth - 1, startday)).toISOString();

      const [endday, endmonth, endyear] = req.headers['enddate'].split('-').map(Number);
      const enddate = new Date(Date.UTC(endyear, endmonth - 1, endday));
      enddate.setUTCHours(23, 59, 59, 999);
      const endDate = enddate.toISOString();

      console.log('Start Date:', startDate, 'End Date:', endDate);

      if (module_name === 'Sensor') {
          module_name = ['Sensor'];
      }

      const dataList = await getTopicInfoByEquipmentAndModule(theater_id, module_name);
      console.log('Climate DataList:', dataList);

      const parseData = (topicInfo) => {
          const parts = topicInfo.split('/');
          console.log('Len', parts.length, parts[5]);
          return parts.length === 8
              ? {
                  theater: parts[1],
                  screen: parts[2],
                  category: parts[3],
                  subcategory: parts[4],
                  sensor: parts[5],
                  sensorType: parts[6],
                  statusField: parts[7],
              }
              : null;
      };

      const parsedData = dataList
          .flatMap((module) => module.topicInfo.map(parseData))
          .filter((data) => data !== null);

      if (parsedData.length === 0) {
          throw new Error('No valid topic URLs to process');
      }

      const theater = parsedData[0].theater;
      const screens = [...new Set(parsedData.map((item) => item.screen))];
      const categories = [...new Set(parsedData.map((item) => item.category))];
      const subcategories = [...new Set(parsedData.map((item) => item.subcategory))];
      const sensors = [...new Set(parsedData.map((item) => item.sensor))];
      const sensorTypes = [...new Set(parsedData.map((item) => item.sensorType))];
      const fields = [...new Set(parsedData.map((item) => item.statusField))];

      console.log('Parsed Data:', { screens, subcategories, sensors, sensorTypes, fields });

      const screenFilter = screens.length
          ? `${screens.map((screen) => `r["screen"] == "${screen}"`).join(' or ')}`
          : 'true';
      const categoryFilter = categories.length
          ? `${categories.map((category) => `r["category"] == "${category}"`).join(' or ')}`
          : 'true';
      const subcategoryFilter = subcategories.length
          ? `${subcategories.map((subcategory) => `r["subcategory"] == "${subcategory}"`).join(' or ')}`
          : 'true';
      const sensorFilter = sensors.length
          ? `${sensors.map((sensor) => `r["sensor"] == "${sensor}"`).join(' or ')}`
          : 'true';
      const sensorTypeFilter = sensorTypes.length
          ? `${sensorTypes.map((sensorType) => `r["sensorType"] == "${sensorType}"`).join(' or ')}`
          : 'true';
      const fieldFilter = fields.length
          ? `${fields.map((field) => `r["_field"] == "${field}"`).join(' or ')}`
          : 'true';

      console.log('Filters:', { screenFilter, categoryFilter, subcategoryFilter, sensorFilter, sensorTypeFilter, fieldFilter });

      const bucket = req.query.bucket || 'tms_cloud_insights_bucket';
      const query = `
          from(bucket: "${INFLUXDB_BUCKET}")
          |> range(start: ${startDate}, stop: ${endDate})
          |> filter(fn: (r) => r["_measurement"] == "theater_metrics")
          |> filter(fn: (r) => r["theater"] == "${theater}")
          |> filter(fn: (r) => ${screenFilter})
          |> filter(fn: (r) => ${categoryFilter})
          |> filter(fn: (r) => ${subcategoryFilter})
          |> filter(fn: (r) => ${sensorFilter})
          |> filter(fn: (r) => ${sensorTypeFilter})
          |> filter(fn: (r) => ${fieldFilter})
          |> window(every: 1d)
          |> sort(columns: ["_time"], desc: true)
          |> first()
          |> yield(name: "daily_last")
      `;

      console.log('Executing Query:', query);

      const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);
      const rows = [];
      queryApi.queryRows(query, {
          next(row, tableMeta) {
              const data = tableMeta.toObject(row);
              const startDate = new Date(data['_start']);
              const stopDate = new Date(data['_stop']);
              const time = new Date(data['_time'])
              const startDateStr = formatDate(startDate);
              const startTimeStr = formatTime(startDate);

              const check_time= formatTime(time)
          //consolelog("this is time",check_time)
              const stopDateStr = formatDate(stopDate);
              const stopTimeStr = formatTime(stopDate);
              data['_start']=startTimeStr
              data['_stop']=stopTimeStr
              data['start_date']=startDateStr
              data['stop_date']=stopDateStr
              data['_time']=check_time
         
              console.log('FluxData:', data);

              rows.push({
                  time: data._time,
                  theater: data.theater,
                  screen: data.screen,
                  zone: data.zone,
                  acType: data.acType,
                  acNumber: data.acNumber,
                  field: data._field,
                  value: data._value,
                  start_date:data.start_date,
                  end_date:data.stop_date,
                  start_time:data._start,
                  end_time:data._stop
              });
          },
          error(error) {
              console.error('Query Error:', error);
              res.status(500).json({ success: false, error: error.message });
          },
          complete() {
              res.status(200).json({ success: true, data: rows });
          },
      });
  } catch (error) {
      console.error('Request Error:', error);
      res.status(500).json({ success: false, error: error.message });
  }
};


// Function to calculate break end time based on start time and duration
const calculateBreakEndTime = (startTime, durationMinutes) => {
  const [hours, minutes, seconds] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + parseInt(durationMinutes, 10);
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:${String(seconds || 0).padStart(2, '0')}`;
};

// Helper function to get show_type_id based on the start time
const getShowTypeId = async (startTime) => {
  const { data, error } = await supabase
    .from('ShowTypeMaster')
    .select('show_type_id')
    .lte('show_start_time', startTime)
    .gt('show_end_time', startTime)
    .limit(1);

  if (error || data.length === 0) {
    console.error('Error fetching show_type_id:', error);
    return null;
  }
  return data[0].show_type_id;
};

// Helper function to convert date format from 'DD-MM-YYYY' to 'YYYY-MM-DD'
const convertDate = (dateStr) => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

function generateShowId() {
  // Generate a random number (for example between 1 and 999)
  const randomNumber = Math.floor(Math.random() * 1000); // Random number from 0 to 999

  // Format it to always have 3 digits, e.g., 001, 002, ..., 999
  const formattedNumber = randomNumber.toString().padStart(3, '0');

  // Return the show_id in the format "SH" followed by the formatted number
  return `SH${formattedNumber}`;
}

const uploadCSVFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        const transformedResults = await Promise.all(
          results.map(async (row) => {

            if (!row.theater_name) {
              throw new Error('Theater name is missing or invalid.');
            }

            console.log('Theater Name:', row.theater_name);


            // Validate theater_id
            const theaterValidation = await supabase
              .from('TheaterInfo')
              .select('theater_id')
              .eq('theater_name', row.theater_name);
            console.log('Theater :',row.theater_name);
            console.log('Theater Validation:', theaterValidation.data[0]['theater_id'],row.theater_name);



            if (theaterValidation.data.length === 0) {
              throw new Error(`Invalid theater_id: ${row.theater_id}`);
            }

            // Validate screen_id
            const screenValidation = await supabase
              .from('ScreenMaster')
              .select('screen_id')
              .eq('screen_name', row.screen_name)
              .eq('theater_id', theaterValidation.data[0]['theater_id']);
            console.log('Screen Validation:', screenValidation);
            const show_ids = await supabase
              .from('MovieShow')
              .select('show_id')
              .eq('screen_id',screenValidation.data[0]['screen_id'] )

              console.log(show_ids.data[0],show_ids.data.length,row.show_type)
              let show_id
              if(row.show_type==="Monring_Show"){
                if(show_ids.data && show_ids.data[0]){
                  show_id=show_ids.data[0]
                }
                else{
                   show_id = generateShowId();
                }
              }
              else if(row.show_type==="Matnee_Show"){
                if(show_ids.data && show_ids.data[1]){
                  show_id=show_ids.data[1]
                }
                else{
                  show_id = generateShowId();
                }
                
              }
              else if(row.show_type==="Evening_Show"){
                if(show_ids.data && show_ids.data[2]){
                  show_id=show_ids.data[2]
                }
                else{
                  show_id = generateShowId();
                }
                
              }
              else if(row.show_type==="Night_Show"){
                if(show_ids.data && show_ids.data[3]){
                  show_id=show_ids.data[3]
                }
                else{
                  
                  show_id = generateShowId();
                }
                
              }
              else if(row.show_type==="Late_Night_Show"){
                if(show_ids.data && show_ids.data[4]){
                  show_id=show_ids.data[4]
                }
                else{
                  
                  show_id = generateShowId();
                }
                
              }
              else{
                console.log("else is executing")
                show_id=0
              }

            if (screenValidation.data.length === 0) {
              throw new Error(`Invalid screen_id: ${row.screen_id} for theater_id: ${row.theater_id}`);
            }

            // Get show_type_id based on show_start_time
            const showTypeId = await getShowTypeId(row.show_start_time);
            if (!showTypeId) {
              throw new Error(`No show_type_id found for show_start_time: ${row.show_start_time}`);
            }

            // Calculate break_end_time
            const breakEndTime = calculateBreakEndTime(row.break_start_time, row.break_duration);
            console.log('Calculated Break End Time:', breakEndTime);

            // Transform the data
            console.log("this is new generated showid",show_id['show_id'],row.start_date,row.end_date)
            return {
              show_id: show_id['show_id'], // Assuming movie_id is used as show_id
              theater_id: theaterValidation.data[0]['theater_id'],
              screen_id: screenValidation.data[0]['screen_id'],
              show_type_id: showTypeId,
              show_start_time: row.show_start_time,
              show_end_time: row.show_end_time,
              break_start_time: row.break_start_time,
              break_end_time: breakEndTime,
              show_start_date: convertDate(row.start_date), // Assuming date is in 'DD-MM-YYYY' format
              show_end_date: convertDate(row.end_date), // Assuming date is in 'DD-MM-YYYY' format
              Movie_Name: row.movie_name,
              
            };
          })
        );

        // Check if the show_id already exists in the MovieShow table
        let checkresult=transformedResults
        console.log(checkresult)
        const { data: existingData, error: existingError } = await supabase
          .from('MovieShow')
          .select('show_id')
          .in('show_id', transformedResults.map((row) => row.show_id
        ));

        if (existingError) {
          console.error('Error checking existing data:', existingError);
          return res.status(500).json({ success: false, message: 'Error checking existing data', error: existingError });
        }

        // Ensure that existingData is an array (in case there is no existing data)
        const existingShowIds = existingData ? existingData.map((row) => row.show_id) : [];
        console.log('Existing Show IDs:', existingShowIds);

        // Filter out data that already exists (for update) and data to insert (new shows)
        const dataToInsert = transformedResults.filter((row) => !existingShowIds.includes(row.show_id));
        const dataToUpdate = transformedResults.filter((row) => existingShowIds.includes(row.show_id));

        // Insert new records
        if (dataToInsert.length) {
          const { data, error, status, count } = await supabase.from('MovieShow').upsert(dataToInsert, { onConflict: ['show_id'], returning: 'representation', count: 'exact' });
          if (error) {
            console.error('Supabase Error on Insert:', error);
            return res.status(500).json({ success: false, message: 'Failed to insert new data', error });
          }
          console.log(`Inserted ${count} new records.`);
        }

        // Update existing records (if any)
        if (dataToUpdate.length) {
          const { data, error, status, count } = await supabase.from('MovieShow').upsert(dataToUpdate, { onConflict: ['show_id'], returning: 'representation', count: 'exact' });
          if (error) {
            console.error('Supabase Error on Update:', error);
            return res.status(500).json({ success: false, message: 'Failed to update existing data', error });
          }
          console.log(`Updated ${count} existing records.`);
        }

        // Remove the uploaded file after processing
        fs.unlinkSync(filePath);

        // Respond with success
        res.status(200).json({
          success: true,
          message: 'Data processed successfully',
        });

      } catch (err) {
        console.error('Error processing CSV:', err);
        res.status(500).json({ success: false, message: 'Error processing file', error: err.message });
      }
    })
    .on('error', (error) => {
      console.error('CSV Parsing Error:', error);
      res.status(500).json({ success: false, message: 'Failed to process CSV file', error: error.message });
    });
};

module.exports = {fetchMulFandBData,fetchParkingData,fetchadmitsCount,
  fetchTempSensorData,fetchAcSensorData,fetchSensorData,uploadCSVFile}