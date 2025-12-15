const P2PPay = artifacts.require("P2PPay")

contract('P2PPay', (accounts) => {
  const [payer, payee] = [accounts[0], accounts[1]]

  it('registers payment and allows withdraw', async () => {
    const instance = await P2PPay.new()

    // payer sends 1 ether to payee
    const value = web3.utils.toWei('1', 'ether')
    await instance.payTo(payee, web3.utils.fromAscii('invoice1'), { from: payer, value })

    const bal = await instance.balanceOf(payee)
    assert.equal(bal.toString(), value, 'balance should be 1 ether')

    // withdraw by payee
    const before = web3.utils.toBN(await web3.eth.getBalance(payee))
    const tx = await instance.withdraw({ from: payee })
    const after = web3.utils.toBN(await web3.eth.getBalance(payee))
    // after should be greater than before (ignoring gas for test simplicity)
    assert(after.gt(before), 'payee balance should increase after withdraw')

    const balAfter = await instance.balanceOf(payee)
    assert.equal(balAfter.toString(), '0', 'contract balance should be zero after withdraw')
  })
})
