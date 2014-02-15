angular.module('RECON', [])
  .factory('Utils', function () {
    return {
      camelizePropertyNames: function (model) {
        return _.reduce(model, function (memo, val, key) {
          memo[_.str.camelize(key)] = val;
          return memo;
        }, {});
      }
    };
  })
  .controller('EventDefinitionController', function ($scope, $http, Utils) {
    $scope.formData = {};

    $http.get('/api/event-definitions')
      .success(function (data) {
        $scope.eventDefinitions = _.map(data, Utils.camelizePropertyNames);
      })
      .error(function (data) {
        console.error('Error while fetching event definitions; arguments:', arguments);
      });
  })
