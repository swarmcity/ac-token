# ARC token

This repo contains the Token contract for the ARC token, including the coinsale

## Prerequisites

You will need the truffle framework to run the tests

```
npm install -g truffle
```

```
npm install -g ethereumjs-testrpc
```

## Testing

First start the testRPC suite in another terminal


```
testrpc
```

Running the unit tests will check the workings of the ARCToken.sol contract and the TokenVesting.sol contract.

```
truffle test
```

To run tests individually - run

```
truffle test ./test/TokenVesting.js
truffle test ./test/ARCToken.js
truffle test ./test/ARCToken_sellout_in_time.js
```

# Contracts

## ARCToken.sol

The main ERC20-compatible coin contract that handles both the transfer of coins - as well as the token sale.

## TokenVesting.sol

This contract is a generic ERC20 vesting contract that vestst ERC20 tokens in time - by looking at the blocks.

Please refer to the contract source code for more documentation 
And to the tests for more information on how to use it.


