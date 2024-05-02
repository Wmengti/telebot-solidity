
const { verify } = require("../utils/verify");
const fs = require("fs");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = require("ethers/lib/utils");

const white = [
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0xb1BfB47518E59Ad7568F3b6b0a71733A41fC99ad"
]
const leaf = white.map(x => keccak256(x));
const markletree = new MerkleTree(leaf, keccak256, {sortPairs: true});
const root = markletree.getHexRoot();


module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const developmentChains = ["hardhat", "localhost"];

  args = [root];
  const tree = await deploy("MerkleTree", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  

  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  //   await verify(contract.address, args);
  // }
};

module.exports.tags = ["IDO", "all"];
//0x60D67DC06714129F8938f4E5ed909f183ec2F9d0 //xox
//0x04A0047e8c094EEDa5d32A9B349Fb617B7167135
