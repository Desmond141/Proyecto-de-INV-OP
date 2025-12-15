const P2PPay = artifacts.require('P2PPay')

module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts()
    const payer = accounts[0]
    const payee = accounts[1]

    const instance = await P2PPay.deployed()
    console.log('Using P2PPay at', instance.address)

    // Send 0.1 ETH from payer to payee
    const value = web3.utils.toWei('0.1', 'ether')
    await instance.payTo(payee, web3.utils.asciiToHex('ref1'), { from: payer, value })
    console.log('Payment registered')

    let bal = await instance.balanceOf.call(payee)
    console.log('Balance for payee:', web3.utils.fromWei(bal.toString(), 'ether'))

    // Withdraw as payee
    await instance.withdraw({ from: payee })
    console.log('Withdrawn by payee')

    bal = await instance.balanceOf.call(payee)
    console.log('Balance for payee after withdraw:', web3.utils.fromWei(bal.toString(), 'ether'))
    callback()
  } catch (err) {
    console.error(err)
    callback(err)
  }
}
