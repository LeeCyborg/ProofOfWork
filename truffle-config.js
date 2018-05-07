/* eslint-disable camelcase */
require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider')

const provider = (url) => () => new HDWalletProvider(
  process.env.MNEMONIC,
  url
)

const infura = network => provider(`https://${network}.infura.io}`)

const defaultConfig = {
  gas: 7600000,
  network_id: '*',
}

module.exports = {
  mocha: {
    useColors: true,
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    geth: {
      provider: provider('http://127.0.0.1:8545'),
      ...defaultConfig,
    },
    development: {
      host: '127.0.0.1',
      port: 8545,
      ...defaultConfig,
    },
    mainnet: {
      provider: infura('mainnet'),
      ...defaultConfig,
      network_id: 1,
      gasPrice: 4000000000, // 4 gwei
    },
    rinkeby: {
      provider: infura('rinkeby'),
      ...defaultConfig,
      gas: 6500000,
      network_id: 4,
    },
  },
}
