const ProofOfWork = artifacts.require('ProofOfWork')
const PoWCollectible = artifacts.require('PoWCollectible')

module.exports = function (deployer, accounts, network) {
  if (network === 'mainnet') {
    return deployer.deploy(PoWCollectible)
  } else {
    return deployer.deploy(ProofOfWork)
  }
}
