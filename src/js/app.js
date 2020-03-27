App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: async() =>  {
    return App.initWeb3();
  },

  initWeb3: async() =>  {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable(); 
        App.displayAccountInfo();
        return App.initContract();
      } catch(error) {
        // user denied access
        console.error("Unable to retrieve your accounts! Approve wallet 1st");
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider || "ws://localhost:8545");
      App.displayAccountInfo();
      return App.initContract();
    } else {
      // no dapp  browser
      console.log("Non-ethereum browser detected try Metamask");
    }
  },

  displayAccountInfo: async () => {
    const accounts = await window.web3.eth.getAccounts();
    App.account = accounts[0];
    $('#account').text(App.account);
    const balance = await window.web3.eth.getBalance(App.account);
    $('#accountBalance').text(window.web3.utils.fromWei(balance, "ether") + " ETH");
  },

  // create an instance of our contract
  initContract: async() =>  {
    // Use JQuery Ajax call loading the json file that has info about our contract
    $.getJSON('OnlineMP.json', onlineMPArtifact => {
      App.contracts.OnlineMP = TruffleContract(onlineMPArtifact);
      App.contracts.OnlineMP.setProvider(window.web3.currentProvider);
      App.listenToEvents();
      return App.reloadStores();
    });
  }, 

  // listen to events triggered by the contract
  listenToEvents: async () => {
    const onlineMPInstance = await App.contracts.OnlineMP.deployed();
    if (App.logAddStoreEventListener == null) {
      App.logAddStoreEventListener = onlineMPInstance
      .LogAddStore({fromBlock: '0'})
      .on("data", event => {
        $('#' + event.id).remove();
        $('#events').append('<li class="list-group-item" id="' +
        event.id + '">' + " * " + event.returnValues._name + ' has been added</li>');
        //App.reloadStores();
      })
      .on("error", error => {
        console.error(error);
      });
    }
    $('.btn-subscribe').hide();
    $('.btn-unsubscribe').show();
    $('.btn-show-events').show();
  },

  stopListeningToEvents: async () => {
    if (App.logAddStoreEventListener != null) {
      console.log("unsubscribe from add events");
      await App.logAddStoreEventListener.removeAllListeners();
      App.logAddStoreEventListener = null;
    }
    $('#events')[0].className = "list-group-collapse";
    $('.btn-subscribe').show();
    $('.btn-unsubscribe').hide();
    $('.btn-show-events').hide();
  }, 

  reloadStores: async () => {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;
    // refresh account information
    App.displayAccountInfo();  
    try {
      const onlineMPInstance = await App.contracts.OnlineMP.deployed();
      const storeIds = await onlineMPInstance.getStoresOwned();
      // clear storesRow
      $('#storesRow').empty();
      for (let i = 0; i < storeIds.length; i++) {
        const storeId = await onlineMPInstance.stores(storeIds[i]);
        //App.displayStore(store[0], store[1], store[2], store[3], store[4]);
      }
      App.loading = false;
    } catch (error) {
        console.error(error);
        App.loading = false;
    }
  },

  reloadProducts: async() => {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;
    // refresh account information
    try {
      const onlineMPInstance = await App.contracts.OnlineMP.deployed();
      const productIds = await onlineMPInstance.getProductsForSale();
      // clear productsRow
      $('#productsRow').empty();
      for (let i = 0; i < productIds.length; i++) {
        const prodId = await onlineMPInstance.products(productIds[i]);
        App.displayProduct(product[0], product[1], product[2], product[3], product[4], product[5]);
      }
      App.loading = false;
    } catch (error) {
        console.error(error);
        App.loading = false;
    }
  },
  
  displayStore: (id, name, storeBalance, storeOwner, products) => {
    const storesRow = $('#storesRow');
    const etherPrice = web3.fromWei(storeBalance, "ether");
    const  storesTemplate = $('#storesTemplate');
    storesTemplate.find('.panel-title').text(name);
    storesTemplate.find('.store-id').text(id);
    storesTemplate.find('.store-name').text(name);
    storesTemplate.find('.store-balance').text(etherPrice + " ETH");
    // storeOwner
    if (storeOwner = App.account) {
      storesTemplate.find('.store-owner').text("You");
      storesTemplate.find('.btn-buy').show();
    } else {
      storesTemplate.find('store-owner').text(storeOwne);
      storesTemplate.find('.btn-buy').show();
    }
    // App.selectProductById(1);
    // storesTemplate.find('.store-products').text(App.selectProduct(id));
    // App.displayProductInStore();
    storesTemplate.find('.btn-buy').attr('data-id', id);
    storesTemplate.find('.btn-buy').attr('data-value', etherPrice);
    // add new store
    storesRow.append(storesTemplate.html());
  },

  displayProduct: (prodId, prodName, prodDescription, prodPrice, prodPurchaser) => {
    const productsRow = $('#productsRow');
    const etherProdPrice = web3.fromWei(prodPrice, "ether");
    const productsTemplate = $('#productsTemplate');
    productsTemplate.find('.panel-title').text(prodName);
    productsTemplate.find('.prod-id').text(prodId);
    productsTemplate.find('.prod-name').text(prodName);
    productsTemplate.find('.prod-desc').text(prodDescription)
    productsTemplate.find('.prod-price').text(etherProdPrice + " ETH");
    productsTemplate.find('.prod-purchaser').text(prodPurchaser);
    productsTemplate.find('.btn-buy').attr('data-id', prodId);
    productsTemplate.find('.btn-buy').attr('data-value', etherProdPrice);
    // storeOwner
    if (productPurchaser = App.account) {
      productsTemplate.find('.prod-purchaser').text('You');
      productsTemplate.find('.btn-buy').show();
    } else {
      productsTemplate.find('prod-purchaser').text('prodPurchaser');
      productsTemplate.find('.btn-buy').show();
    }
    // add new product
    productsRow.append(productsTemplate.html());
  },

  addStore: () => {
    // get values from web interface
    const _storeName = $('#store_name').val();
    const _storeOwner = App.account;
    // var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
    if (_storeName.trim() == '') {
      // storename cannot be empty
      return false;
    }
    App.contracts.OnlineMP.deployed().then(function(instance) {
      return instance.addStore(_storeName, _storeOwner, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
    }).catch(function(err) {
      console.error(err);
    });
  },

  selectStore: () => {
    const _storeId = $('#store_id').val();
    App.contracts.OnlineMP.deployed().then(function(instance) {
      onlineMPinstance = instance;
      return onlineMPinstance.selectStore(_storeId);
    }).then(function(result) {
      // clear storesRow
      $('#storesRow').empty();
      // clear poductsRow
      $('#productsRow').empty();
      var storeId = _storeId;
        onlineMPinstance.stores(_storeId).then(function(store) {
        App.displayStore(store[0], store[1], store[2], store[3], store[4]);
      });
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  addProduct: async () => {
    // get values from web interface
    var storesTemplate = $('#storesTemplate'); 
    storesTemplate.find('.store-id').val();
    var _prodName = $('#product_name').val();
    var _prodDesc = $('#product_description').val();
    var _prodPriceValue = parseFloat($('#product_price').val());
    var _prodPrePrice = isNaN(_prodPriceValue) ? "0" : _prodPriceValue.toString();
    var _prodPrice = window.web3.utils.toWei(_prodPrePrice, "ether");
    if(_prodName.trim() == '' || _prodPrice == "0") {
      // nothing to add
      return false;
    }
    try {
      const onlineMPinstance = await App.contracts.OnlineMP.deployed();
      const transactionReceipt = await onlineMPinstance.addProduct(
        _prodName,
        _prodDesc,
        _prodPrice,
        {from: App.account, gas: 500000}
      ).on("transactionHash", hash => {
        console.log("transaction hash", hash);
      });
      console.log("transaction receipt", transactionReceipt);
    } catch(error) {
      console.log(error);
    }
  },

  selectProduct: function() {
    var _prodId = $('#prod_id').val();
    App.contracts.OnlineMP.deployed().then(function(instance) {
      onlineMPinstance = instance;
      return onlineMPinstance.selectProduct(_prodId);
    }).then(function(result) {
      // clear poductsRow
      $('#productsRow').empty();
      // clear storesRow
      $('#storesRow').empty();
      onlineMPinstance.products(_prodId).then(function(product) {
        App.displayProduct(product[0], product[1], product[2], product[3], product[4]);
      }); 
      console.error(err.message);
      App.loading = false;
    });
  },

  selectStoreProduct: function() {
    var storesTemplate = $('#storesTemplate');
    App.contracts.OnlineMP.deployed().then(function(instance) {
      onlineMPinstance = instance;
      return onlineMPinstance.storeProdCounter();
    }).then(function(storeProdCounter) {
      var stoProds = [];
      for (var i = 1; i <= storeProdCounter; i++) {
        onlineMPinstance.products(i).then(function(product) {
          return stoProds.push(product[0])
        });
      }
      storesTemplate.find('.store-products').text("help");
      // storesTemplate.find('.store-products').text(stoProds.toString());
      // App.displayProduct(product[0], product[1], product[2], product[3], product[4]);
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },
};

$(function() {
  $(window).load(function() {
       App.init();
  });
});