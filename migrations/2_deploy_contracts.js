const OnlineMP = artifacts.require("OnlineMP");
module.exports = function(deployer, network, accounts) {
  var defaultAccount;
    if (network == "ganache") {
        defaultAccount = accounts[0]
    } else {
        defaultAccount = accounts[1]
    }
  deployer.deploy(OnlineMP);
};
