contract('ARCToken', function(accounts) {

  it("account 0 should have ARC tokens", function(done) {
    var meta = ARCToken.deployed();
    meta.founder().then(function(q){
      console.log('founder address=',q);  
    });
    return meta.balanceOf.call(accounts[5]).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "account not empty");
      done();
    });
  });

  it("account 0 should have ARC tokens", function(done) {
    var meta = ARCToken.deployed();
    return meta.balanceOf.call(accounts[5]).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "account not empty");
      done();
    });
  });

  it("should buy tokens", function(done) {
    var meta = ARCToken.deployed();
    //console.log('ARC address', meta.address);
    meta.buy({
      from: accounts[5],
      to: meta.address,
      value: 1e18
    }).then(function() {
      meta.balanceOf.call(accounts[5]).then(function(outCoinBalance) {
        assert.equal(outCoinBalance.valueOf(), 125e18, "should have 125e18 tokens..");
        //console.log('new balance', outCoinBalance.toNumber());
        done();
      });
    })

  });
  it("should buy MORE tokens", function(done) {
    var meta = ARCToken.deployed();
    //console.log('ARC address', meta.address);
    meta.buy({
      from: accounts[5],
      to: meta.address,
      value: 1e18
    }).then(function() {
      // console.log('sent ETH');      
      meta.balanceOf.call(accounts[5]).then(function(outCoinBalance) {
        //console.log('new balance', outCoinBalance.toNumber());
        assert.equal(outCoinBalance.valueOf(), 250e18, "should have 250e18 tokens..");
        done();
      });
    })
  });

 it("check balance of founder account", function(done) {
    var meta = ARCToken.deployed();
  meta.balanceOf.call(0x0).then(function(outCoinBalance) {
        //console.log('new balance', outCoinBalance.toNumber());
        assert.equal(outCoinBalance.valueOf(), 0, "should have 0 tokens..");
        done();
      });
});


 it("should call allocateTokens", function(done) {
    var meta = ARCToken.deployed();
  meta.allocateTokens().then(function(outCoinBalance) {
        //console.log('new balance', outCoinBalance.toNumber());
//        assert.equal(outCoinBalance.valueOf(), 0, "should have 250e18 tokens..");
        done();
      });
});

 it("should find tokens on the founder account", function(done) {
   var meta = ARCToken.deployed();
   meta.balanceOf.call(0x0).then(function(outCoinBalance) {
        //console.log('new balance', outCoinBalance.toNumber());
        assert.equal(outCoinBalance.valueOf(), 0, "should have 0 tokens..");
        done();
      });
});



  // it("should send coin correctly", function() {
  //   var meta = MetaCoin.deployed();

  //   // Get initial balances of first and second account.
  //   var account_one = accounts[0];
  //   var account_two = accounts[1];

  //   var account_one_starting_balance;
  //   var account_two_starting_balance;
  //   var account_one_ending_balance;
  //   var account_two_ending_balance;

  //   var amount = 10;

  //   return meta.getBalance.call(account_one).then(function(balance) {
  //     account_one_starting_balance = balance.toNumber();
  //     return meta.getBalance.call(account_two);
  //   }).then(function(balance) {
  //     account_two_starting_balance = balance.toNumber();
  //     return meta.sendCoin(account_two, amount, {from: account_one});
  //   }).then(function() {
  //     return meta.getBalance.call(account_one);
  //   }).then(function(balance) {
  //     account_one_ending_balance = balance.toNumber();
  //     return meta.getBalance.call(account_two);
  //   }).then(function(balance) {
  //     account_two_ending_balance = balance.toNumber();

  //     assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
  //     assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
  //   });
  // });
});