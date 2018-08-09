var express = require('express');
var router = express.Router();

// Require controller modules.
var event_controller = require('../controllers/eventController');
var activity_controller = require('../controllers/activityController');

/// EVENT ROUTES ///

// GET agenda home page.
router.get('/', event_controller.index);

// GET request for creating a Event.
router.get('/event/create', event_controller.event_create_get);

// POST request for creating Event.
router.post('/event/create', event_controller.event_create_post);

// GET request to delete Event.
router.get('/event/:id/delete', event_controller.event_delete_get);

// POST request to delete Event.
router.post('/event/:id/delete', event_controller.event_delete_post);

// GET request to update Event.
router.get('/event/:id/update', event_controller.event_update_get);

// POST request to update Event.
router.post('/event/:id/update', event_controller.event_update_post);

// GET request for one Event.
router.get('/event/:id', event_controller.event_detail);

// GET request for list of all Event items.
router.get('/events', event_controller.event_list);

/// ACTIVITY ROUTES ///

// GET request for creating Activity.
router.get('/activity/create', activity_controller.activity_create_get);

// POST request for creating Activity.
router.post('/activity/create', activity_controller.activity_create_post);

// GET request to delete Activity.
router.get('/activity/:id/delete', activity_controller.activity_delete_get);

// DELETE request to delete Activity.
router.post('/activity/:id/delete', activity_controller.activity_delete_post);

// GET request to update Activity.
router.get('/activity/:id/update', activity_controller.activity_update_get);

// POST request to update Activity.
router.post('/activity/:id/update', activity_controller.activity_update_post);

// GET request for one Activity.
router.get('/activity/:id', activity_controller.activity_detail);

// GET request for list of all Activitys.
router.get('/activities', activity_controller.activity_list);

module.exports = router;
