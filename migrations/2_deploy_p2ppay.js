const P2PPay = artifacts.require('P2PPay')

module.exports = function (deployer) {
  deployer.deploy(P2PPay)
}
