var OnlineMP = artifacts.require("OnlineMP.sol");

// test suite
contract('OnlineMP', function(accounts) {
  var onlineMPInstance;
  var aBuyer = accounts[1];
  var aProdId = 1;
  var aProdName = "Product 1";
  var aProdDesc = "Description of Product 1";
  var aProdPrice = "5";
  it("should be initialized with empty values", function() {
    return OnlineMP.deployed().then(function(instance) {
      return instance.getProduct(0);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 0, "product id must be zero");
      assert.equal(data[1], "", "product name must be empty");
      assert.equal(data[2], "", "product description must be empty");
      assert.equal(data[3].toNumber(), 0, "product price must be zero");
    })
  });

  it("should sell a product", function() {
    return OnlineMP.deployed().then(function(instance) {
      onlineMPInstance = instance;
      return onlineMPInstance.sellProduct(aProdId, aProdName, aProdDesc, web3.utils.toWei(aProdPrice, "ether"), {from: aBuyer});
    }).then(function() {
      return onlineMPInstance.getProduct(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "product id must be one");
      assert.equal(data[1], aProdName, "product name must be Product 1");
      assert.equal(data[2], aProdDesc, "product description must be Description of Product 1");
      assert.equal(data[3].toString(), web3.utils.toWei(aProdPrice, "ether"), "product price must be " + web3.utils.toWei(aProdPrice, "ether"));
    });
  });
});