require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const web3 = new Web3(new HDWalletProvider(
  process.env.MNEMONIC,
  'http://127.0.0.1:8545'
))

const PoWArtifact = require('./build/contracts/ProofOfWork.json')

const deployContract = async (me, artifact) => {
  const Contract = new web3.eth.Contract(
    artifact.abi,
    {
      data: artifact.bytecode,
    }
  )
  const deployer = Contract.deploy()
  const gas = await deployer.estimateGas()
  return deployer.send({
    gas,
    from: me,
  })
}

const main = async () => {
  console.log(await web3.eth.getAccounts())
  const me = (await web3.eth.getAccounts())[0]
  console.log('me:', me)
  const pow = await deployContract(me, PoWArtifact)
  console.log(`Proof of Work: ${pow._address}`)
  process.exit(0)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
