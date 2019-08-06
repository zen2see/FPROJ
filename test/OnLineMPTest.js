var OnlineMP = artifacts.require('OnlineMP')
// let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('OnlineMP', function(accounts) {
  const firstAccount = accounts[0]
  const secondAccount = accounts[1]
  const thirdAccount = accounts[2]

  const DefaultStoreName = "Default Store Name";
  var storeId = 0;
  var storeBalance = 0;
  var storeOwner = 0x0;
  var storeProducts = "";
  var admin = msg.sender;
  
  let instance

  beforeEach(async () => {
      instance = await OnlineMP.new()
  })

  describe("Setup", async() => {

      it("the addStore should return store details", async() => {
        const nameCheck = await instance.addStore(DefaultStoreName, )
        assert.equal(nameCheck.storeName, DefaultStoreName, "the Store names should match")
        //assert.equal(event.sales, 0, "the ticket sales should be 0")
      })

      it("OWNER should be set as the store owner address", async() => {
          const owner = await instance.owner()
          assert.equal(owner, firstAccount, "the storeOwner address should be the owner")
      })

      it("'Default store name' should be set as the store name", async() => {
          const storeNameDetail = await OnlineMP.new("Default Store name")
          assert.equal(storeNameDetail.storeName, "Default Store name", "Default Store name should be the set")
      })

      it("Default store balance should be 0", async() => {
          const storeBalDetail = await OnlineMP.new("Default Store name")
          assert.equal(storeBalDetail.storeBal, 0, "the store balance should be zero")
      })
  })


})
