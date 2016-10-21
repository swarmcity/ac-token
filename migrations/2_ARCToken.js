module.exports = function(deployer) {

	var founder_address = 0x629fc03b4e05c63a1b690ccade4fb707af659127;
	var developer_address = 0x7245d1a4be20e7689be0f4295332491119f59d3d;
	var rewards_address = 0xc2583e24adba72fa68643b97cdc40a723721558f;
	var multisig_address = 0xdfda9825c8fd4f5427efb9d523d796dfbcece345;
	var start_block = 0;
	var end_block = 168116;

	deployer.deploy(ARCToken,
		multisig_address,
		start_block,
		end_block
	).then(function() {

		deployer.then(function() {
			// founder vesting contract
			// function TokenVesting(address _tokenRecepient, uint _freezePeriod, uint _initialAmount, uint _period,  uint _amount,address _tokenContract){
 			return TokenVesting.new(founder_address, 10, 10, 10, 10, ARCToken.address);
		}).then(function(founder_vesting) {
			deployer.then(function() {
				// developer vesting contract
				return TokenVesting.new(developer_address, 10, 10, 10, 10, ARCToken.address);
			}).then(function(developer_vesting) {
				deployer.then(function() {
					// rewards vesting contract
					return TokenVesting.new(rewards_address, 10, 10, 10, 10, ARCToken.address);
				}).then(function(rewards_vesting) {

					// console.log('set reward addresses. founder=',founder_vesting.address,'developer=',developer_vesting.address,'rewards=',rewards_vesting.address);

					// return ARCToken.deployed().setRewardAddresses(founder_vesting.address, developer_vesting.address, rewards_vesting.address).then(function() {
					// 	console.log('set reward addresses');
						

					// 	return ARCToken.deployed().founder().then(function(q) {
					// 		console.log('ARC founder reward address=', q);
					// 	});
					// 	ARCToken.deployed().developer().then(function(q) {
					// 		console.log('ARC developer reward address=', q);
					// 	});
					// 	ARCToken.deployed().rewards().then(function(q) {
					// 		console.log('ARC rewards reward address=', q);
					// 	});
					// });

				});

			});
		});

	});
};