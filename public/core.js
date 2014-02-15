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
        })
        .error(function (data) {
          console.error('Error while creating an event definition; arguments:', arguments);
        });
    };
  })
