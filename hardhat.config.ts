import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers"
// import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle";
import 'hardhat-deploy'
// import "hardhat-deploy-ethers"

const SEPOLIA_URL = process.env.SEPOLIA_URL
const SEPOLIA_CHAINID = process.env.SEPOLIA_CHAIN_ID
const SEPOLIA_ACCOUNT = process.env.SEPOLIA_ACCOUNT
const ETHERSCAN = process.env.ETHERSCAN!

const config: HardhatUserConfig = {
  defaultNetwork: "ganache",
  solidity: "0.8.7",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      chainId: parseInt(SEPOLIA_CHAINID!),
      accounts: [`0x${SEPOLIA_ACCOUNT}`!]
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: ["0x859cdf6f0d94bd0b3f53a04ecf91deeb0e51399db122fe67d4b9d5adf947777c"]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN
    }
  }
};

export default config;
