const { keccak256 } = require("ethers/lib/utils");
const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const { abi: treeABI } = require("./MerkleTree.json");
require("dotenv").config();
const white = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0xb1BfB47518E59Ad7568F3b6b0a71733A41fC99ad"
]
const main = async ()=> {
    // 生成MerkleTree
    const leaf = white.map(x => keccak256(x));
    const markletree = new MerkleTree(leaf, keccak256, {sortPairs: true});
    const root = markletree.getHexRoot();
   
    // // // 部署合约
    // const MarkleTree = await ethers.getContractFactory("MerkleTree");
    // const tree = await MarkleTree.deploy(root);
    // console.log(tree.address);
    // await tree.deployed();
    
    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC_URL);
    const owner = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    // 0xb0d7f7d5F04Dd60Cb68ee1d23039a756BfA81074
    const tree = new ethers.Contract('0xf2727a9530B8a2FF6e3Be3c4ab4fb06C208B4848', treeABI, provider);
    // 白名单 mint
    // for (let i = 0; i < white.length; i++) {
    //     const proof = markletree.getHexProof(leaf[i]);
    //     const tx = await tree.connect(owner).mint(white[i], proof);
    //     // await tx.wait();
    //     console.log(proof)
        // console.log(await tree.whiteLists(white[i]));
    // }
  
    const proof = markletree.getHexProof(leaf[2]);
    console.log(proof)
    const bool = await tree.connect(owner).isWhite([
          '0x343750465941b29921f50a28e0e43050e5e1c2611a3ea8d7fe1001090d5e1436'
        ]);
    
        // await tx.wait();
        // console.log(await tree.whiteLists(white[i]));
    console.log(bool)

    //  不存在的白名单 会报错
    // const proof = markletree.getHexProof(leaf[0]);
    // await tree.connect(owner).mint("0x71bE63f3384f5fb98995898A86B02Fb2426c5788", proof);

}

main()
    .catch(err =>{
        console.log(err);
        process.exit(1);
    })
