const express = require('express');
const { getDeviceData } = require('../controllers/deviceController');
const {getAICameraSettings}= require('../controllers/getAllCameraSettings')
const { getSchedules } = require('../controllers/getSchedules')
const {getDeviceSchedules} = require('../controllers/getDeviceSchedules')
const { getEquipmentData } = require('../controllers/getEquipmentSettings')
const { fetchMulFandBData,fetchParkingData,fetchadmitsCount,fetchTempSensorData,fetchAcSensorData,fetchSensorData} = require('../models/topicsApi');
const { getAllTheaters,getScreensByTheater,getShowsByTheaterAndScreen,getEquipmentByTheater,getShowInfoByTheater } = require('../models/getTheaters')
const { uploadCSVFile }=require('../models/topicsApi')
const router = express.Router();
const multer = require('multer');


const upload = multer({ dest: 'uploads/' });

// Route to fetch device data by API key from URL parameter
// router.get("/GetTheaterSettings/:api_key", getDeviceData);
router.get("/GetTheaterSettings", getDeviceData);
router.get('/GetAICameraSettings', getAICameraSettings);
router.get('/GetEquipmentSchedules', getSchedules);
router.get('/GetDeviceSchedules', getDeviceSchedules);
router.get('/GetEquipmentSettings', getEquipmentData);
router.get('/GetAlltheaters',getAllTheaters);
router.get('/GetScreensByTheater',getScreensByTheater);
router.get('/GetShowsByTheaterAndScreen',getShowsByTheaterAndScreen);
router.get('/GetEquipmentByTheater',getEquipmentByTheater);
router.get('/GetShowInfoByTheater',getShowInfoByTheater);

router.get('/fetchParkingData', fetchParkingData );
router.get('/fetchTempSensorData',fetchTempSensorData);
router.get('/fetchAcSensorData',fetchAcSensorData);
router.get('/fetchSensorData',fetchSensorData);
router.get('/GetfetchMulFandBData', fetchMulFandBData );
router.get('/fetchadmitsCount', fetchadmitsCount );


router.post('/PostuploadCSVFile',upload.single('file'), uploadCSVFile )




module.exports = router;
