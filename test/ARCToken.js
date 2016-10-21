contract('ARCToken', function(accounts) {

  var arctokencontract;
  var founder_address = 0x629fc03b4e05c63a1b690ccade4fb707af659127;
  var developer_address = 0x7245d1a4be20e7689be0f4295332491119f59d3d;
  var rewards_address = 0xc2583e24adba72fa68643b97cdc40a723721558f;


  describe('Base contract state', function() {
    // before(function() {
    //   var arctokencontract = ARCToken.deployed();
    // });

    it("account 0 should have 0 ARC tokens", function(done) {
      // var arctokencontract = ARCToken.deployed();
      var arctokencontract = ARCToken.deployed();

      return arctokencontract.balanceOf.call(accounts[1]).then(function(balance) {
        assert.equal(balance.valueOf(), 0, "account not empty");
        done();
      });
    });

    /// founder / developer / reward 

    it("multisig address should be filled in", function(done) {
      var arctokencontract = ARCToken.deployed();
      arctokencontract.multisig().then(function(q) {
        assert.notEqual(q, 0x0, "multisig addres not filled in");
        assert.equal(q, 0xdfda9825c8fd4f5427efb9d523d796dfbcece346, "multisig addres not correct");
        done();
      });
    });

    it("founder address should be empty", function(done) {
      ARCToken.deployed().founder().then(function(q) {
        assert.equal(q, 0x0, "founder addres not empty");
        done();
      });
    });

    it("should fill in reward addresses", function() {
      return ARCToken.deployed().setRewardAddresses(founder_address, developer_address, rewards_address);
    });

    it("founder address should match", function(done) {
      ARCToken.deployed().founder().then(function(q) {
        assert.equal(q, founder_address, "founder addres does not match");
        done();
      });
    });
    it("developer address should match", function(done) {
      ARCToken.deployed().developer().then(function(q) {
        assert.equal(q, developer_address, "developer addres does not match");
        done();
      });
    });
    it("rewards address should be filled in", function(done) {
      ARCToken.deployed().rewards().then(function(q) {
        assert.equal(q, rewards_address, "rewards addres does not match");
        done();
      });
    });
    it("rewards address should be filled in", function(done) {
      ARCToken.deployed().rewards().then(function(q) {
        assert.equal(q, rewards_address, "rewards addres does not match");
        done();
      });
    });

  });

  var coinsale_start = 0;
  var coinsale_end = 168116;
  describe('Coinsale price tests', function() {
    it("start price should be 125", function() {
      ARCToken.deployed().testPrice(0).then(function(price) {
        assert.equal(price, 125, "start price incorrect");
      });
      ARCToken.deployed().testPrice(249).then(function(price) {
        assert.equal(price, 125, "start price incorrect");
      });
    });
    it("phase 1 price should be 100", function(done) {
      ARCToken.deployed().testPrice(250).then(function(price) {
        assert.equal(price, 100, "phase 1 price incorrect");
        done();
      });
    });
  });

  //   it("should buy tokens", function(done) {
  //     var arctokencontract = ARCToken.deployed();
  //     //console.log('ARC address', arctokencontract.address);
  //     arctokencontract.buy({
  //       from: accounts[5],
  //       to: arctokencontract.address,
  //       value: 1e18
  //     }).then(function() {
  //       arctokencontract.balanceOf.call(accounts[5]).then(function(outCoinBalance) {
  //         assert.equal(outCoinBalance.valueOf(), 125e18, "should have 125e18 tokens..");
  //         //console.log('new balance', outCoinBalance.toNumber());
  //         done();
  //       });
  //     })

  //   });
  //   it("should buy MORE tokens", function(done) {
  //     var arctokencontract = ARCToken.deployed();
  //     //console.log('ARC address', arctokencontract.address);
  //     arctokencontract.buy({
  //       from: accounts[5],
  //       to: arctokencontract.address,
  //       value: 1e18
  //     }).then(function() {
  //       // console.log('sent ETH');      
  //       arctokencontract.balanceOf.call(accounts[5]).then(function(outCoinBalance) {
  //         //console.log('new balance', outCoinBalance.toNumber());
  //         assert.equal(outCoinBalance.valueOf(), 250e18, "should have 250e18 tokens..");
  //         done();
  //       });
  //     })
  //   });

  //  it("check balance of founder account", function(done) {
  //     var arctokencontract = ARCToken.deployed();
  //   arctokencontract.balanceOf.call(0x0).then(function(outCoinBalance) {
  //         //console.log('new balance', outCoinBalance.toNumber());
  //         assert.equal(outCoinBalance.valueOf(), 0, "should have 0 tokens..");
  //         done();
  //       });
  // });


  //  it("should call allocateTokens", function(done) {
  //     var arctokencontract = ARCToken.deployed();
  //   arctokencontract.allocateTokens().then(function(outCoinBalance) {
  //         //console.log('new balance', outCoinBalance.toNumber());
  // //        assert.equal(outCoinBalance.valueOf(), 0, "should have 250e18 tokens..");
  //         done();
  //       });
  // });

  //  it("should find tokens on the founder account", function(done) {
  //    var arctokencontract = ARCToken.deployed();
  //    arctokencontract.balanceOf.call(0x0).then(function(outCoinBalance) {
  //         //console.log('new balance', outCoinBalance.toNumber());
  //         assert.equal(outCoinBalance.valueOf(), 0, "should have 0 tokens..");
  //         done();
  //       });
  // });



  // it("should send coin correctly", function() {
  //   var arctokencontract = arctokencontractCoin.deployed();

  //   // Get initial balances of first and second account.
  //   var account_one = accounts[0];
  //   var account_two = accounts[1];

  //   var account_one_starting_balance;
  //   var account_two_starting_balance;
  //   var account_one_ending_balance;
  //   var account_two_ending_balance;

  //   var amount = 10;

  //   return arctokencontract.getBalance.call(account_one).then(function(balance) {
  //     account_one_starting_balance = balance.toNumber();
  //     return arctokencontract.getBalance.call(account_two);
  //   }).then(function(balance) {
  //     account_two_starting_balance = balance.toNumber();
  //     return arctokencontract.sendCoin(account_two, amount, {from: account_one});
  //   }).then(function() {
  //     return arctokencontract.getBalance.call(account_one);
  //   }).then(function(balance) {
  //     account_one_ending_balance = balance.toNumber();
  //     return arctokencontract.getBalance.call(account_two);
  //   }).then(function(balance) {
  //     account_two_ending_balance = balance.toNumber();

  //     assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
  //     assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
  //   });
  // });
});