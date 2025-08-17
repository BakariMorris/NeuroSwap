import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "1".repeat(64);
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

export default {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
    },
    // Zircuit Testnet
    zircuitTestnet: {
      type: "http",
      url: "https://zircuit1-testnet.p2pify.com/",
      accounts: [PRIVATE_KEY],
      chainId: 48899,
      gasPrice: 1000000000, // 1 gwei
    },
    // Hedera Testnet
    hederaTestnet: {
      type: "http",
      url: "https://testnet.hashio.io/api",
      accounts: [PRIVATE_KEY],
      chainId: 296,
    },
    // Ethereum Sepolia (for testing)
    sepolia: {
      type: "http",
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    // Base Sepolia
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
    // Arbitrum Sepolia
    arbitrumSepolia: {
      type: "http",
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [PRIVATE_KEY],
      chainId: 421614,
    }
  },
  etherscan: {
    apiKey: {
      zircuitTestnet: "dummy", // Zircuit doesn't require API key
      hederaTestnet: "dummy",
      sepolia: process.env.ETHERSCAN_API_KEY,
      baseSepolia: process.env.BASESCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    },
    customChains: [
      {
        network: "zircuitTestnet",
        chainId: 48899,
        urls: {
          apiURL: "https://explorer.testnet.zircuit.com/api",
          browserURL: "https://explorer.testnet.zircuit.com"
        }
      }
    ]
  }
};