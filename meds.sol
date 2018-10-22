pragma solidity ^0.4.25;

contract BasicToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping (address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol
    ) public {
        totalSupply = initialSupply;  // Update total supply with the decimal amount
        balanceOf[msg.sender] = totalSupply;                // Give the creator all initial tokens
        name = tokenName;                                   // Set the name for display purposes
        symbol = tokenSymbol;                               // Set the symbol for display purposes
    }

    function _transfer(address _from, address _to, uint _value) internal {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0);
        // Check if the sender has enough
        require(balanceOf[_from] >= _value);
        // Check for overflows
        require(balanceOf[_to] + _value > balanceOf[_to]);
        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        // Subtract from the sender
        balanceOf[_from] -= _value;
        // Add the same to the recipient
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }
}

contract MedS is BasicToken{
    uint8 public decimals;

    mapping(address => uint8) public phrHashCount;
    mapping(address => mapping(uint256 => string)) public phrHashes;
    mapping(address => mapping(uint256 => string)) public phrSigns;

    constructor(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals
    ) BasicToken(initialSupply, tokenName, tokenSymbol) public {
        decimals = tokenDecimals;
    }

    function putPhrHash(string hashData) public {
        uint8 index = phrHashCount[msg.sender]; // next index = count
        phrHashes[msg.sender][index] = hashData;
        phrHashCount[msg.sender] = index+1;
    }

    function putSign(address patient, uint8 phrIndex, string signData) public {
        phrSigns[patient][phrIndex] = signData;
    }
}
