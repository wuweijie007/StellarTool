var app = angular.module('myApp', []);

app.controller('MyController', function($scope, $http) {
	$scope.account = {
		address : '',
		seed : '',
		balances : {},
		seq : null,
		to : '',
		fee : 120,
		xlm2send : 0,
		optionType : 'payment',
		xdr : '',
		clean : function() {
			this.balances = {};
			this.seq = null;
			this.seq_next = null;
		}
	};
	
	$scope.working = false;
	$scope.errMsg = '';
	$scope.message = '';
	
	$scope.update = function(key, value) {
		var phase = $scope.$root.$$phase;
		if (phase == '$apply' || phase == '$digest') {
			$scope[key] = value;
		} else {
			$scope.$apply(function() {
				$scope[key] = value;
			});
		}
	}
	$scope.updateAccount = function(key, value) {
		var phase = $scope.$root.$$phase;
		if (phase == '$apply' || phase == '$digest') {
			$scope.account[key] = value;
		} else {
			$scope.$apply(function() {
				$scope.account[key] = value;
			});
		}
	}
	
	$scope.setSecret = function() {
		$scope.update('errMsg', '');
		stellar.fromSeed($scope.account.seed, function(err, account){
			if (err) {
				$scope.update('errMsg', err.message);
			} else {
				$scope.account.address = account.address;
			}
		});
	}
	
	$scope.sign = function() {
		$scope.update('errMsg', '');
		try {
			var xdr = stellar.sign($scope.account);
			$scope.updateAccount('xdr', xdr);
		} catch(e) {
			console.error(e);
			$scope.update('errMsg', e.message);
		}
	}
	
	$scope.submit = function() {
		$scope.update('working', true);
		$scope.update('errMsg', '');
		$scope.update('message', '');
		stellar.submit($scope.account.xdr, function(err, hash){
			$scope.update('working', false);
			if (err) {
				$scope.update('errMsg', err.message);
			} else {
				$scope.update('message', hash);
			}
		});
	}
});
