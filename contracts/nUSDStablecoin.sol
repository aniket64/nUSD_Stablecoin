// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract nUSDStablecoin {
    string public name = "nUSD Stablecoin";
    string public symbol = "nUSD";
    uint8 public decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    AggregatorV3Interface private priceFeed; // Chainlink ETH price feed

    event Deposit(address indexed from, uint256 ethAmount, uint256 nusdAmount);
    event Redeem(address indexed from, uint256 nusdAmount, uint256 ethAmount);

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function deposit() external payable {
        require(msg.value > 0, "ETH amount must be greater than 0");

        uint256 ethAmount = msg.value;
        uint256 nusdAmount = ethAmount / 2; // Conversion rate: 1 ETH = 2 nUSD

        balanceOf[msg.sender] += nusdAmount;
        totalSupply += nusdAmount;

        emit Deposit(msg.sender, ethAmount, nusdAmount);
    }

    function redeem(uint256 nusdAmount) external {
        require(nusdAmount > 0, "nUSD amount must be greater than 0");
        require(
            balanceOf[msg.sender] >= nusdAmount,
            "Insufficient nUSD balance"
        );

        uint256 ethAmount = nusdAmount * 2; // Conversion rate: 2 nUSD = 1 ETH

        balanceOf[msg.sender] -= nusdAmount;
        totalSupply -= nusdAmount;

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit Redeem(msg.sender, nusdAmount, ethAmount);
    }

    function getETHPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }
}
