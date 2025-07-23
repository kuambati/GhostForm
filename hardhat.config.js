import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

export default {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 100000,
    },
  },
};
