contract('ARCToken', function(accounts) {

  var arctokencontract;
  var multisig_address = accounts[1];
  var founder_address = accounts[2];
  var developer_address = accounts[3];
  var rewards_address = accounts[4];

  var token_buyer = accounts[5];

  var self = this;

  var coinsale_start = self.web3.eth.blockNumber + 10;
  var coinsale_end = coinsale_start + 168116;

  describe('Deploy ARC token', function() {
    it("should deploy ARC contract", function(done) {
      ARCToken.new(multisig_address, coinsale_start, coinsale_end).then(function(instance) {
        arctokencontract = instance;
        assert.isNotNull(arctokencontract);
        done();
      });
    });

    it("multisig address should be filled in", function(done) {
      arctokencontract.multisig().then(function(q) {
        assert.notEqual(q, 0x0, "multisig addres not filled in");
        assert.equal(q, self.web3.toHex(multisig_address), "multisig addres not correct");
        done();
      });
    });

    it("should set reward addresses", function(done) {
      arctokencontract.setRewardAddresses(founder_address, developer_address, rewards_address).then(function() {
        done();
      });
    });

    it("founder address should match", function(done) {
      arctokencontract.founder().then(function(q) {
        assert.equal(q, self.web3.toHex(founder_address), "founder addres does not match");
        done();
      });
    });
    it("developer address should match", function(done) {
      arctokencontract.developer().then(function(q) {
        assert.equal(q, self.web3.toHex(developer_address), "developer addres does not match");
        done();
      });
    });
    it("rewards address should be filled in", function(done) {
      arctokencontract.rewards().then(function(q) {
        assert.equal(q, self.web3.toHex(rewards_address), "rewards addres does not match");
        done();
      });
    });
  });

  describe('Coinsale price tests', function() {
    it("start price should be 125", function() {
      arctokencontract.testPrice(coinsale_start).then(function(price) {
        assert.equal(price, 125, "start price incorrect");
      });
      arctokencontract.testPrice(coinsale_start + 249).then(function(price) {
        assert.equal(price, 125, "start price incorrect");
      });
    });
    it("phase 1 price should be 100", function(done) {
      arctokencontract.testPrice(coinsale_start + 250).then(function(price) {
        assert.equal(price, 100, "phase 1 price incorrect");
        done();
      });
    });
    it("phase 2 price should be 92", function(done) {
      arctokencontract.testPrice(coinsale_start + 250 + 1 * coinsale_end / 4).then(function(price) {
        assert.equal(price, 92, "phase 1 price incorrect");
        done();
      });
    });
    it("phase 3 price should be 83", function(done) {
      arctokencontract.testPrice(coinsale_start + 250 + 2 * coinsale_end / 4).then(function(price) {
        assert.equal(price, 83, "phase 1 price incorrect");
        done();
      });
    });
    it("phase 4 price should be 75", function(done) {
      arctokencontract.testPrice(coinsale_start + 250 + 3 * coinsale_end / 4).then(function(price) {
        assert.equal(price, 75, "phase 1 price incorrect");
        done();
      });
    });
  });

  describe('Coinsale details dump', function() {
    it("coinsale details", function(done) {
      console.log('address:', arctokencontract.address);
      arctokencontract.multisig().then(function(q) {
        console.log('multisig:', q);
      });
      arctokencontract.founder().then(function(q) {
        console.log('founder:', q);
      });
      arctokencontract.developer().then(function(q) {
        console.log('developer:', q);
      });
      arctokencontract.rewards().then(function(q) {
        console.log('rewards:', q);
      });

      arctokencontract.rewards().then(function(q) {
        console.log('rewards:', q);
      });

      arctokencontract.startBlock().then(function(start) {
        console.log('startBlock:', start.toNumber());
        arctokencontract.endBlock().then(function(end) {
          console.log('endBlock:', end.toNumber());

          console.log('duration in blocks :', end - start)
          var duration_seconds = (end - start) * 14.3;
          console.log('duration in seconds :', duration_seconds);
          console.log('duration in days :', duration_seconds / 60 / 60 / 24);

          done();


        });

      });


    });


  });

  describe('Coinsale test', function() {
    it("should skip to startBlock-2", function(done) {
      skipblocks(coinsale_start - self.web3.eth.blockNumber - 3, done);
    });

    it("token_buyer should have 0 ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(token_buyer).then(function(balance) {
        assert.equal(balance.valueOf(), 0, "account not empty");
        done();
      });
    });


    it("should reject ETH before startBlock", function(done) {
      self.web3.eth.sendTransaction({
        from: token_buyer,
        to: arctokencontract.address,
        value: 1e18,
      }, function(r, s) {
        try {
          assert.fail('this function should throw');
          done();
        } catch (e) {
          done();
        }
      });
    });

    it("token_buyer should have 0 ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(token_buyer).then(function(balance) {
        assert.equal(balance.valueOf(), 0, "account not empty");
        done();
      });
    });

    it("should skip to startBlock", function(done) {
      skipblocks(2, done);
    });

    it("should accept ETH and mint tokens", function(done) {
      self.web3.eth.sendTransaction({
        from: token_buyer,
        to: arctokencontract.address,
        value: 1e18,
      }, function(r, s) {
         try {
          done();
        } catch (e) {
          assert.fail('this function should not throw');
          done();
        }
      });
    });

    it("token_buyer should have 125 ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(token_buyer).then(function(balance) {
        assert.equal(balance.valueOf(), 125e18, "purchase did not work");
        done();
      });
    });



  });

  function skipblocks(count, cb) {
    //console.log('skipping',count,'blocks');
    //console.log(self.web3.eth);
    self.web3.eth.sendTransaction({
      from: accounts[2],
      to: accounts[3],
      value: 1,
    }, function() {
      if (count == 0) {
        console.log('we\'re now at block', self.web3.eth.blockNumber);
        cb();
      } else {
        skipblocks(count - 1, cb);
      }
    });
  }

});