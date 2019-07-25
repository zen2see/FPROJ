pragma solidity >=0.5.0;

    /// @author zen2see
    /// @title OnlineMarketPlace project


    /*
        Simple OnlineMarketPlace that operates on the blockchain.
    */
contract OnlineMarketPlace {
    // state variables
    address[] public mpAdmins;
    address[] payable public storeOwners;
    mapping (address => bool) public isAdmin;
    uint DEFAULT_PRICE = 100 wei;

    /*
        @notice A Store contains @storeId, @storeName, @storeBal, @storeOwner, @products, @shoppers
        The struct has 5 fields: storeName, sroreBBal, storeOwner, product
        Choose the appropriate variable type for each field.
        The "buyers" field should keep track of addresses and how many tickets each buyer purchases.
    */
    struct Store {
      uint storeId;
      string storeName;
      uint public storeBal;
      address payable storeOwner;
      uint[] products;
      // mapping (address => uint) shoppers;
    }

    Store stores;

    /*
        @notice A product:
        Product id: @prodId
        Product name: @prodName
        Product desc: @prodDescription
        Product price: @prodPrice
    */
    struct Product {
      uint prodId;
      string prodName;
      string prodDescription;
      uint prodPrice;
    }

    //  more state variables
    mapping (uint => Product) public products;
    uint prodCounter;

    /*
        LogAddStore should provide infromation about the store ID and store name
    */
    event LogAddStore(
      uint _logAstoresId;
      string _logAstoresName;
    )

    /*
        LogBuyTickets should provide information about the purchaser and the number of tickets purchased.
        LogAddProduct should provide infromation about the product ID  and product name
    */
    event LogAddProduct(
      uint _logAproductId;
      string _logAproductName;
    )

    /*
        LogSellProduct should provide information about the product ID and product name
    */
    event LogSellProduct(
      uint _logSprodId;
      string _logSproductName;
    )

    /*
        LogBuyTickets should provide information about the purchaser and the # of prodcuts purchased.
    */
    event LogBuyProduct(
      address _purchaser;
      uint _products
      )


    /*
        Create a modifier that throws an error if the msg.sender is not the owner.
    */
    modifier isOwner() {
      require(
        msg.sender == owner,
        "Only owner can call this function."
      );
      _;
    }

    /*
        Create a modifier that throws an error if the msg.sender is not the owner.
    */
    modifier isAdmin() {
      require(
        isAdmin[msg.sender] == true,
        "Only an Admin can call this function."
      );
      _;
    }


    /*
        Define a constructor.
        The constructor takes 3 arguments, the description, the URL and the number of tickets for sale.
        Set the owner to the creator of the contract.
        Set the appropriate myEvent details.
    */
    constructor ()
      public
    {
      mpAdmins[0] = msg.sender;
    }

    // Add store OWNER
    function addStoreOwners(uint _idOfStore, address _storeOwnerAddress)
      public
      isAdmin()
      returns(bool added)
    {   // need to put an if condition and return false if fails
        stores.storeId = _idOfStore;
        stores.storeOwner = _storeOwnerAddress;
        return true;
    }

    // sell a product
    function sellProduct(uint storesId, string pname, string pdesc, uint price)
      payable
      public
    {
      stores.storeId = storesId;


    }

    // buy a products
    function buyProduct(uint id)
      public
    {
      // check if products are available
      require(
        prodCounter > 0,
        "Verify there are products available"
      );
      // require buyer is not store owner or admin
      require(
        isAdmin[msg.sender] != true &&  stores.storeOwner[msg.sender] == 0x0;
        "Verify not an admin and not a store owner"
      );
      prodCounter++
    }

    function addStore(string _storename, )




        )

    }



    /*
    centralMarketStores -- managed by admins who can add stores
    admins -- allow storeOwners to addStores() to centralMarket
    storeOwners -- can manage their stores funds and inventory
    stores
      inventory funds
      goods
    shoppers can purchase goods in stock from store storeOwners
    */

    /*
    LogBuyTickets should provide information about the purchaser and the number of tickets purchased.
    LogGetRefund should provide information about the refund requester and the number of tickets refunded.
    LogEndSale should provide infromation about the contract owner and the balance transferred to them.
    */
}
