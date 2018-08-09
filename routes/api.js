var express = require('express');
var router = express.Router();

var api_controller = require('../controllers/apiController');

router.get('/events/dates', api_controller.event_list_between_dates);

router.get('/*', api_controller.api_not_found);

module.exports = router;
