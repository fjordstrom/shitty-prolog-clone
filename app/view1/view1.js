'use strict';

angular.module('myApp.view1', [
    'ngRoute',
    'ngFileUpload',
    'myApp.services.XMLParser',
    'myApp.services.PseudoPrologMachine'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', 'XMLParser', 'PseudoPrologMachine', function($scope, XMLParser, PseudoPrologMachine) {

    $scope.submit = function() {


          console.log($scope.file);

          var x = new FileReader();
          x.readAsText($scope.file);

          x.onloadend = function() {
            var parsedXML = XMLParser.parse(x.result);
            var hotStuff = XMLParser.parsedXMLToInternal(parsedXML);

            PseudoPrologMachine.load(hotStuff);

            $scope.showMeDaProlog = PseudoPrologMachine.printAsArray();
            $scope.$apply();
          };
    };

    $scope.runQuery = function(query) {
        console.log(query);
    }
}]);