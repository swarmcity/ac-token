contract('TokenVesting', function(accounts) {


  // where the tokens should be vested to
  var destination_address = accounts[1];
  var tokeninstance;
  var vestinginstance;

  var self = this;


  function skipblocks(count, cb) {
    //console.log('skipping',count,'blocks');
    tokeninstance.noop({
      from: accounts[2]
    }).then(function() {
      if (count == 0) {
        console.log('at block', self.web3.eth.blockNumber);
        cb();
      } else {
        skipblocks(count - 1, cb);
      }
    });
  }

  describe('Deploy TestToken + TokenVesting', function() {
    before(function(done) {
      // create an ERC20 compatible token contract
      TokenVestingTestToken.new().then(function(instance) {
        tokeninstance = instance;
        // create vesting contract
        // after 10 block -> release 20pct of the tokens
        // then after each period of 5 blocks -> release 40pct of the tokens
        TokenVesting.new(destination_address, 10, 20, 5, 40, tokeninstance.address).then(function(instance) {
          vestinginstance = instance;
          done();
        });
      });
    });

    it("destination address should have 0 ARC tokens", function(done) {
      tokeninstance.balanceOf.call(destination_address).then(function(balance) {
        assert.equal(balance.valueOf(), 0);
        done();
      });
    });
  });
  describe('TestToken initial state tests', function() {

    it("calling initial() should throw Error", function(done) {
      vestinginstance.initial()
        .then(function() {
          assert.fail('this function shoudl throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });

    it("calling vest() should throw Error", function(done) {
      vestinginstance.vest()
        .then(function() {
          assert.fail('this function should throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });

    it("calling activate() should throw Error", function(done) {
      // the activation should not be possible if there are no tokens on the contract.
      vestinginstance.activate()
        .then(function() {
          assert.fail('this function should throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });


    it("vesting contract should receive 1000 ARC tokens", function(done) {
      tokeninstance.mintToken(vestinginstance.address, 1000e18).then(function() {
        tokeninstance.balanceOf.call(vestinginstance.address).then(function(balance) {
          assert.equal(balance.valueOf(), 1000e18);
          done();
        });
      });
    });

  });

  describe('Activating vesting contract', function() {


    it("calling activate() from another account than the recepient should throw Error", function(done) {
      vestinginstance.activate({
          from: accounts[0]
        })
        .then(function() {
          assert.fail('this function should throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });



    it("calling activate() from the recepient address should work", function(done) {
      // the activation should not be possible if there are no tokens on the contract.
      vestinginstance.activate({
          from: accounts[1]
        })
        .then(function() {
          console.log('vesting activated at block', self.web3.eth.blockNumber);
          vestinginstance.nextVestingBlock().then(function(d) {
            console.log('next vesting block', d.toNumber());
            done();
          });
        })
        .catch(function(e) {
          assert.fail('this function should not throw an error');
          done();
        })
    });


    it("calling activate() 2nd time should throw Error", function(done) {
      vestinginstance.activate({
          from: accounts[1]
        })
        .then(function() {
          assert.fail('this function should throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });

    it('wait 5 blocks', function(done) {
      skipblocks(5, done);
    });

    it("calling initial() in the freeze period should throw Error", function(done) {
      vestinginstance.initial()
        .then(function() {
          assert.fail('this function should throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });

    it('wait 5 more blocks', function(done) {
      skipblocks(5, done);
    });

    it("calling initial() after freeze period should do initial vesting", function(done) {

      console.log('now at block', self.web3.eth.blockNumber);
      vestinginstance.initial({
          from: accounts[1]
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          assert.fail('this should not throw');
          done();
        })
    });

    it("destination address should have 20% of balance", function(done) {
      tokeninstance.balanceOf.call(destination_address).then(function(balance) {
        assert.equal(balance.valueOf(), 1000e18 * 0.2);
        vestinginstance.nextVestingBlock().then(function(d) {
          console.log('next vesting block', d.toNumber());
          done();
        });
      });
    });

    it("calling vest() before the next period should throw Error", function(done) {
      vestinginstance.vest()
        .then(function() {
          assert.fail('this function should throw an error');
        })
        .catch(function(e) {
          assert.isNotNull(e);
          done();
        })
    });

    it('wait 5 blocks', function(done) {
      skipblocks(5, done);
    });


    it("calling vest() in the next period should work", function(done) {
      vestinginstance.vest({
          from: accounts[1]
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          assert.fail('this function should not throw an error');
          done();
        })
    });

    it("destination address should have 60% of balance", function(done) {
      tokeninstance.balanceOf.call(destination_address).then(function(balance) {
        assert.equal(balance.valueOf(), 1000e18 * 0.6);
        vestinginstance.nextVestingBlock().then(function(d) {
          console.log('next vesting block', d.toNumber());
          done();
        });
      });
    });

    it('wait 5 blocks', function(done) {
      skipblocks(5, done);
    });


    it("calling vest() in the next period should work", function(done) {
      vestinginstance.vest({
          from: accounts[1]
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          assert.fail('this function should not throw an error');
          done();
        })
    });

    it("destination address should have 100% of balance", function(done) {
      tokeninstance.balanceOf.call(destination_address).then(function(balance) {
        assert.equal(balance.valueOf(), 1000e18);
        vestinginstance.nextVestingBlock().then(function(d) {
          console.log('next vesting block', d.toNumber());
          done();
        });
      });
    });



  });


});