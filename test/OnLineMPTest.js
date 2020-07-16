// The public file for automated testing...

//import { catchRevert } from "./exceptionsHelpers.js"
const BN = web3.utils.BN
let OnlineMP = artifacts.require('./OnlineMP.sol')

contract('OnlineMP', function(accounts) {
    let mpAdmin = accounts[0];
    let storeOwner = accounts[1];
    let purchaser = accounts[2];
    let store1 = "Store1";
    let product1 = "Product1";
    let prod1desc = "Product1description";
    let zeroValue = 0;
    let oneValue = 1;

    beforeEach(async () => {
        instance = await OnlineMP.new();
    })


    describe("Setup", async() => {

        it("Owner should be set to the deploying address", async() => {
            const owner = await instance.owner();
            assert.equal(owner, accounts[0], "the deploying address should be the owner");
        })

        it("Owner should be set as the default mpAdmin", async() => {
            const owner = await instance.owner();
            assert.equal(owner, mpAdmin, "the mpAdmin should be the owner address");
        })

        it("No store should have been created", async() => {
            const storeCountDetail = await instance.getNumberOfStores();
            assert.equal(storeCountDetail, 0, "the store counter should be equal to zero");
        })

        it("No products should have been created", async() => {
            const productCountDetail = await instance.getNumberOfProducts();
            assert.equal(productCountDetail, zeroValue, "the product counter should be equal to zero");
        })

    })

    describe("Functions", () => {

        it("Owner should be able to add a Store owner", async() => {
            const receipt = await instance.addStoreOwner(storeOwner);
            assert.equal(receipt.logs.length, 1, "one event should have been emitted");
            assert.equal(receipt.logs[0].event, "LogAddStoreOwner", "the event should be LogAddStoreOwner");
            assert.equal(receipt.logs[0].args._newStoreOwner, storeOwner, "the store owner should be " 
            + storeOwner);
        }) 

        
        it("Store should be created", async() => {
            const owner = await instance.owner();
            const newStoreOwner = await instance.addStoreOwner(mpAdmin, { from: owner });
            const receipt = await instance.addStore("Store1", { from: mpAdmin });
            assert.equal(receipt.logs.length, 1, "one event should have been emitted");
            assert.equal(receipt.logs[0].event, "LogAddStore", "the event should be LogAddStore");
            assert.equal(receipt.logs[0].args._storeName, store1, "the store name should be " 
            + store1);
        })
        
    })
})