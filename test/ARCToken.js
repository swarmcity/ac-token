/*
  This large tokensale test runs a simulation of the token contract
  
  - deploys the contract
  - sets it's parameters ( multisig for sending Ether to , founder_address, developer_address, rewards_address )
  - performs price tests on different blocks ( power hour , and the 4 succeding price ranges )
  - tests that you cannot buy tokens before the startBlock
  - tests that you can buy tokens during the tokensale period
  - tests if the amount of minted tokens corresponds with the price at that block
  - tests that allocateTokens cannot be called accidently during the coinsale
  - tests that token transfers are rejected during the coinsale

  - tests that if etherCap is reached - the market is activated automatically
  - tests that when etherCap is reached - more buy-ins are rejected

  - tests token transfers after token sale


*/

contract('ARCToken', function(accounts) {

  var arctokencontract;
  var multisig_address = accounts[1];
  var founder_address = accounts[2];
  var developer_address = accounts[3];
  var rewards_address = accounts[4];

  var token_buyer = accounts[5];

  var self = this;

  var duration = 168116; //coinsale duration in blocks

  var coinsale_start = self.web3.eth.blockNumber + 10;
  var coinsale_end = coinsale_start + duration;

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
      var testblock = coinsale_start;
      arctokencontract.testPrice(testblock).then(function(price) {
        assert.equal(price.toNumber(), 125, "start price incorrect at block " + testblock);
      });
      var testblock = coinsale_start + 249;
      arctokencontract.testPrice(testblock).then(function(price) {
        assert.equal(price.toNumber(), 125, "start price incorrect at block " + testblock);
      });
    });
    it("phase 1 price should be 100", function(done) {
      var testblock = coinsale_start + 250;
      arctokencontract.testPrice(testblock).then(function(price) {
        assert.equal(price.toNumber(), 100, "phase 1 price incorrect at block " + testblock);
        done();
      });
    });
    it("phase 2 price should be 92", function(done) {
      var testblock = Math.floor(coinsale_start + 250 + 1 * (coinsale_end - coinsale_start) / 4);
      arctokencontract.testPrice(testblock).then(function(price) {
        assert.equal(price.toNumber(), 92, "phase 2 price incorrect at block " + testblock);
        done();
      });
    });
    it("phase 3 price should be 83", function(done) {
      var testblock = Math.floor(coinsale_start + 250 + 2 * (coinsale_end - coinsale_start) / 4);
      arctokencontract.testPrice(testblock).then(function(price) {
        assert.equal(price.toNumber(), 83, "phase 3 price incorrect at block " + testblock);
        done();
      });
    });
    it("phase 4 price should be 75", function(done) {
      var testblock = Math.floor(coinsale_start + 250 + 3 * (coinsale_end - coinsale_start) / 4);
      arctokencontract.testPrice(testblock).then(function(price) {
        assert.equal(price.toNumber(), 75, "phase 4 price incorrect at block " + testblock);
        done();
      });
    });
  });

  describe('Coinsale details', function() {
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
        value: 1,
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
        assert.equal(balance.valueOf(), 125, "purchase did not work");
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

    it("transferring tokens should be impossible now (block > endBlock and not sold out yet)", function(done) {

      // now the account that has bought tokens - becomes the sender
      var token_sender = token_buyer;

      // recepient is just a random account
      var token_recepient = accounts[7];

      arctokencontract.transfer(token_recepient, 1, {
          from: token_sender
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

      arctokencontract.etherCap().then(function(etherCap) {
        arctokencontract.balanceOf.call(token_buyer).then(function(ARCbalance) {

          console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());
          console.log('tokenbuyer ARC balance=', ARCbalance.toNumber());

          self.web3.eth.sendTransaction({
            from: token_buyer,
            to: arctokencontract.address,
            value: etherCap + 1,
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
    });

    // it("token_buyer should still have 125 ARC tokens", function(done) {
    //   return arctokencontract.balanceOf.call(token_buyer).then(function(balance) {
    //     assert.equal(balance.valueOf(), 125);
    //     done();
    //   });
    // });
  });

  /* When the token sale sells out - the last buyRecepient() call 
  should activate the market and transfers should become possible
  and new buy-ins should be impossible
  */
  describe('Automatic market activation ', function() {


    it("market should be inactive ( because not sold out yet )", function(done) {
      arctokencontract.marketactive().then(function(marketactive) {
        assert.equal(marketactive, false, "marketactive should be false");
        done();
      });
    });

    it("buying exactly the tokens up to the ethercap should be possible", function(done) {

      console.log('tokenbuyer ETH balance=', self.web3.fromWei(self.web3.eth.getBalance(token_buyer), 'ether').toNumber());

      arctokencontract.etherCap().then(function(etherCap) {
        arctokencontract.presaleEtherRaised().then(function(presaleEtherRaised) {
          var remaining = etherCap - presaleEtherRaised;
          console.log('Buying in for', remaining);

          assert(self.web3.eth.getBalance(token_buyer) > remaining, 'Balance of buyer too low to buy all tokens. (restart testRPC?)');

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

    it("market should be activated ( because ethercap reached )", function(done) {
      arctokencontract.marketactive().then(function(marketactive) {
        assert.equal(marketactive, true, "marketactive should be true");
        done();
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



  describe('Post-coinsale transfers', function() {

    // now the account that has bought tokens - becomes the sender
    var token_sender = token_buyer;

    // recepient is just a random account
    var token_recepient = accounts[7];

    var sender_token_balance = 0;

    it("should get balance of token sender", function(done) {
      arctokencontract.balanceOf.call(token_sender).then(function(balance) {
        sender_token_balance = balance.valueOf();
        console.log('token_sender has ', sender_token_balance, 'ARC');
        assert.notEqual(balance.valueOf(), 0, 'token_sender should have some ARC to transfer');
        done();
      });
    });

    it("token recepient should have 0 ARC", function(done) {
      arctokencontract.balanceOf.call(token_recepient).then(function(balance) {
        console.log('token_recepient has ', balance.valueOf(), 'ARC');
        assert.equal(balance.valueOf(), 0, "token_recepient ARC balance not empty: " + balance.valueOf());
        done();
      });
    });

    it("transferring tokens should be possible (block > endBlock)", function(done) {
      arctokencontract.transfer(token_recepient, 1, {
          from: token_sender
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          assert.fail('this function should not throw');
          done();
        });
    });

    it("token recepient should have ARC", function(done) {
      arctokencontract.balanceOf.call(token_recepient).then(function(balance) {
        console.log('token_recepient has ', balance.valueOf(), 'ARC');
        assert.equal(balance.valueOf(), 1, "token_recepient ARC balance not empty: " + balance.valueOf());
        done();
      });
    });

    it("token sender should have less ARC", function(done) {
      arctokencontract.balanceOf.call(token_sender).then(function(balance) {
        console.log('token_sender has ', balance.valueOf(), 'ARC');
        assert.equal(balance.valueOf(), sender_token_balance - 1, "token_sender ARC balance after sale is wrong: " + balance.valueOf());
        done();
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
          assert.equal(presaleEtherRaised.toNumber(), etherCap.toNumber());
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
        console.log('founder address has', self.web3.fromWei(balance.valueOf(), 'ether'), 'ARC');
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