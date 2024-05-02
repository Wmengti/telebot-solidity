/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-10-11 21:50:21
 * @Description:
 */
const ethers = require("ethers");

// Connect to the Ethereum network via Infura
const provider = new ethers.providers.JsonRpcProvider("https://evm.ngd.network:32332");

// Address to query the balance of
const address = "0xbb03c5030cAC72E290Ae185A8b9b375C58f7A9a6";

// Get the balance in wei
provider
  .getBalance(address)
  .then((balance) => {
    // Convert to ether
    const balanceEth = ethers.utils.formatEther(balance);
    console.log(`The balance of ${address} is ${balanceEth} ETH`);
  })
  .catch((err) => {
    console.error(err);
  });
