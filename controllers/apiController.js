var Event = require('../models/event');
var Activity = require('../models/activity');
const { param, query, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// const moment = require('moment');

var async = require('async');

exports.api_not_found = function (req, res) {
  return res.status(404).json({message: 'Not Found'})
}

// Get list of avtive Events between dates.
exports.event_list_between_dates = [
  // param('start', 'Invalid start date.').isISO8601(),
  // param('end', 'Invalid end date.').isISO8601(),

  query('start', 'Invalid start date.').isISO8601(),
  query('end', 'Invalid end date.').isISO8601(),

  (req, res) => {
    const errors = validationResult(req);

    // console.log(req.query);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    } else {
      Event.find({
        is_active: 'true',
        date_of_start: {
          $gte: new Date(req.query.start),
          $lt: new Date(req.query.end)
        }
      })
        .select('activity date_of_start date_of_end')
        .sort([['date_of_start', 1]])
        .populate({path: 'activity', select: 'description'})
        // .lean()
        .exec(function(err, events) {
          if (err) {
            res.send(err.message);
          }

          res.json(events);
        });
    }
  }
];
