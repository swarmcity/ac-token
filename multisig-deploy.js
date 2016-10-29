var Web3 = require('web3');
var solc = require('solc');
var fs = require('fs');
var async = require('async');
var ethabi = require('ethereumjs-abi');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([{
	name: 'help',
	alias: 'h',
	type: Boolean
}, {
	name: 'config',
	alias: 'c',
	type: String
}, {
	name: 'send_immediately',
	type: Boolean,
	defaultValue: false
}, ]);
var cliOptions = cli.parse();

if (cliOptions.help) {
	console.log(cli.getUsage());
} else {

	if (!cliOptions.config) {
		console.log('need config file!');
		console.log(cli.getUsage());
	}

	var config = require('./' + cliOptions.config);

	console.log(config);

	var web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider(config.hostname));

	//Config
	var solidityFile = './contracts/Wallet.sol';
	var contractName = 'Wallet';
	var solcVersion = 'v0.4.3-nightly.2016.10.24+commit.84b43b91';

	//var multisig = config.multisig;

	// var constructTypes = [
	// 	["address", "address", "address", "address", "address"], "uint", "uint"
	// ];
	// var constructArguments = [
	// 	[
	// 		web3.toHex(config.owner1),
	// 		web3.toHex(config.owner2),
	// 		web3.toHex(config.owner3),
	// 		web3.toHex(config.owner4),
	// 		web3.toHex(config.owner5)
	// 	],
	// 	config.required, config.daily
	// ];

	solc.loadRemoteVersion(solcVersion, function(err, solcV) {
		if (err) {
			console.log('Error loading solc', solcV, err);
			process.exit();
		}
		console.log("Solc version:", solcV.version());

		//var abiEncoded = ethabi.rawEncode(constructTypes, constructArguments);
		//console.log('ABI encoded constructor arguments: ' + abiEncoded.toString('hex'));

		fs.readFile(solidityFile, function(err, result) {
			var source = result.toString();
			var output = solcV.compile(source, 1); // 1 activates the optimiser
			var abi = JSON.parse(output.contracts[contractName].interface);
			var bytecode = output.contracts[contractName].bytecode;



			var contract = web3.eth.contract(abi);

			if (cliOptions.send_immediately) {
				contract.new([
						web3.toHex(config.owner1),
						web3.toHex(config.owner2),
						web3.toHex(config.owner3),
						web3.toHex(config.owner4),
						web3.toHex(config.owner5),
						web3.toHex(config.owner6),
						web3.toHex(config.owner7)
					],
					config.required, config.daily, {
						from: config.from,
						gas: 3500000,
						data: bytecode
					},
					function(err, myContract) {
						if (!err) {
							if (myContract.address) {
								console.log('multisig address', myContract.address);
								var data = {
									bytecode: bytecode,
									abi: abi,
									address: myContract.address
								};

								var outputFileName = __dirname + '/' + contractName + ".json";
								console.log('saving to', outputFileName);
								fs.writeFile(outputFileName, JSON.stringify(data), 'utf8');

							}
						} else {
							console.log(err);
						}
					});
			} else {
				console.log('not deploying now, set --send_immediately to send transaction');
				// var data = contract.new.getData(multisig, config.start_block, config.end_block, {
				// 	data: bytecode
				// });
				// console.log(data);
			}
		});
	});
}