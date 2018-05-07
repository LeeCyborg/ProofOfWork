require('dotenv').config()
const web3Utils = require('web3-utils')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const web3 = new Web3(new HDWalletProvider(
  process.env.MNEMONIC,
  'http://127.0.0.1:8545'
))
const PoWArtifact = require('./build/contracts/ProofOfWork.json')
// eslint-disable-next-line promise/avoid-new
const timeout = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const MINIMUM_WORK = 10

const serialPort = '/dev/tty-usbserial1'
const SerialPort = require('serialport')

if (process.env.TEST) {
  const { Binding: MockBinding } = require('serialport/test')

  // Create a port and enable the echo and recording.
  MockBinding.createPort(serialPort, { echo: true, record: true })

  setInterval(() => {
    port.binding.emitData('1')
  }, 300)
}

const port = new SerialPort(serialPort, {
  baudRate: 9600,
})

const isNonceValid = (difficulty, challengeNumber, sender, nonce) => {
  const digest = web3Utils.soliditySha3(
    { t: 'bytes32', v: challengeNumber },
    { t: 'address', v: sender },
    { t: 'uint256', v: nonce },
  )

  return {
    valid: web3Utils.toBN(digest).lt(web3Utils.toBN(difficulty)),
    digest,
  }
}

let pingCount = 0
port.on('data', function (data) {
  pingCount++
})

const generateNonce = () => web3Utils.toBN(web3Utils.randomHex(32))

let didRequestExit = false
const main = async () => {
  const me = (await web3.eth.getAccounts())[0]
  const pow = new web3.eth.Contract(
    PoWArtifact.abi,
    PoWArtifact.networks['1'].address,
    {
      data: PoWArtifact.bytecode,
    }
  )

  let maxTries = 0
  while (true) {
    if (didRequestExit) { break }

    const difficulty = await pow.methods.difficulty().call()
    const challengeNumber = await pow.methods.challengeNumber().call()
    let validNonce
    let validDigest
    // the primary mining loop
    let count = 0
    while (true) {
      const newPingCount = pingCount + 1
      // eslint-disable-next-line no-unmodified-loop-condition
      while (pingCount < newPingCount) {
        await timeout(100)
      }
      // generate a random nonce
      count++
      if (count < MINIMUM_WORK) {
        continue
      }
      const nonce = generateNonce()
      // check to see if it's valid
      const {
        valid,
        digest,
      } = isNonceValid(
        difficulty,
        challengeNumber,
        me,
        nonce
      )
      if (valid) {
        validNonce = nonce
        validDigest = digest
        break
      }
    }

    console.log()
    console.log(`Got a valid nonce! Took ${count} tries.`)
    console.log()
    if (count > maxTries) { maxTries = count }
    // lights and shit

    // loading submission ....
    try {
      await pow.methods.mine(validNonce, validDigest).call({ from: me })
    } catch (error) {
      console.error(error)
    }

    port.write('pong')

    // next person steps up and we continue looping...
  }

  console.log('max tries', maxTries)
  process.exit(0)
}

const gracefulExit = async () => {
  if (didRequestExit) {
    process.exit(1)
  }
  didRequestExit = true
}

process.on('SIGINT', gracefulExit)
process.on('SIGTERM', gracefulExit)

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
