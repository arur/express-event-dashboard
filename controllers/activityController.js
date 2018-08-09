var Activity = require('../models/activity');
var Event = require('../models/event');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all Activities.
exports.activity_list = function(req, res, next) {

  Activity.find()
    .sort([
      ['description', 'ascending']
    ])
    .exec(function(err, list_activities) {
      if (err) {
        return next(err)
      };

      res.render('activity_list', {
        title: 'Activity List',
        activity_list: list_activities
      });
    });
};

// Display detail page for a specific Activity.
exports.activity_detail = function(req, res, next) {

  async.parallel({
    activity: function(callback) {
      Activity.findById(req.params.id)
        .exec(callback)
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }
    if (results.activity == null) {
      var err = new Error('Activity not found');
      err.status = 404;
      return next(err);
    }

    res.render('activity_detail', {
      title: 'Activity Detail',
      activity: results.activity
    });
  });
};

// Display Activity create form on GET.
exports.activity_create_get = function(req, res, next) {
  res.render('activity_form', {
    title: 'Create Activity'
  });
};

// Handle Activity create on POST.
exports.activity_create_post = [
  body('description').isLength({ min: 3 }).trim()
    .withMessage('Description must be at least 3 characters'),

  sanitizeBody('description').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var activity = new Activity({
      description: req.body.description
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('activity_form', { title: 'Create Activity', activity: activity, errors: errors.array() });
      return;
    } else {
      Activity.findOne({ 'description': req.body.description })
        .exec(function(err, found_activity) {
          if (err) {
            return next(err);
          }
          if (found_activity) {
            res.redirect(found_activity.url);
          } else {
            activity.save(function(err) {
              if (err) {
                return next(err);
              }
              res.redirect(activity.url)
            })
          }
        })
    }
  }
]
// Display Activity delete form on GET.
exports.activity_delete_get = function(req, res, next) {

  async.parallel({
    activity: function(callback) {
      Activity.findById(req.params.id).exec(callback)
    },
    events_with_activity: function(callback) {
      Event.find({ 'activity': req.params.id }).exec(callback)
    }
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.activity==null) {
      res.redirect('/agenda/activities');
    }
    // Success
    res.render('activity_delete', { title: 'Delete Activity', activity: results.activity, events_with_activity: results.events_with_activity});

  });
};

// Handle Activity delete on POST. HTML has dropped support for DELETE, PUT from forms
exports.activity_delete_post = function(req, res, next) {
  async.parallel({
    activity: function(callback) {
      Activity.findById(req.body.activityid).exec(callback)
    },
    events_with_activity: function(callback) {
      Event.find({ 'activity': req.body.activityid }).exec(callback)
    }
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.events_with_activity.length > 0) {
      res.render('activity_delete', { title: 'Delete Activity', activity: results.activity, events_with_activity: results.events_with_activity});
    } else {
      Activity.findByIdAndRemove(req.body.activityid, function deleteActivity(err) {
        if (err) { return next(err); }
        res.redirect('/agenda/activities');
      })
    }
  });
};

// Display Activity update form on GET.
exports.activity_update_get = function(req, res, next) {
  Activity.findById(req.params.id, function (err, activity) {
    if (err) { return next(err); }
    if (activity==null) {
      var err = new Error('Activity not found');
      err.status = 404;
      return next(err);
    }
    // Succeess
    res.render('activity_form', { title: 'Update Activity', activity: activity })
  })
};

// Handle Activity update on POST
exports.activity_update_post = [
  body('description').isLength({ min: 3 }).trim()
    .withMessage('Description must be at least 3 characters'),

  sanitizeBody('description').trim().escape(),

  (req, res, next) => {

    const errors = validationResult(req);

    var activity = new Activity({
      description: req.body.description,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      res.render('activity_form', { title: 'Update Activity', activity: activity })
      return;

    } else {
      Activity.findByIdAndUpdate(req.params.id, activity, {}, function (err, theactivity) {
        if (err) { return next(err); }

        res.redirect(theactivity.url);
      });
    }
  }
]
