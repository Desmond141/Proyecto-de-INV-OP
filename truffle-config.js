/**
 * Truffle config specifying Solidity compiler 0.8.17
 * 
 * NOTA SOBRE PUERTOS:
 * - La red 'ganache' usa el puerto 7545 (puerto unificado para Ganache GUI y CLI)
 * - La red 'development' usa el puerto 8545 (para compatibilidad con otras configuraciones)
 * - El fund-server busca automáticamente en los puertos: 7545, 8546, 8545
 * 
 * IMPORTANTE: Si Ganache GUI no funciona, usa Ganache CLI con: npm run start-ganache
 */
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    }
  },
  compilers: {
    solc: {
      version: "0.8.17"
    }
  },
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts"
};
