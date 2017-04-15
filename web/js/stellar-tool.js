StellarSdk.Network.usePublicNetwork();

var horizon = 'https://horizon.stellar.org';

function StellarTool(horizon) {
	this.server = new StellarSdk.Server(horizon);
}

StellarTool.prototype.random = function() {
	var keypair = StellarSdk.Keypair.random();
	var address = keypair.accountId();
	var seed = keypair.seed();
	
	return {
		address : address,
		seed : seed
	}
}

StellarTool.prototype.fromSeed = function(seed, callback) {
	try {
		var keypair = StellarSdk.Keypair.fromSeed(seed);
		var address = keypair.accountId();
		var seed = keypair.seed();
		
		return callback(null, {
			address : address,
			seed : seed
		});
	} catch(e) {
		console.error(e);
		callback(e);
	}
}

StellarTool.prototype.queryInfo = function(address, callback) {
	if (!StellarSdk.Keypair.isValidPublicKey(address)) {
		return callback(new Error('Invalid address!'));
	}
	
	this.server.accounts().accountId(address).call().then(function(data){
		console.log(address, data);
		callback(null, data);
	}).catch(function(err){
		if (err.name == 'NotFoundError') {
			console.error(err.name);
			callback(new Error(err.name));
		} else {
			console.error(err);
			callback(err, null);
		}
	});
}

StellarTool.prototype.sign = function(options) {
	var account = new StellarSdk.Account(options.address, options.seq);
	var opts = { fee: options.fee};
	var tx = new StellarSdk.TransactionBuilder(account, opts);
	var payment;
	if (options.optionType == 'payment') {
		payment = StellarSdk.Operation.payment({
			destination: options.to,
			asset: StellarSdk.Asset.native(),
			amount: options.xlm2send.toString()
	    });
	} else {
		payment = StellarSdk.Operation.createAccount({
			destination: options.to,
			startingBalance: options.xlm2send.toString()
        });
	}
	
	tx = tx.addOperation(payment).build();
	tx.sign(StellarSdk.Keypair.fromSeed(options.seed));
	return tx.toEnvelope().toXDR('base64');
}

StellarTool.prototype.submit = function(xdr, callback) {
	var tx ;
	try {
		tx = new StellarSdk.Transaction(xdr);
	} catch(e) {
		return callback(new Error('XDR is invalid !'));
	}
	
	this.server.submitTransaction(tx).then(function(txResult){
		console.log('Send done.', txResult.hash);
		console.log(txResult);
		callback(null, txResult.hash);
	}).catch(function(err){
		console.error('Send Fail !', err);
		if (err.extras && err.extras.result_codes && err.extras && err.extras.result_codes && err.extras.result_codes.transaction) {
			callback(new Error(err.extras.result_codes.transaction));
		} else {
			callback(err, null);
		}
	});
}

var stellar = new StellarTool(horizon);
