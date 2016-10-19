/**
 * ERC 20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 */
contract Token {

    /// @return total amount of tokens
    function totalSupply() constant returns (uint256 supply) {}

    /// @param _owner The address from which the balance will be retrieved
    /// @return The balance
    function balanceOf(address _owner) constant returns (uint256 balance) {}

    /// @notice send `_value` token to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) returns (bool success) {}

    /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
    /// @param _from The address of the sender
    /// @param _to The address of the recipient
    /// @param _value The amount of token to be transferred
    /// @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {}

    /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _value The amount of wei to be approved for transfer
    /// @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) returns (bool success) {}

    /// @param _owner The address of the account owning tokens
    /// @param _spender The address of the account able to transfer the tokens
    /// @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {}

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

}

/**
 * ERC 20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 */
contract StandardToken is Token {

    /**
     * Reviewed:
     * - Interger overflow = OK, checked
     */
    function transfer(address _to, uint256 _value) returns (bool success) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        //if (balances[msg.sender] >= _value && _value > 0) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }

    mapping(address => uint256) balances;

    mapping (address => mapping (address => uint256)) allowed;

    uint256 public totalSupply;

}



contract TokenVesting {
	address public tokenRecepient;		// recepient of the tokens
	uint public freezePeriod;					// # blocks to wait before enable initial vesting
	uint256 public initialAmount;			// tokens released at initial vesting
	uint256 public amount;						// tokens that can be vested in each period
  uint public period;								// length of period ( in blocks ) 
    
	uint public vestingStartBlock;		// blocknumber where recepient activated the contract
	uint public initialVestingBlock;	// blocknumner where initial vestig occured
	uint public nextVestingBlock;			// blocknumber where next vesting can occur

	StandardToken token;

	event Vested(uint256 amount);

	function TokenVesting(address _tokenRecepient, uint _freezePeriod, uint256 _initialAmount, uint256 _amount, uint _period, address _tokenContract){
		tokenRecepient = _tokenRecepient;
		initialAmount = _initialAmount;
		freezePeriod = _freezePeriod;
		amount = _amount;
		period = _period;
		token = StandardToken(_tokenContract);
	}

	// Activate the vesting - aka start the frozenblocks countdown
	function activate(){
		// you can only activate the vesting contract ( aka start the freeze period )
		// when there is a token balance on this contract
		if (token.balanceOf(this) <= 0) throw;
		if (msg.sender != tokenRecepient) throw;
		if (nextVestingBlock != 0x0) throw;
		nextVestingBlock = block.number + freezePeriod;
	}

	// request initial vesting
	function initial(){
		// only recepient can request 
		if (msg.sender != tokenRecepient) throw;
		// did you already call the initial vesting function ?
		if (initialVestingBlock != 0x0) throw;
		// check if it's not too early for the initial vesting to occur ?
		if (nextVestingBlock < block.number) throw;
		sendTokens(initialAmount);
		initialVestingBlock = block.number;
		nextVestingBlock = block.number + period;		
	}

	function vest(){
		if (msg.sender != tokenRecepient) throw;
		if (initialVestingBlock == 0x0) throw;
		if (nextVestingBlock < block.number) throw;
		sendTokens(amount);
		nextVestingBlock = block.number + period;
	}


	function sendTokens(uint256 amount) private {
	    uint256 vestAmount = amount;
		if (token.balanceOf(this) < amount )
		{
		    // only send remaining tokens
		    vestAmount = token.balanceOf(this);
		}
		// send 'amount' tokens
		token.transfer(tokenRecepient,vestAmount);
		Vested(vestAmount);
	}
}