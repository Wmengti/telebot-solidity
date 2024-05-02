// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MerkleTree is ERC20 {
    using Counters for Counters.Counter;
    bytes32 public immutable root; // Merkle树的根
    mapping(address => bool) public whiteLists; // 记录已经mint的地址
    Counters.Counter private _tokenIdCounter;

    // 构造函数，初始化ERC20合集的名称、代号、Merkle树的根
    constructor(bytes32 merkleroot) ERC20("ARCENCIEL", "ciel") {
        root = merkleroot;
    }


    // 利用Merkle树验证地址并完成mint
    function mint(
        address account,
        bytes32[] calldata proof
    ) external {
        require(_verify(_leaf(account), proof), "Invalid merkle proof"); // Merkle检验通过
        require(!whiteLists[account], "Already minted!"); // 地址没有mint过
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(account, tokenId); // mint
        whiteLists[account] = true; // 记录mint过的地址
    }

    // 计算Merkle树叶子的哈希值
    function _leaf(address account) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    // Merkle树验证，调用MerkleProof库的verify()函数
    function _verify(bytes32 leaf, bytes32[] memory proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(proof, root, leaf);
    }

    function isWhite(bytes32[] calldata proof) public view virtual returns (bool){
        return MerkleProof.verify(proof, root, keccak256(abi.encodePacked((msg.sender))));
    }
}

