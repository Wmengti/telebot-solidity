/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-05 14:13:29
 * @Description:
 */
const { verify } = require("../utils/verify");
const fs = require("fs");
const { ethers } = require("hardhat");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const developmentChains = ["hardhat", "localhost"];

  args = ["Contract Soul Bound Token", "CBT"];
  const contractNFT = await deploy("ContractNFT1155", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(contractNFT.address, args);
  }
};

module.exports.tags = ["ContractNFT", "all"];
