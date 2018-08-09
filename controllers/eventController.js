var Event = require('../models/event');
var Activity = require('../models/activity');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        event_count: function(callback) {
          Event.count(callback);
        },
        event_active_count: function(callback) {
          Event.count({is_active: true}, callback);
        },
        activity_count: function(callback) {
          Activity.count(callback)
        }
      }, function(err, results) {
        res.render('index', {
          title: 'Event Dashboard',
          error: err,
          data: results
        });
      });
    };

    // Display list of all Events.
    exports.event_list = function(req, res) {
      Event.find({}, 'activity date_of_start is_active')
        .sort([['date_of_creation', 'descending']])
        .populate('activity')
        .exec(function (err, list_events) {
          if (err) { return next(err); }

          res.render('event_list', { title: 'Event List', event_list: list_events});
        })
    };

    // Display detail page for a specific Event.
    exports.event_detail = function(req, res, next) {

      async.parallel({
        event: function(callback) {
          Event.findById(req.params.id)
            .populate('activity')
            .exec(callback);
        }
      }, function (err, results) {
        if (err) { return next(err); }
        if (results.event==null) {
          var err = new Error('Event not fount');
          err.status = 404;
          return next(err);
        }

        res.render('event_detail', { title: 'Event', event: results.event});
      });
    };

    // Display Event create form on GET.
    exports.event_create_get = function(req, res, next) {
      Activity.find(function (err, activities) {
        if (err) { return next(err); }
        res.render('event_form', { title: 'Create Event', activities: activities});
      })
    };

    // Handle Event create on POST.
    exports.event_create_post = [
      body('activity', 'Activity must not be empty.').isLength({min:1}).trim().isMongoId(),
      body('event_date', 'Invalid event date. Use YYYY-MM-DD format.').isISO8601(),
      body('start_time', 'Invalid event start time. Use HH:MM format').matches(/^(([01][0-9])|(2[0-3])):[0-5][0-9]$/),
      body('end_time', 'Invalid event end time. Use HH:MM format').matches(/^(([01][0-9])|(2[0-3])):[0-5][0-9]$/),

      sanitizeBody('*').trim().escape(),

      (req, res, next) => {
        const errors = validationResult(req);

        var date_of_start = `${req.body.event_date}T${req.body.start_time}`;
        var date_of_end = `${req.body.event_date}T${req.body.end_time}`;
        var is_active = req.body.is_active==='on';

        var event = new Event({
          activity: req.body.activity,
          date_of_start: date_of_start,
          date_of_end: date_of_end,
          is_active: is_active
        });

        if (!errors.isEmpty()) {
          Activity.find(function (err, activities) {
            if (err) { return next(err); }
            res.render('event_form', { title: 'Create Event', activities: activities, event: event, errors: errors.array()});
          });
          return;
        } else {
          // Data is valid
          event.save(function (err) {
            if (err) { return next(err); }
            res.redirect(event.url);
          })
        }
      }
    ]

    // Display Event delete form on GET.
    exports.event_delete_get = function(req, res, next) {
      Event.findById(req.params.id)
        .populate('activity')
        .exec(function (err, event) {
          if (err) { return next(err); }
          if (event==null) {
            res.redirect('/agenda/events');
          }
          // Success
          res.render('event_delete', { title: 'Delete Event', event: event });
        })
    };

    // Handle Event delete on POST.
    exports.event_delete_post = function(req, res, next) {
      Event.findById(req.body.eventid, function (err, event) {
          if (err) { return next(err); }
          Event.findByIdAndRemove(req.body.eventid, function deleteEvent(err) {
            if (err) { return next(err); }
            res.redirect('/agenda/events');
          })
        })
    };

    // Display Event update form on GET.
    exports.event_update_get = function(req, res, next) {

      async.parallel({
        event: function(callback) {
          Event.findById(req.params.id).populate('activity').exec(callback);
        },
        activities: function(callback) {
          Activity.find(callback);
        }
      }, function (err, results) {
          if (err) { return next(err); }
          if (results.event == null) {
            var err = new Error('Event not found');
            err.status = 404;
            return next(err);
          }
          // Success
          res.render('event_form', { title: 'Update Event', event: results.event, activities: results.activities })
      })
    };

    // Handle Event update on POST. PUT?
    exports.event_update_post = [

      body('activity', 'Activity must not be empty.').isLength({min:1}).trim().isMongoId(),
      body('event_date', 'Invalid event date. Use YYYY-MM-DD format.').isISO8601(),
      body('start_time', 'Invalid event start time. Use HH:MM format').matches(/^(([01][0-9])|(2[0-3])):[0-5][0-9]$/),
      body('end_time', 'Invalid event end time. Use HH:MM format').matches(/^(([01][0-9])|(2[0-3])):[0-5][0-9]$/),

      sanitizeBody('*').trim().escape(),

      (req, res, next) => {
        const errors = validationResult(req);

        var date_of_start = `${req.body.event_date}T${req.body.start_time}`;
        var date_of_end = `${req.body.event_date}T${req.body.end_time}`;
        var is_active = req.body.is_active==='on';

        var event = new Event({
          activity: req.body.activity,
          date_of_start: date_of_start,
          date_of_end: date_of_end,
          is_active: is_active,
          _id: req.params.id
        });

        if (!errors.isEmpty()) {
          Activity.find(function (err, activities) {
            if (err) { return next(err); }
            res.render('event_form', { title: 'Update Event', activities: activities, event: event, errors: errors.array()});
          });
          return;
        } else {
          // Data is valid
          Event.findByIdAndUpdate(req.params.id, event, {}, function (err, theevent) {
            if (err) { return next(err); }
            res.redirect(theevent.url);
          })
        }
      }
    ]
