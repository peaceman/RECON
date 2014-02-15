angular.module('RECON', [])
  .factory('Utils', function () {
    return {
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
  })
  .controller('EventDefinitionController', function ($scope, $http, Utils) {
    $scope.formData = {};
    $scope.eventDefinitions = [];

    $http.get('/api/event-definitions')
      .success(function (data) {
        $scope.eventDefinitions = _.map(data, Utils.camelizePropertyNames);
      })
      .error(function (data) {
        console.error('Error while fetching event definitions; arguments:', arguments);
      });

    $scope.createEventDefinition = function () {
      $http.post('/api/event-definitions', Utils.snakeCasePropertyNames($scope.formData))
        .success(function (data) {
          console.info('Created new event definition; arguments:', arguments);
          $scope.eventDefinitions.push(Utils.camelizePropertyNames(data));
          $scope.formData = {};
          $scope.form.$setPristine();
        })
        .error(function (data) {
          console.error('Error while creating an event definition; arguments:', arguments);
        });
    };

    $scope.deleteEventDefinition = function (eventDefinition) {
      $http.delete('/api/event-definitions/' + eventDefinition.id)
        .success(function (data) {
          console.info('Deleted event definition; arguments:', arguments);
          _.remove($scope.eventDefinitions, {id: eventDefinition.id});
        })
        .error(function (data) {
          console.error('Error while deleting an event definition; arguments:', arguments);
        });
    };

    $scope.recordEventOccurrence = function (eventDefinition) {
      $http.post('/api/event-definitions/' + eventDefinition.id + '/record-occurrence')
        .success(function (data) {
          console.info('Recorded occurrence; arguments:', arguments);
          eventDefinition.occurrences = _.map(data, Utils.camelizePropertyNames);
        })
        .error(function (data) {
          console.error('Error while recoring an occurrence; arguments:', arguments);
        });
    };
  })
