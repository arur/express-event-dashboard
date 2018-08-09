var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ActivitySchema = new Schema(
  {
    description: {type: String, required: true, min: 3, max: 100},
    date_of_creation: {type: Date, default: Date.now}
  }
);

ActivitySchema
.virtual('url')
.get(function () {
  return '/agenda/activity/' + this._id;
});


module.exports = mongoose.model('Activity', ActivitySchema);
