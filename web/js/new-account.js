var app = angular.module('myApp', []);

app.controller('MyController', function($scope, $http) {
	$scope.accounts = {};
	
	$scope.objKeyLength = function(obj) {
		return Object.keys(obj).length;
	}
	
	$scope.generate = function() {
		for (var key in $scope.accounts) {
			delete $scope.accounts[key];
		}
		
		for (var i=0; i<10; i++) {
			var account = stellar.random();
			$scope.accounts[account.address] = account.seed;
		}
	}

});
