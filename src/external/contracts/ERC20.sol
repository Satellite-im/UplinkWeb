// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Starlight {
    string public name = "Starlight";
    string public symbol = "STL";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Mapping from account addresses to current balance.
    mapping(address => uint256) public balanceOf;
    // Mapping from account addresses to a mapping of spender addresses to an allowance amount.
    mapping(address => mapping(address => uint256)) public allowance;

    // Event triggered when tokens are transferred.
    event Transfer(address indexed from, address indexed to, uint256 value);
    // Event triggered whenever approve(address _spender, uint256 _value) is called.
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * (10 ** uint256(decimals));
        // Initially assign all tokens to the contract's creator.
        balanceOf[msg.sender] = totalSupply;
    }

    // Transfer tokens from the caller's account to another account.
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance.");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Approve a spender to spend up to _value tokens on your behalf.
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Transfer tokens from one account to another, on behalf of the owner.
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance.");
        require(_value <= allowance[_from][msg.sender], "Allowance exceeded.");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
