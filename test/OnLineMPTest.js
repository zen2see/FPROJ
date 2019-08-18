var OnlineMP = artifacts.require('OnlineMP')
// let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN

contract('OnlineMP', function(accounts) {
  const firstAccount = accounts[0]
  const secondAccount = accounts[1]
  const thirdAccount = accounts[2]

  const DefaultStoreName = "Default Store Name"
  const zeroValue = 0
  const oneValue = 1
  const zeroProducts = ""

  let instance

  beforeEach(async () => {
      instance = await OnlineMP.new(DefaultStoreName, firstAccount)
  })

  describe("Setup", async() => {

      it("OWNER should be set to the deploying address", async() => {
          const owner = await instance.owner()
          assert.equal(owner, firstAccount, "the deploying address should be the owner")
      })

      it("OWNER should be set as the default storeOwner address", async() => {
          const owner = await instance.owner()
          assert.equal(owner, firstAccount, "the storeOwner address should be the owner address")
      })

      it("One store should have been created", async() => {
          //const instance = await OnlineMP.new("Default Store name", firstAccount)
          const storeCountDetail = await instance.getNumberOfStores()
          assert.equal(storeCountDetail.storeCounter, 1, "the store counter should be equal to one")
      })
      /*
      it("'Default store name' should be set as the store name", async() => {
          assert.equal(DefaultStoreName, "Default Store name", "Default Store name should be the set")
      })

      it("The number of stores should equal one", async() => {
        const getNumberOfStores()
          assert.equal(DefaultStoreName, "Default Store name", "Default Store name should be the set")
      })
      */
  })

  describe("Functions", () => {

      it("selectStore(1) should return store ID 1", async() => {
          const selectDetail = await instance.selectStore(1)

          assert.equal(stores[1].storeID, oneValue, "the storeId should be equal to one")
      })



      it("Default store balance should be 0", async() => {
          const storeBalDetail = await OnlineMP.new("Default Store name", firstAccount)
          assert.equal(storeBalDetail.storeBal, 0, "the store balance should be zero")
      })


      it("it should let us add a store", async() => {
        const instance = await OnlineMP.new(DefaultStoreName, firstAc)
        const nameCheck = await instance.addStore()
        assert.equal(nameCheck.stores[storeId].storeName, DefaultStoreName, "the Store names should match")
        //assert.equal(event.sales, 0, "the ticket sales should be 0")
      })

  })

})
