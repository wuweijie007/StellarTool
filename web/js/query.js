var app = angular.module('myApp', []);

app.controller('MyController', function($scope, $http) {
	$scope.account = {
		address : '',
		seed : '',
		balances : {},
		seq : null,
		clean : function() {
			this.balances = {};
			this.seq = null;
		}
	};
	
	$scope.working = false;
	$scope.errMsg = '';
	
	$scope.objKeyLength = function(obj) {
		return Object.keys(obj).length;
	}
	$scope.cssCurrency = function(curr) {
		if (curr == 'XLM') return 'native';
		return fiat.indexOf(curr) > -1 ? 'fiat' : 'nonefiat';
	}
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
	
	$scope.queryInfo = function() {
		$scope.account.clean();
		$scope.update('errMsg', '');
		$scope.update('working', true);
		stellar.queryInfo($scope.account.address, function(err, data){
			$scope.update('working', false);
			if (err) {
				$scope.update('errMsg', err.message);
			} else {
				var balances = {};
				data.balances.forEach(function(line){
					var currency = line.asset_type == "native" ? 'XLM' : line.asset_code;
					var issuer    = line.asset_type == "native" ? '' : line.asset_issuer;
					var value    = line.balance;
					var key = currency == 'XLM' ? 'XLM' : currency + ':' + issuer;
					balances[key] = {currency : currency, issuer : issuer, value : value};
				});
				$scope.updateAccount('balances', balances);
				
				//var seq = parseFloat(data.sequence);
				$scope.updateAccount('seq', data.sequence);
			}
		});
	}

});

var fiat = [ 'USD', 'EUR', 'JPY', 'CNY', 'INR', 'RUB', 'GBP', 'CAD', 'BRL',
     		'CHF', 'DKK', 'SEK', 'CZK', 'PLN', 'AUD', 'MXN', 'KRW', 'TWD', 'HKD',
     		'KES', 'AMD', 'RUR', 'RON', 'NZD', 'TRY' ];