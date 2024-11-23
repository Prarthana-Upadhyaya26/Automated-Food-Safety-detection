const chain = artifacts.require("chain");

module.exports = function (deployer) {
  deployer.deploy(chain);
};