/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-10-14 18:23:01
 * @Description:
 */
const { verify } = require("../utils/verify");
const fs = require("fs");
const { ethers } = require("hardhat");
require("dotenv").config();

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const developmentChains = ["hardhat", "localhost"];
  const ROUTER_ADDRESS_V2 = process.env.NEO_ROUTER_ADDRESS_V2;
  args = [ROUTER_ADDRESS_V2];
  const contract = await deploy("TokenChecker", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  //   await verify(contract.address, args);
  // }
};

module.exports.tags = ["Checker", "all"];
//0xC3e1bc7545E4e4B5be63Bca676C2AAdf3c305906 neo
