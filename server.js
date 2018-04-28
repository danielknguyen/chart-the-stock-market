var express = require('express'),
    dotenv = require('dotenv').config(),
    bodyParser = require('body-parser'),
    engines = require('consolidate'),
    app = express(),
    morgan = require('morgan'),
    yahooFinance = require('yahoo-finance'),
    socket = require('socket.io');

var appConfig = function() {
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.engine('html', engines.nunjucks);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(morgan('dev'));
}();

var port = process.env.PORT || 27017;
var server = app.listen(port, function() {
  console.log("Express server is listening on port %s.", port);
});

var io = socket(server);

var Stock = require('./models/stockSchema.js');
var routes = require('./routes/routes.js')(app, yahooFinance, Stock, io, socket);
