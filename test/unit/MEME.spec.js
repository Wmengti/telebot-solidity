/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-19 16:01:54
 * @Description:
 */
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { network } = require("hardhat");
describe("MEME coin Unit Tests", async function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const deployFixture = async () => {
    const [owner, user1, user2] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("MEME", owner)).deploy();

    return { owner, user1, user2, contract };
  };

  describe("trade", async function () {
    it("permit", async () => {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      const chainId = network.config.chainId;
      //balance
      let deployMEMEBalance = ethers.utils.formatEther(await contract.balanceOf(owner.address)).toString();
      let user1MEMEBalance = ethers.utils.formatEther(await contract.balanceOf(user1.address)).toString();
      console.log(deployMEMEBalance, user1MEMEBalance);
      const value = ethers.utils.parseEther("1");
      const deadline = Math.floor(Date.now() / 1000) + 4200;
      const nonces = await contract.nonces(owner.address);
      const domain = {
        name: await contract.name(),
        version: "1",
        chainId: chainId,
        verifyingContract: contract.address,
      };

      // set the Permit type parameters
      const types = {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      };
      // set the Permit type values
      const values = {
        owner: owner.address,
        spender: user1.address,
        value: value,
        nonce: nonces,
        deadline: deadline,
      };

      // sign the Permit type data with the deployer's private key
      const signature = await owner._signTypedData(domain, types, values);
      const sig = ethers.utils.splitSignature(signature);
      const recovered = ethers.utils.verifyTypedData(domain, types, values, sig);
      gasPrice = await ethers.provider.getGasPrice();

      // permit the tokenReceiver address to spend tokens on behalf of the tokenOwner
      let tx = await contract
        .connect(owner)
        .permit(owner.address, user1.address, value, deadline, sig.v, sig.r, sig.s, {
          gasPrice: gasPrice,
          gasLimit: 80000, //hardcoded gas limit; change if needed
        });

      await tx.wait(2); //wait 2 blocks after tx is confirmed

      console.log(`Check allowance of tokenReceiver: ${await contract.allowance(owner.address, user1.address)}`);
      tx = await contract.connect(user1).transferFrom(owner.address, user1.address, value, {
        gasPrice: gasPrice,
        gasLimit: 80000, //hardcoded gas limit; change if needed
      });
      await tx.wait(2);
      //balance
      let deployMEMEafterBalance = ethers.utils.formatEther(await contract.balanceOf(owner.address)).toString();
      let user1MEMEafterBalance = ethers.utils.formatEther(await contract.balanceOf(user1.address)).toString();
      console.log(deployMEMEafterBalance, user1MEMEafterBalance);
    });
  });
});
