/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-07-05 14:21:38
 * @Description:
 */
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { network } = require("hardhat");

describe("ContractNFT1155 Unit Tests", async function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  const deployFixture = async () => {
    const [owner, user1, user2] = await ethers.getSigners();
    const contractNFT1155 = await (
      await ethers.getContractFactory("ContractNFT1155", owner)
    ).deploy("Contract Soul Bound Token", "CBT");

    return { owner, user1, user2, contractNFT1155 };
  };

  describe("mintPair", async function () {
    it("employee error address", async () => {
      const { contractNFT1155, owner } = await loadFixture(deployFixture);
      await expect(
        contractNFT1155.connect(owner).mintPair(owner.address, ethers.constants.AddressZero, "solidity")
      ).to.be.reverted.revertedWithCustomError(contractNFT1155, "IsZeroAddress");
      await expect(
        contractNFT1155.connect(owner).mintPair(ethers.constants.AddressZero, owner.address, "solidity")
      ).to.be.reverted.revertedWithCustomError(contractNFT1155, "IsZeroAddress");
    });

    it("event should be call", async () => {
      const { contractNFT1155, owner, user1 } = await loadFixture(deployFixture);
      await contractNFT1155.connect(owner).mintPair(owner.address, user1.address, "solidity");
      await expect(contractNFT1155.connect(owner).mintPair(owner.address, user1.address, "solidity"))
        .to.emit(contractNFT1155, "MintPair")
        .withArgs(owner.address, user1.address, 3);
    });
    it("uri should be custom", async () => {
      const { contractNFT1155, owner, user1 } = await loadFixture(deployFixture);
      await contractNFT1155.connect(owner).mintPair(owner.address, user1.address, "solidity");
      const tokenURI = await contractNFT1155.connect(owner).uri(1);
      expect(tokenURI.length).gt(0);
    });
  });
});
