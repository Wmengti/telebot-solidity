/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-10-14 14:42:13
 * @Description:
 */
const { verify } = require("../utils/verify");
const fs = require("fs");
const { ethers } = require("hardhat");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const developmentChains = ["hardhat", "localhost"];

  args = [];
  const contract = await deploy("MEME", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  //   await verify(contract.address, args);
  // }
};

module.exports.tags = ["MEME", "all"];
//0xa092AFa7F7F0D2cB6DD946Bc8C82F716dD901554 mumbai
//0x8161A4a3B0CFFD2A26f5Bf33063C631D6EFbf94A goerli
//0x6aE9426a6356b383E32a1604C575A24cAd432826 neo
