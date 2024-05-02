// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

contract UserTradingStrategy {
  // 结构体用于存储交易策略
  struct Strategy {
    uint8 upPercentage; // 上涨百分比
    uint8 sellPercentage; // 卖出百分比
  }

  // 动态数组用于存储用户的交易策略
  mapping(address => Strategy[]) private userStrategies;

  // 添加交易策略
  function addStrategy(uint8[] memory upPercentages, uint8[] memory sellPercentages) external {
    require(upPercentages.length == sellPercentages.length, "string not match");

    for (uint256 i = 0; i < upPercentages.length; i++) {
      Strategy memory newStrategy = Strategy(upPercentages[i], sellPercentages[i]);
      userStrategies[msg.sender].push(newStrategy);
    }
  }

  // 获取用户的交易策略
  function getStrategies() external view returns (Strategy[] memory) {
    return userStrategies[msg.sender];
  }

  // 执行单个策略并删除
  function executeAndDeleteStrategy(uint256 index) external {
    require(index < userStrategies[msg.sender].length, "index out quote");

    // 执行策略的逻辑代码...

    // 删除已执行的策略
    _removeStrategy(msg.sender, index);
  }

  // 删除整个交易策略
  function deleteAllStrategies() external {
    delete userStrategies[msg.sender];
  }

  // 内部函数：删除单个策略
  function _removeStrategy(address user, uint256 index) internal {
    if (index >= userStrategies[user].length) return;

    // 将最后一个策略移到要删除的位置上，并缩小数组长度
    userStrategies[user][index] = userStrategies[user][userStrategies[user].length - 1];
    userStrategies[user].pop();
  }
}
