require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("hardhat-dependency-compiler");

// Enable gas reporting (optional)
const REPORT_GAS = process.env.REPORT_GAS?.toLowerCase() === "true" ? true : false;
const COINMARKETCAP = process.env.COINMARKETCAP;

const SOLC_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1_000,
  },
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.8.7",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.8.0",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.5.7",
        settings: SOLC_SETTINGS,
      },

      {
        version: "0.7.6",
        settings: SOLC_SETTINGS,
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_KEY,
      },
    },
    goerli: {
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY],
      url: process.env.GOERLI_RPC_URL,
      blockConfirmations: 6,
    },

    polygonMumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "UNSET",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
      confirmations: 6,
      nativeCurrencySymbol: "MATIC",
    },
    neoevm: {
      url: process.env.NEOEVM_RPC_URL || "UNSET",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 2970385,
      confirmations: 6,
      nativeCurrencySymbol: "GAS",
    },
  },
  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    // to get exact network names: npx hardhat verify --list-networks
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "UNSET",
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    // outputFile: "gas-report.txt",
    coinmarketcap: COINMARKETCAP,
    noColors: true,
  },
  contractSizer: {
    runOnCompile: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
  dependencyCompiler: {
    paths: ["solmate/src/tokens/WETH.sol"],
  },
};
