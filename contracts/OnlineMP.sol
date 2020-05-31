// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 < 0.7.0;
/**
 * @title OnlineMP
 * @author zen2see
 * @notice Implements an Online Market Place
 */

// import "./GSN/Context.sol";
import "./Ownable.sol";

/*********************************************************************\
 * @notice  Simple OnlineMarketPlace that operates on the blockchain *
\*********************************************************************/
    
contract OnlineMP is Ownable {
    
    uint public fb;
    uint storeIdp;
    address public mpAdmin;
    mapping(address => bool) public isMPadmins;
    mapping(address => bool) public isStoreOwners;

    /**
     *  @notice A Store:
     *  @param Store id: @storeId
     *  @param Store name: @storeName
     *  @param Store balance: @storeBal
     *  @param Store owner: @storeOwner
     *  @param Store products: @products
     */
    struct Store {
        uint storeId;
        string storeName;
        uint256 storeBal;
        address payable storeOwner;
        uint[] storeProducts;
    }

    /**
     *  @notice state variables, declare a store as a structure type through mapping
     */ 
    mapping(uint => Store) public stores;
    
    uint storeCounter;
    
    /**
     *  @notice store the stores product count (public for getter())
     */
    uint storeProdCounter;

    /**
     *  @notice A Product: 
     *  @param Product id: @prodId
     *  @param Product name: @prodName
     *  @param Product desc: @prodDescription
     *  @param Product price: @prodPrice
     *  @param Product purchaser: purchaser
     *  @param Product id of store it belongs to
     */
    struct Product {
        uint prodId;
        string prodName;
        string prodDescription;
        uint256 prodPrice;
        address payable purchaser;
        uint storeIdp;
    }

    mapping(uint => Product) public products; 
    uint prodCounter;

    /**
     *  @notice LogAddStore should provide info about the store ID, store owner and store name
     *  @param _storeId the store id
     *  @param _storeOwner the store owner
     *  @param _storeName the store name
     */
    event LogAddStore(
        uint indexed _storeId,
        address indexed _storeOwner,
        string _storeName  
    );

    /**
        LogSelectStore should provide info about the store selected
    
    event LogSelectStore(
      uint indexed _storeId,
      string _storeName
      uint256 _storeBal,
      address _storeOwner
      uint[] _storeProducts
    );
    */

    /**
     *  @notice LogAddProduct should provide info about product ID, name, desc and price
     *  @param _prodId the product id
     *  @param _prodName the product name
     *  @param _prodDescription the product description
     *  @param _prodPrice the product price
     *  @param _storeIdp the id of the store this product belongs to
     */
    event LogAddProduct(
        uint indexed _prodId,
        string _prodName,
        string _prodDescription,
        uint256 _prodPrice,
        uint _storeIdp
    );


    /**
     *  @notice LogSellProduct should provide info about the product ID, seller (store owner), product name and price
     */
    event LogSellProduct(
        uint indexed _storeID,
        address indexed _storeOwner,
        string  indexed _productName,
        uint256 _price
    );

    /**
     *  @notice LogBuyTickets should provide info about prod ID, seller (store owner), purchaser, prod name and prod price
     */ 
    event LogBuyProduct(
        uint indexed _productId,
        address indexed _purchaser,
        string  indexed _productName,
        uint256 _price
    );

    /**
     *  @notice LogMsgData should provide the MsgData
     */
    event LogMsgData(
        bytes data
    );

    /**
     *  @notice LogAddStoreOwner should provide info about a new store owner
     */
    event LogAddStoreOwner(
        address indexed _newStoreOwner
    );

    /**
     *  @notice LogAdminFail should provide info about Admin rights issue
     */
    event LogAdminFail(
        address indexed _isAdminFail
    );

    /**
     *  @notice Create a modifier that throws an error if the address !isAdmin
     */
    modifier onlyAdmin(address _isAdmin) {
        require(
            isMPadmins[_isAdmin],
            "Must be an admin to call this function."
        );
        _;
    }

    /**
     *  @notice Create a modifier that throws an error if the address !isStoreOwner
     */
    modifier isStoreOwner(address _isStoreOwner) {
        require(
            isStoreOwners[_isStoreOwner],
            "Only a store owner can call ths function."
        );
        _;
    }

    /**
     *  @notice Create a modifier that throws an error if the address !storeOwner of the store
     */
    modifier onlyStoreOwner(address _onlyStoreOwner) {
        require(
            isStoreOwners[_onlyStoreOwner] && stores[storeCounter].storeOwner == _onlyStoreOwner,
            "Only the store owner can call ths function."
        );
        _;
    }

    /** 
     *  @notice Calling the Ownable constructor to insure that the address deploying this contract is 
     *  regsitered as owner and to set owner as an admin
     */
    constructor() 
        public
        Ownable()
    {
        mpAdmin = owner();      
        addAdmin(mpAdmin);
    }

    /**
     *  @notice Payable fallback
     */
    receive() external payable {
        emit LogMsgData(_msgData());
    }

    /**
     *  @notice kill the smart contract
     */
    function kill() public onlyOwner {
        selfdestruct(_msgSender());
    }
    
    /**
     *  @notice This function adds an MPadmin
     *  @param _newAdmin the new admin
     */
    function addAdmin(address _newAdmin)
        internal
        virtual
        onlyOwner
    {  
        isMPadmins[_newAdmin] = true;
    }

    /**
     *  @notice This function adds an address as a store owner
     *  @param _newStoreOwner the new store owner
     */ 
    function addStoreOwner(address _newStoreOwner)
        public
        onlyAdmin(_msgSender())
    {
        isStoreOwners[_newStoreOwner] = true;
        emit LogAddStoreOwner(_newStoreOwner); 
    }


    /**
     *  @notice This function adds values for the store id, name and owner:
     *  @param _storeName the store name
     */
    function addStore(string memory _storeName)
        public
        isStoreOwner(_msgSender())
    {

        /**
         *  @notice store counter
         */
        storeCounter++;

        /**
         *  @notice update via StoreId
         */
        stores[storeCounter] = Store(
            storeCounter,
            _storeName,
            msg.sender.balance,
            msg.sender,
            stores[storeCounter].storeProducts
        ); 

        emit LogAddStore(storeCounter, msg.sender, _storeName);
    }

    /**
     *  @notice This function adds a product
     *  @dev the prodcut id is derived from the counter
     *  @param _prodName the product name
     *  @param _prodDescription the product description
     *  @param _prodPrice the product price
     *  @dev the store id of which the product is listed 
     */
    function addProduct(
        string memory _prodName,
        string memory _prodDescription,
        uint _prodPrice
    )
        public
        onlyStoreOwner(_msgSender())
    {
    
        /*
          require(
              products[prodCounter].purchaser == 
              product.purchaser == address(0),
              "The product should not have been sold yet"
          );
        */

        prodCounter++;
    
        /**
         *  @notice update via storeId
         */
        products[prodCounter] = Product(
            prodCounter,
            _prodName,
            _prodDescription,
            _prodPrice,
            msg.sender,
            storeCounter
        );

        stores[storeCounter].storeProducts.push(prodCounter);
        storeProdCounter++;

        emit LogAddProduct(prodCounter, _prodName, _prodDescription, _prodPrice, storeIdp);
    }

    /**
     *  @notice This function gets the store counter
     *  @return the number of stores
     */
    function getNumberOfStores() public view returns (uint) {
        return storeCounter;
    }

    /**
     *  @notice This function gets all the stores
     *  @return the number of stores owned 
     */
    function getStoresOwned() public view returns (uint[] memory) {
        
       /**
        *  @notice Store IDs
        */
        uint[] memory storeIds = new uint[](storeCounter);

        uint numberOfStores = 0;

       /**
        *  @notice Collect IDs of stores available
        */
       for (uint i = 1; i <= storeCounter; i++) {
           if (stores[i].storeOwner != address(0)) {
               storeIds[numberOfStores] = stores[i].storeId;
               numberOfStores++;
           }  
        }

        /**
         *  @notice Create a storesOwned array
         */
         uint[] memory storesOwned = new uint[](numberOfStores);
         for(uint j = 0; j < numberOfStores; j++) {
             storesOwned[j] = storeIds[j];
         }
         return storesOwned;
      }

    /**
     *  @notice Select a store via id
     *  @param _storeId the store id
     *  @return the store id
     *  @return the store name
     *  @return the store owner
     *  @return the store products
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
          stores[_storeId].storeProducts
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

    /**
     *  @notice This function gets the product counter
     *  @return the product counter
     */
    function getNumberOfProducts() public view returns (uint) {
        return prodCounter;
    }

    /**
     *  @notice This function gets the products for sale
     *  @return the products for sale
     */
    function getProductsForSale() public view returns (uint[] memory) {

        /**
         *  @notice Store product IDs
         */
        uint[] memory productIds = new uint[](prodCounter);

        uint numberOfProductsForSale = 0;

        /**
         *  @notice Collect IDs of products still for available for sale
         */
        for (uint i = 1; i <= prodCounter; i++) {
            if (products[i].purchaser != address(0)) {
                productIds[numberOfProductsForSale] = products[i].prodId;
                numberOfProductsForSale++;
            }
        }

        /**
         *  @notice Create a forSale array
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

    /**
     *  @notice Select a product via id
     *  @return product's prodId
     *  @return product's prodName
     *  @return product's prodDescription
     *  @return product's productPrice
     *  @return product's product.purchaser
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

    /**
     *  @notice This function buys a product from store:
     *  @param _productId the product id
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

        /**
         * @notice retrieve product
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

        /**
         *  @notice update purchaser
         */
        btproduct.purchaser = _msgSender();

        /**
         *  @notice purchaser ma es purchase avoid re-entrancy here
         */
        btproduct.purchaser.transfer(msg.value); 

        /**
         *  @notice emit LogBuyProduct event
         */
        emit LogBuyProduct(
            _productId,
            btproduct.purchaser,
            btproduct.prodName,
            btproduct.prodPrice
        );
    }

    /**
     *  @notice transfer ownership
     
    function */
}