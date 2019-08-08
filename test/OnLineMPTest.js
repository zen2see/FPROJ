var OnlineMP = artifacts.require('OnlineMP')
// let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('OnlineMP', function(accounts) {
  const firstAccount = accounts[0]
  const secondAccount = accounts[1]
  const thirdAccount = accounts[2]

  const DefaultStoreName = "Default Store Name"
  var storeId = 0
  var storeBalance = 0
  var storeOwner = firstAccount
  var storeProducts = ""
  var storeName = "Default Store Name"
  var storeCount = 0
  var owner = accounts[0]
  let instance

  beforeEach(async () => {
      instance = await OnlineMP.new(DefaultStoreName, firstAccount)
  })

  describe("Setup", async() => {

      it("OWNER should be set as the store owner address", async() => {
          assert.equal(owner, firstAccount, "the storeOwner address should be the owner address")
      })

      it("it should let us add a store", async() => {
        const instance = await OnlineMP.new(DefaultStoreName, firstAccount)
        const nameCheck = await instance.getStores()
        assert.equal(nameCheck.stores[storeId].storeName, DefaultStoreName, "the Store names should match")
        //assert.equal(event.sales, 0, "the ticket sales should be 0")
      })

      it("'Default store name' should be set as the store name", async() => {
          const storeNameDetail = await OnlineMP.new("Default Store name", firstAccount)
          assert.equal(storeNameDetail.storeName, DefaultStoreName, "Default Store name should be the set")
      })

      it("Default store balance should be 0", async() => {
          const storeBalDetail = await OnlineMP.new("Default Store name", firstAccount)
          assert.equal(storeBalDetail.storeBal, 0, "the store balance should be zero")
      })
  })


})
