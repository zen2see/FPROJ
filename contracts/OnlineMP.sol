pragma solidity >=0.5.0;

import "./Ownable.sol";
    /// @author zen2see
    /// @title OnlineMarketPlace project

    /*
        Simple OnlineMarketPlace that operates on the blockchain.
    */
contract OnlineMP is Ownable {
    // state variables
    mapping (address => bool) public isStoreOwners;

    /*
        @notice A Store:
        Store id: @storeId
        Store name: @storeName
        Store balance: @storeBal
        Store owner: @storeOwners
        Store products: @products
    */
    struct Store {
      uint storeId;
      string storeName;
      uint256 storeBal;
      address storeOwners;
      uint256[] products;
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
        Product storeOwner: @storeOwner
        Product buyer: @buyer
    */
    struct Product {
      uint prodId;
      string prodName;
      string prodDescription;
      uint256 prodPrice;
      address storeOwner;
      address buyer;
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
      uint _storesId,
      string _storesName
    );

    /*
        LogAddProduct should provide infromation about the product ID, store ID and product name.
    */
    event LogAddProduct(
      uint256 _storeId,
      uint _productId,
      string _productName
    );

    /*
        LogSellProduct should provide information about the product ID and product name.
    */
    event LogSellProduct(
      address indexed _storeOwner,
      address indexed _buyer,
      string  _productName,
      uint256 _price
    );

    /*
        LogBuyTickets should provide information about the purchaser and the # of prodcuts purchased.
    */
    event LogBuyProduct(
      uint indexed _Id,
      address indexed _storeOwner,
      address indexed _buyer,
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
    constructor ()
      public
    {
      addStore(0, "Default Store", 10);
      getStore();
    }

    /**
        @notice Payable fallback
    */
    function() external payable {

    }


    function getStore()
      public
      view
      returns(
        uint _storeId,
        string memory _storeName,
        uint _storeBal
        //address _storeOwner,
        //uint[] memory _storeProd
      )
    {
      return(
        stores[storeCounter].storeId,
        stores[storeCounter].storeName,
        stores[storeCounter].storeBal
        //stores[storeCounter].storeOwner,
        //stores[storeCounter].storeProduct
      );
    }


    function addStore(uint astoriID, string memory _aStoreName, uint256 _stoBal)
      public
      returns( bool success)
    {
      storeCounter++;
      stores[storeCounter].storeId = astoriID;
      stores[storeCounter].storeName = _aStoreName;
      stores[storeCounter].storeBal = _stoBal;
      //stores[storeCounter].storeProduct
    }
    return (true);
}