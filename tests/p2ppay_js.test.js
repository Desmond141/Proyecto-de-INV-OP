const P2PPay = artifacts.require('P2PPay')

contract('P2PPay (JS tests)', (accounts) => {
  const [payer, payee] = [accounts[0], accounts[1]]

  it('should register payment and allow withdraw (balances update)', async () => {
    const instance = await P2PPay.new()

    const value = web3.utils.toBN(web3.utils.toWei('1', 'ether'))

    // payer pays to payee
    await instance.payTo(payee, web3.utils.asciiToHex('invoice1'), { from: payer, value })

    const bal = web3.utils.toBN(await instance.balanceOf.call(payee))
    assert(bal.eq(value), `expected contract balance for payee ${value.toString()}, got ${bal.toString()}`)

    // payee withdraws
    const tx = await instance.withdraw({ from: payee })
    // after withdraw, mapping should be zero
    const balAfter = web3.utils.toBN(await instance.balanceOf.call(payee))
    assert(balAfter.eq(web3.utils.toBN(0)), 'expected zero balance after withdraw')

    // ensure event emitted
    const logs = tx.logs.filter(l => l.event === 'Withdrawn')
    assert(logs.length === 1, 'Withdrawn event not emitted')
    assert(web3.utils.toBN(logs[0].args.amount).eq(value), 'Withdrawn amount mismatch')
  })
})
