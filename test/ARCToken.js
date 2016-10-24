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

    it("founder address/balance should match", function(done) {
      arctokencontract.founder().then(function(q) {
        assert.equal(q, self.web3.toHex(founder_address), "founder addres does not match");

        arctokencontract.balanceOf.call(founder_address).then(function(balance) {
          assert.equal(balance.valueOf(), 0);
          done();
        });

      });
    });
    it("developer address should match", function(done) {
      arctokencontract.developer().then(function(q) {
        assert.equal(q, self.web3.toHex(developer_address), "developer addres does not match");
        arctokencontract.balanceOf.call(developer_address).then(function(balance) {
          assert.equal(balance.valueOf(), 0);
          done();
        });

      });
    });
    it("rewards address/balance should match", function(done) {
      arctokencontract.rewards().then(function(q) {
        assert.equal(q, self.web3.toHex(rewards_address), "rewards addres does not match");
        arctokencontract.balanceOf.call(rewards_address).then(function(balance) {
          assert.equal(balance.valueOf(), 0);
          done();
        });
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

      console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());

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
      console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());
      return arctokencontract.balanceOf.call(token_buyer).then(function(balance) {
        assert.equal(balance.valueOf(), 125e18, "purchase did not work");
        done();
      });
    });



    it("token owner should not be able to call allocateTokens yet", function(done) {
      arctokencontract.allocateTokens({
          from: accounts[0]
        })
        .then(function() {
          assert.fail('this function should throw');
          done();
        })
        .catch(function(e) {

          done();
        });
    });

    it("buying more tokens than ethercap should not be possible", function(done) {

      console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());

      self.web3.eth.sendTransaction({
        from: token_buyer,
        to: arctokencontract.address,
        value: 60e18,
      }, function(r, s) {
        try {
          assert.fail('this function should throw');
          done();
        } catch (e) {
          done();
        }
      });
    });

    it("token_buyer should still have 125 ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(token_buyer).then(function(balance) {
        assert.equal(balance.valueOf(), 125e18);
        done();
      });
    });

    it("buying exactly the tokens up to the ethercap should be possible", function(done) {

      console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());


      arctokencontract.etherCap().then(function(etherCap) {
        arctokencontract.presaleEtherRaised().then(function(presaleEtherRaised) {
          var remaining = etherCap - presaleEtherRaised;
          console.log('Buying in for', remaining);

          assert(self.web3.eth.getBalance(token_buyer) > remaining,'Balance of buyer too low to buy all tokens. (restart testRPC?)');

          self.web3.eth.sendTransaction({
            from: token_buyer,
            to: arctokencontract.address,
            value: remaining,
          }, function(r, s) {
            try {
              done();
            } catch (e) {
              assert.fail('this function should not throw');
              done();
            }
          });
        });

      });
    });


    it("buying more tokens should not be possible", function(done) {
      console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());
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
  });


  describe('Post-coinsale test', function() {

    it("founder_address should have 0 ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(founder_address).then(function(balance) {
        assert.equal(balance.valueOf(), 0, "account not empty: " + self.web3.fromWei(balance.valueOf(), 'ether'));
        done();
      });
    });


    it("Check presaleEtherRaised == etherCap", function(done) {
      arctokencontract.etherCap().then(function(etherCap) {
        arctokencontract.presaleEtherRaised().then(function(presaleEtherRaised) {
          console.log('Ether raised so far:', self.web3.fromWei(presaleEtherRaised, 'ether').toNumber())
          console.log('Ether cap :', self.web3.fromWei(etherCap, 'ether').toNumber())
          assert.equal(presaleEtherRaised.toNumber(),etherCap.toNumber());
          done();
        });
      });
    });


    it("calling allocateTokens should not be possible by random account", function(done) {
      arctokencontract.allocateTokens({
          from: accounts[6]
        })
        .then(function() {
          assert.fail('this function should throw');
          done();
        })
        .catch(function(e) {
          done();
        });
    });

    it("founder_address should have 0 ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(founder_address).then(function(balance) {
        assert.equal(balance.valueOf(), 0, "account not empty");
        done();
      });
    });

    it("calling allocateTokens should be possible by creator", function(done) {
      arctokencontract.allocateTokens({
          from: accounts[0]
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          assert.fail('this function should not throw');
          done();
        });
    });

    it("founder_address should now ARC tokens", function(done) {
      return arctokencontract.balanceOf.call(founder_address).then(function(balance) {
        assert.notEqual(balance.valueOf(), 0, "account not empty");
        console.log('founder address has', self.web3.fromWei(balance.valueOf(),'ether'), 'ARC');
        done();
      });
    });


  });

  function skipblocks(count, cb) {
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