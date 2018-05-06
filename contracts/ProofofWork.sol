pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


contract ProofOfWork is StandardToken, DetailedERC20 {

  event Mint(address indexed to, uint256 amount);

  uint256 public difficulty = 2**253 - 1;
  bytes32 public challengeNumber = bytes32(1);

  mapping(bytes32 => bytes32) public solutionForChallenge;

  constructor ()
    DetailedERC20("PoW", "POW", 18)
  {

  }

  function mine(uint256 nonce, bytes32 _challengeDigest)
    public
  {
    // only allow one solution per nonce
    bytes32 solution = solutionForChallenge[challengeNumber];
    require(solution == 0x0);

    bytes32 digest = keccak256(challengeNumber, msg.sender, nonce);

    // the challenge digest must match the expected
    require(digest == _challengeDigest);

    // the digest must be smaller than the target
    require(uint256(digest) <= difficulty);

    solutionForChallenge[challengeNumber] = digest;

    // use previous block's hash to avoid precomputes
    challengeNumber = block.blockhash(block.number - 1);

    uint256 _amount = 1;
    address _to = msg.sender;

    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
  }
}
