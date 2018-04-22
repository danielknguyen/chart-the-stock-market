var mongoose = require('mongoose'),
    // mongoose schema method
    Schema = mongoose.Schema,
    // mongoose objectId
    ObjectId = Schema.ObjectId;

var db = require('../libs/db.js');

var stockSchema = new Schema({
  id: ObjectId,
  symbol: {
    type: String,
    trim: true,
    unique: true
  }
});

var Stock = db.model('Stock', stockSchema);
module.exports = Stock;
