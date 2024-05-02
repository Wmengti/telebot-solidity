/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-10-14 17:52:01
 * @Description:
 */
const { verify } = require("../utils/verify");
const fs = require("fs");
const { ethers } = require("hardhat");
require("dotenv").config();

//neo

const factoryAddressV2 = process.env.NEO_FACTORY_ADDRESS_V2;

const routerAddressV2 = process.env.NEO_ROUTER_ADDRESS_V2;
module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const developmentChains = ["hardhat", "localhost"];

  args = [routerAddressV2, factoryAddressV2];
  const contract = await deploy("NeoTrader", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  //   await verify(contract.address, args);
  // }
};

module.exports.tags = ["NEOTrader", "all"];
//0x60D67DC06714129F8938f4E5ed909f183ec2F9d0 //xox
//0x04A0047e8c094EEDa5d32A9B349Fb617B7167135
