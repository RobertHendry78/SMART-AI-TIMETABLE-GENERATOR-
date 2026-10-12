const express = require('express');
const router = express.Router();

const timetableController = require('../controllers/timetableController');
const substituteController = require('../controllers/substituteController');

// Timetable Endpoints
router.get('/master-data', timetableController.getMasterData);
router.get('/timetable', timetableController.getTimetable);
router.post('/timetable/save', timetableController.saveTimetable);
router.post('/timetable/generate-ortools', timetableController.generateOrTools);

module.exports = router;

