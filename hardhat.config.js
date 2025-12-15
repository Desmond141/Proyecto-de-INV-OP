/**
 * Hardhat config moved to project root — set Solidity compiler to 0.8.17
 */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337
    }
  },
  paths: {
    sources: "./contracts"
  }
};
