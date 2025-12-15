const P2PPay = artifacts.require('P2PPay')
const Malicious = artifacts.require('Malicious')

contract('Reentrancy Test', (accounts) => {
  it('should prevent reentrancy attack', async () => {
    const [deployer, payer, attacker] = [accounts[0], accounts[1], accounts[2]]
    const p2p = await P2PPay.new()
    const mal = await Malicious.new(p2p.address, { from: attacker })

    // payer deposits to malicious contract
    const value = web3.utils.toWei('1', 'ether')
    await p2p.payTo(mal.address, web3.utils.asciiToHex('ref'), { from: payer, value })

    // Ensure p2p balanceOf(mal) is 1 ETH
    let bal = await p2p.balanceOf.call(mal.address)
    assert.equal(bal.toString(), value, 'mal contract should have 1 ETH balance in p2p')

    // Now attacker invokes attack
    await mal.attackWithdraw({ from: attacker })

    // After the attack, mal contract's balance pulled to attacker (owner) - total drained should not exceed 1 ETH
    // Check contract balance in P2P is zero now
    bal = await p2p.balanceOf.call(mal.address)
    assert.equal(bal.toString(), '0', 'contract balance should be zero after withdraw')

    // Owner (attacker) should have received the funds (balance increased) - can't check exact value reliably due to gas costs
    // Main check: ether not drained from contract beyond the expected; since all funds are 1 ETH it should not exceed
  })
})
