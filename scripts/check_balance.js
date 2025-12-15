module.exports = async function (callback) {
  try {
    const args = process.argv;
    const userArgs = [];
    const dashIndex = args.indexOf('--');
    if (dashIndex >= 0) {
      for (let i = dashIndex + 1; i < args.length; i++) userArgs.push(args[i]);
    }
    const target = userArgs[0];
    if (!target) {
      throw new Error('Usage: truffle exec scripts/check_balance.js --network ganache -- <address>');
    }
    const bal = await web3.eth.getBalance(target);
    console.log(`Balance of ${target}: ${web3.utils.fromWei(bal, 'ether')} ETH`);
    callback();
  } catch (err) {
    callback(err);
  }
}
