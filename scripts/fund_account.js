module.exports = async function (callback) {
  try {
    // truffle exec scripts/fund_account.js --network ganache -- <targetAddress> <amountInEth>
    const args = process.argv;
    // args structure: [node, truffle, 'exec', 'script', '--network', 'ganache', '--', ...userArgs]
    const userArgs = [];
    const dashIndex = args.indexOf('--');
    if (dashIndex >= 0) {
      for (let i = dashIndex + 1; i < args.length; i++) userArgs.push(args[i]);
    }

    const target = userArgs[0];
    const amount = userArgs[1] || '1';

    if (!target) {
      throw new Error('Usage: truffle exec scripts/fund_account.js --network ganache -- <targetAddress> <amountInEth>');
    }

    console.log('Funding target', target, 'with', amount, 'ETH');
    const accounts = await web3.eth.getAccounts();
    const from = accounts[0];
    const value = web3.utils.toWei(amount.toString(), 'ether');

    const tx = await web3.eth.sendTransaction({ from, to: target, value });
    console.log('TxHash:', tx.transactionHash);
    callback();
  } catch (err) {
    callback(err);
  }
};
