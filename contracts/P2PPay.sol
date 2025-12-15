// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title P2PPay
 * @dev Simple pull-payment P2P contract: payers credit payees, payees withdraw.
 * Includes a lightweight ReentrancyGuard implementation to avoid external imports.
 */
contract P2PPay {
    mapping(address => uint256) private balances;

    event PaymentRegistered(address indexed payer, address indexed payee, uint256 amount, bytes32 ref);
    event Withdrawn(address indexed payee, uint256 amount);

    // Minimal ReentrancyGuard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    /// @notice Payer credits `payee` with `msg.value` and optional reference
    function payTo(address payee, bytes32 ref) external payable {
        require(payee != address(0), "invalid payee");
        require(msg.value > 0, "no value");
        balances[payee] += msg.value;
        emit PaymentRegistered(msg.sender, payee, msg.value, ref);
    }

    /// @notice Payee withdraws their accumulated balance
    function withdraw() external nonReentrant {
        uint256 amt = balances[msg.sender];
        require(amt > 0, "no funds");
        balances[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amt}("");
        require(ok, "transfer failed");
        emit Withdrawn(msg.sender, amt);
    }

    function balanceOf(address who) external view returns (uint256) {
        return balances[who];
    }
}
