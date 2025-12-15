require('dotenv').config();

module.exports = async function (deployer, network, accounts) {
  // Optional funding for a project wallet during migration
  const target = process.env.PROJECT_WALLET;
  const amount = process.env.FUND_AMOUNT || '1';

  if (target) {
    console.log(`Funding project wallet ${target} with ${amount} ETH`);
    const value = web3.utils.toWei(amount.toString(), 'ether');
    await web3.eth.sendTransaction({ from: accounts[0], to: target, value });
    console.log('Fund sent to', target);
  } else {
    console.log('No PROJECT_WALLET specified; skipping funding migration.');
  }
};
