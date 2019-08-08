pragma solidity >=0.5.0;

import "./Ownable.sol";
    /// @author zen2see
    /// @title OnlineMarketPlace project

    /*
        Simple OnlineMarketPlace that operates on the blockchain.
    */
contract OnlineMP is Ownable {
    /*
        state variables
    */
    address storeOwner;
    mapping (address => bool) public isStoreOwners;

    /*
        @notice A Store:
        Store id: @storeId
        Store name: @storeName
        Store balance: @storeBal
        Store owner: @storeOwnedBy
        Store products: @products
    */
    struct Store {
      uint storeId;
      string storeName;
      uint256 storeBal;
      address storeOwnedBy;
      bytes32[20] products;
    }

    /*
        state variables, declare a store as a structure type through mapping
    */
    mapping(uint => Store) public stores;
    uint storeCounter;

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
    }

    /*
         more state variables as a structure type..
    */
    mapping(uint => Product) public products;
    uint prodCounter;

    /*
        LogAddStore should provide infromation about the store ID and store name
    */
    event LogAddStore(
      uint indexed _storesId,
      string _storesName,
      address _storeOwner
    );

    /*
        LogAddProduct should provide infromation about the product ID, name, description and price.
    */
    event LogAddProduct(
      uint indexed _prodId,
      string _productName,
      string _prodDescription,
      uint256 _prodPrice
    );

    /*
        LogSellProduct should provide information about the product ID and product name.
    */
    event LogSellProduct(
      address indexed _storeOwner,
      string  _productName,
      uint256 _price
    );

    /*
        LogBuyTickets should provide information about the purchaser and the # of prodcuts purchased.
    */
    event LogBuyProduct(
      uint indexed _productId,
      address indexed _purchaser,
      string  _productName,
      uint256 _price
    );

    /*
        Create a modifier that throws an error if the address !storeOwner.
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
    */
    constructor (string memory _defaultStoreName, address _defaultAddress)
      public
    {
      addStore(_defaultStoreName, _defaultAddress);
    }

    /*
        @notice Payable fallback
    */
    function() external payable {

    }

    /*
        This function adds values for:
          storeId
          storeName
          storeOwner
    */
    function addStore(string memory _storeName, address _newStoreOwner)
      public
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
        0,
        _newStoreOwner,
        stores[storeCounter].products
      );

      emit LogAddStore(storeCounter, _storeName, _newStoreOwner);
    }

    /*
        This function adds values for:
          prodId
          prodName
          prodDescription
          prodPrice
    */
    function addProduct(string memory _prodName, string memory _prodDescription, uint _prodPrice)
      public
    {

    /*
        store count
    */
      prodCounter++;

    /*
        update via storeId
    */
      products[prodCounter] = Product(
        prodCounter,
        _prodName,
        _prodDescription,
        _prodPrice,
        msg.sender
      );

      emit LogAddProduct(prodCounter, _prodName, _prodDescription, _prodPrice);
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
        if (stores[i].storeOwnedBy != address(0)) {
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
      for (uint i  =1; i <= prodCounter; i++) {
        if (products[i].purchaser == address(0x0)) {
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
        This function buys a product from store:
          storeId
          prodId
          prodName
          prodPrice
    */
    function buyProduct(uint _productId)
      payable
      public
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
        Product storage product = products[_productId];

        require(
          product.purchaser == address(0x0),
          "The product should not have been sold yet"
        );

    /*
        require(
          stores[_storesId].storeOwner != msg.sender,
          "The store owner should not be allowed to buy products"
        );
    */
        require(
          msg.value == product.prodPrice,
          "The msg.value corresponds to the produt price"
        );

    /*
        update purchaser
    */
        product.purchaser = msg.sender;

    /*
        purchaser makes purchase avoid re-entrancy here
    */
        product.purchaser.transfer(msg.value);

    /*
        emit LogBuyProduct event
    */
        emit LogBuyProduct(_productId, product.purchaser, product.prodName, product.prodPrice);
    }


}