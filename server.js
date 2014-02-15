// set up
var express = require('express');
var app = express();
var Bookshelf = require('bookshelf');
var _ = require('lodash');
_.str = require('underscore.string');

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
var knex = MySql.knex;

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

var Utils = {
  camelizePropertyNames: function (model) {
    return _.reduce(model, function (memo, val, key) {
      memo[_.str.camelize(key)] = val;
      return memo;
    }, {});
  },
  snakeCasePropertyNames: function (model) {
    return _.reduce(model, function (memo, val, key) {
      memo[_.str.underscored(key)] = val;
      return memo;
    }, {});
  }
};

// define model
var BaseModel = MySql.Model.extend({
  format: Utils.snakeCasePropertyNames,
  parse: Utils.camelizePropertyNames
});

var EventDefinition = BaseModel.extend({
  tableName: 'event_definitions',
  hasTimestamps: true,
  occurrences: function () {
    return this.hasMany(EventOccurrence);
  }
});

var EventOccurrence = BaseModel.extend({
  tableName: 'event_occurrences',
  hasTimestamps: ['createdAt'],
  eventDefinition: function () {
    return this.belongsTo(EventDefinition);
  }
});

// define routes
app.get('/api/event-definitions', function (req, res) {
  EventDefinition.collection()
    .fetch({
      withRelated: [
        'occurrences',
        {
          'occurrences': function (qb) {
            qb.where(knex.raw('DATE(`created_at`) = DATE(NOW())'));
          }
        }
      ]
    })
    .then(function (eventDefinitions) {
    res.json(eventDefinitions.map(function (model) {
      var result = Utils.snakeCasePropertyNames(model.toJSON());

      result.occurrences = _.map(result.occurrences, function (model) {
        return Utils.snakeCasePropertyNames(model);
      });

      return result;
    }));
  })
});

app.post('/api/event-definitions', function (req, res) {
  var newEventDefinition = EventDefinition.forge({
    name: req.body.name,
    expectedDailyOccurrences: req.body.expected_daily_occurrences
  });

  newEventDefinition.save()
    .then(function (createdModel) {
      res.json(Utils.snakeCasePropertyNames(createdModel.toJSON()));
    })
    .catch(function (e) {
      console.error('failed to create new event definition', e);
      res.status(500);
      res.json(arguments);
    });
});

app.delete('/api/event-definitions/:eventDefinitionId', function (req, res) {
  EventDefinition.forge({id: req.params.eventDefinitionId})
    .fetch({require: true})
    .then(function (modelToDelete) {
      modelToDelete.destroy();

      res.json(Utils.snakeCasePropertyNames(modelToDelete.toJSON()));
    })
    .catch(function (e) {
      console.error('failed to delete an event definition', e);
      res.status(500);
      res.json(arguments);
    });
});

app.post('/api/event-definitions/:eventDefinitionId/record-occurrence', function (req, res) {
  EventDefinition.forge({id: req.params.eventDefinitionId})
    .fetch({require: true})
    .then(function (eventDefinition) {
      return eventDefinition.related('occurrences')
        .create({})
        .yield(eventDefinition);
    })
    .then(function (eventDefinition) {
      return eventDefinition.occurrences()
        .query(function (qb) {
          qb.where(knex.raw('DATE(`created_at`) = DATE(NOW())'));
        })
        .fetch();
    })
    .then(function (occurrences) {
      res.status(201);
      res.json(occurrences.map(function (model) {
        return Utils.snakeCasePropertyNames(model.toJSON());
      }));
    })
    .catch(function (e) {
      console.error('failed to record an event occurrence', e);
      res.status(500);
      res.json(arguments);
    });
})

// frontend application route
app.get('*', function (req, res) {
  res.sendfile('./public/index.html');
});
// boot
app.listen(LISTEN_PORT);
console.info('app listening on port', LISTEN_PORT);
