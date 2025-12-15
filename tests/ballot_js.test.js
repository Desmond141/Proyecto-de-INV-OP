const Ballot = artifacts.require('Ballot')

contract('Ballot (JS tests)', (accounts) => {
  it('should create ballot and allow voting', async () => {
    const names = [web3.utils.asciiToHex('candidate1')]
    const instance = await Ballot.new(names)

    // give right to vote to account 1
    await instance.giveRightToVote(accounts[1], { from: accounts[0] })

    // vote from account 1
    await instance.vote(0, { from: accounts[1] })

    const winner = await instance.winningProposal()
    assert(parseInt(winner.toString()) === 0, 'winning proposal index should be 0')

    const winnerName = await instance.winnerName()
    // winnerName is bytes32
    assert(web3.utils.hexToAscii(winnerName).includes('candidate1'), 'winner name mismatch')
  })
})
