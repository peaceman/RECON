// set up
var express = require('express');
var app = express();
var Bookshelf = require('bookshelf');

// configuration
var LISTEN_PORT = 1337;
var MySql = Bookshelf.initialize({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    database: 'recon',
    charset: 'utf8'
  }
});

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

// define models
var EventDefinition = MySql.Model.extend({
  tableName: 'event_definitions',
  hasTimestamp: true,
  occurrences: function () {
    return this.hasMany(EventOccurrence);
  }
});

var EventOccurrence = MySql.Model.extend({
  tableName: 'event_occurrences',
  hasTimestamp: ['createdAt'],
  eventDefinition: function () {
    return this.belongsTo(EventDefinition);
  }
});

// define routes
app.get('/api/event-definitions', function (req, res) {
  EventDefinition.collection().fetch().then(function (eventDefinitions) {
    res.json(eventDefinitions);
  })
});

// boot
app.listen(LISTEN_PORT);
console.info('app listening on port', LISTEN_PORT);
