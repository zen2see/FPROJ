pragma solidity >=0.6.0 < 0.7.0;

import "./Ownable.sol";

    /// @author zen2see
    /// @title OnlineMarketPlace project

    /*
        Simple OnlineMarketPlace that operates on the blockchain
    */
contract OnlineMP is Ownable {
    /*
        state variables
    */
    
    // storeId assigned to each product
    uint storeIdp;

    // address storeOwners mapping;
    mapping (address => bool) public isStoreOwners;

    /*
        @notice A Store:
        Store id: @storeId
        Store name: @storeName
        Store balance: @storeBal
        Store owner: @storeOwner
        Store products: @products
    */
    struct Store {
      uint storeId;
      string storeName;
      uint256 storeBal;
      address payable storeOwner;
      uint[] products;
    }

    /*
        state variables, declare a store as a structure type through mapping
    */
    mapping (uint => Store) public stores;
    // store the stores count (public for getter())
    uint storeCounter;
    // store the stores product count (public for getter())
    uint storeProdCounter;

    /*
        @notice A Product:
        Product id: @prodId
        Product name: @prodName
        Product desc: @prodDescription
        Product price: @prodPrice
        Product purchaser: purchaser
    */
    struct Product {
      uint prodId;
      string prodName;
      string prodDescription;
      uint256 prodPrice;
      address payable purchaser;
      uint storeIdp;
    }

    /*
         more state variables as a structure type..
    */
    mapping (uint => Product) public products;
    uint prodCounter;

    /*
        LogAddStore should provide info about the store ID, store owner and store name
    */
    event LogAddStore(
      uint indexed _storeId,
      address indexed _storeOwner,
      string _storeName  
    );

    /*
        LogSelectStore should provide info about the store selected
    
    event LogSelectStore(
      uint indexed _storeId,
      string _storeName
      uint256 _storeBal,
      address _storeOwner
      uint[] _storeProducts
    );
    */

    /*
        LogAddProduct should provide info about product ID, name, desc and price
    */
    event LogAddProduct(
      uint indexed _prodId,
      string _prodName,
      string _prodDescription,
      uint256 _prodPrice,
      uint _storeIdp
    );

    /*
        LogSellProduct should provide info about the product ID, seller (store owner), product name and price
    */
    event LogSellProduct(
      uint indexed _storeID,
      address indexed _storeOwner,
      string  _productName,
      uint256 _price
    );

    /*
        LogBuyTickets should provide info about prod ID, seller (store owner), purchaser, prod name and prod price
    */
    event LogBuyProduct(
      uint indexed _productId,
      address indexed _purchaser,
      string  _productName,
      uint256 _price
    );

    /*
        Create a modifier that throws an error if the address !storeOwner
    */
    modifier isStoreOwner(address _isStoreOwner) {
      require(
        isStoreOwners[_isStoreOwner] == true,
        "Only store owner can call ths function."
      );
      _;
    }

    /*
        Define a constructor.
    
    constructor (string memory _defaultStoreName, address payable _defaultAddress)
      public
    {
      owner = msg.sender;
      addStore(_defaultStoreName, 0, _defaultAddress);
    }
    */
    /* 
        Calling the Ownable constructor to insure that the address deploying this contract is 
         regsitered as owner
    */
    constructor()
      public
      Ownable()
    {
      
    }

    /*
        @notice Payable fallback
    */
    receive() external payable {
    }

    // kill the smart contract
    function kill() public onlyOwner {
      selfdestruct(msg.sender);
    }

    /*
        This function adds an address as a store owner
    */
    function addStoreOwner(address _newStoreOwner)
      public
      onlyOwner
    {
      isStoreOwners[_newStoreOwner] = true;
    }

    /*
        This function adds values for:
          storeId
          storeName
          storeOwner
    */
    function addStore(string memory _storeName)
      public
      onlyOwner
    {

    /*
        store count
    */
      storeCounter++;

    /*
        update via StoreId
    */
      stores[storeCounter] = Store(
        storeCounter,
        _storeName,
        msg.sender.balance,
        msg.sender,
        stores[storeCounter].products
      ); 

      emit LogAddStore(storeCounter, msg.sender, _storeName);
    }

    /*
        This function adds values for:
          prodId
          prodName
          prodDescription
          prodPrice
          storeId
    */
    function addProduct(
      string memory _prodName,
      string memory _prodDescription,
      uint _prodPrice
    )
      public
    {
    
    /*
    require(
        products[prodCounter].purchaser == 
        product.purchaser == address(0),
        "The product should not have been sold yet"
      );
    */

    /*
        prod count
    */
      prodCounter++;
    
    /*
      obtain storeId
    */
      storeIdp = stores[storeCounter].storeId;
    /*
        update via storeId
    */
      products[prodCounter] = Product(
        prodCounter,
        _prodName,
        _prodDescription,
        _prodPrice,
        msg.sender,
        storeIdp
      );

      stores[storeCounter].products.push(products[prodCounter].prodId);
      storeProdCounter++;

      emit LogAddProduct(prodCounter, _prodName, _prodDescription, _prodPrice, storeIdp);
    }

    /*
        This function gets the store counter
    */
    function getNumberOfStores() public view returns (uint) {
      return storeCounter;
    }

    /*
        This function gets all the stores
    */
    function getStoresOwned() public view returns (uint[] memory) {
      
    /*
        Store IDs
    */
      uint[] memory storeIds = new uint[](storeCounter);

      uint numberOfStores = 0;

    /*
        Collect IDs of stores available
    */
      for (uint i = 1; i <= storeCounter; i++) {
        if (stores[i].storeOwner != address(0)) {
          storeIds[numberOfStores] = stores[i].storeId;
          numberOfStores++;
        }
      }

    /*
        Create a storesOwned array
    */
      uint[] memory storesOwned = new uint[](numberOfStores);
      for(uint j = 0; j < numberOfStores; j++) {
        storesOwned[j] = storeIds[j];
      }
      return storesOwned;
    }

    /*
        Select a store via id
    */
    function selectStore(uint _storeId)
      public
      view
      returns (
        uint,
        string memory,
        uint256,
        address,
        uint[] memory
      )
    {
      require(
        _storeId > 0 && _storeId <= getNumberOfStores(),
        "The store Id is not vaild"
      );

      return (
        stores[_storeId].storeId,
        stores[_storeId].storeName,
        stores[_storeId].storeBal,
        stores[_storeId].storeOwner,
        stores[_storeId].products
      );

      /*
      emit LogSelectStore(
          stores[_storeId].storeId,
          stores[_storeId].storeName
          //stores[_storeId].storeBal,
          //stores[_storeId].storeOwnedBy
      );
      */
    }

    /*
        This function gets the product counter
    */
    function getNumberOfProducts() public view returns (uint) {
      return prodCounter;
    }

    /*
        This function gets the products for sale
    */
    function getProductsForSale() public view returns (uint[] memory) {

    /*
        Store product IDs
    */
      uint[] memory productIds = new uint[](prodCounter);

      uint numberOfProductsForSale = 0;

    /*
        Collect IDs of products still for available for sale
    */
      for (uint i = 1; i <= prodCounter; i++) {
        if (products[i].purchaser != address(0)) {
          productIds[numberOfProductsForSale] = products[i].prodId;
          numberOfProductsForSale++;
        }
      }

    /*
        Create a forSale array
    */
      uint[] memory forSale = new uint[](numberOfProductsForSale);
      for(uint j = 0; j < numberOfProductsForSale; j++) {
        forSale[j] = productIds[j];
      }
      return forSale;
    }

    /*
        This function gets the store's products by Id (can't return string[]
        unless the experimental ABIEncoderv2 is enabled)

    function getStoreProductsById (uint _storeId)
      public
      view
      returns (uint[] memory) {

        Store IDs

      require(
        _storeId > 0 && _storeId <= getNumberOfStores(),
        "The store Id is not vaild"
      );
      uint[] memory storeProdIds = new uint[](prodCounter);

      string[] memory storeProdNames = new string[](prodCounter);

      uint numOfStoresProd = 0;


        Collect IDs of stores products

      for (uint i = 1; i <= prodCounter; i++) {
        if (stores[_storeId].products[i] != 0) {
          storeProdIds[numOfStoresProd] = stores[_storeId].products[i].prodId;
          // storeProdNames[numOfStoresProd] = stores[_storeId].products[i].prodName;
          numOfStoresProd++;
        }
      }



        Create a prodIdsForSale and prodNamesForSale arrays

      uint[] memory prodIdsForSale = new uint[](numOfStoresProd);

      string[] memory prodNamesForSale = new string[](numOfStoresProd);

      for(uint j = 0; j < numOfStoresProd; j++) {
        prodIdsForSale[j] = storeProdIds[j];
        prodNamesForSale[j] = storeProdNames[j];
      }
      return prodIdsForSale;
    }
    */

    /*
        Select a product via id
    */
    function selectProduct(uint _prodId)
      public
      view
      returns (
        uint,
        string memory,
        string memory,
        uint256,
        address
      )
    {
      require(
        _prodId > 0 && _prodId <= getNumberOfProducts(),
        "The product Id is not vaild"
      );
      return (
        products[_prodId].prodId,
        products[_prodId].prodName,
        products[_prodId].prodDescription,
        products[_prodId].prodPrice,
        products[_prodId].purchaser
      );
    }

    /*
        This function buys a product from store:
          storeId
          prodId
          prodName
          prodPrice
    */
    function buyProduct(uint _productId)
      public
      payable
    {
      require(
        prodCounter > 0,
        "The product should be available"
      );

      require(
        _productId > 0 && _productId <= prodCounter,
        "The product should exists"
      );

    /*
        retrieve product
    */
      Product storage btproduct = products[_productId];

      require(
        storeProdCounter > 0,
       "There should be at least one product in the store"
      );

      require(
        btproduct.purchaser == address(0),
        "The product should not have been sold yet"
      );
     
      require(
        btproduct.purchaser != msg.sender,
        "The store owner should not be allowed to buy their own products"
      );
  
      require(
        btproduct.prodPrice == msg.value,
          "The msg.value does not match product price"
      );

    /*
        update purchaser
    */
        btproduct.purchaser = msg.sender;

    /*
        purchaser ma es purchase avoid re-entrancy here
    */
        btproduct.purchaser.transfer(msg.value); 

    /*
        emit LogBuyProduct event
    */
        emit LogBuyProduct(
          _productId,
          btproduct.purchaser,
          btproduct.prodName,
          btproduct.prodPrice
        );
    }
}