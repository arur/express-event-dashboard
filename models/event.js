var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var EventSchema = new Schema(
  {
    date_of_start: {type: Date, required: true},
    date_of_end: {type: Date, required: true},
    is_active: {type: Boolean, default: false},
    activity: {type: Schema.ObjectId, ref: 'Activity', required: true},
    date_of_creation: {type: Date, default: Date.now}
  }
);

// Virtual for event's URL
EventSchema
.virtual('url')
.get(function () {
  return '/agenda/event/' + this._id;
});

EventSchema
.virtual('date_of_creation_formatted')
.get(function () {
  return moment(this.date_of_creation).format('MMMM Do, YYYY h:mm a');
});

EventSchema
.virtual('date_of_start_formatted')
.get(function () {
  return moment(this.date_of_start).format('MMMM Do, YYYY');
});

EventSchema
.virtual('date_of_end_formatted')
.get(function () {
  return moment(this.date_of_end).format('MMMM Do, YYYY');
});

EventSchema
.virtual('time_of_end')
.get(function () {
  return moment(this.date_of_end).format('h:mm a');
});

EventSchema
.virtual('time_of_start')
.get(function () {
  return moment(this.date_of_start).format('h:mm a');
});
module.exports = mongoose.model('Event', EventSchema);
