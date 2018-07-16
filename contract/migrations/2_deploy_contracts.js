var DisputesManager = artifacts.require("./DisputesManager.sol");

module.exports = function(deployer) {
  deployer.deploy(DisputesManager, '0x0');
};
