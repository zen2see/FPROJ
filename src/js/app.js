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
    console.log(App.account.slice(0,6) + "...." + App.account.slice(-4));
    $('#account').text(App.account.slice(0,6) + "...." + App.account.slice(-4));
    const balance = await window.web3.eth.getBalance(App.account);
    $('#accountBalance').text(window.web3.utils.fromWei(balance, "ether") + " ETH");
  },
  
  updateAccountInfo: async () => {
    const intervalAccounts = await window.web3.eth.getAccounts();
    setInterval(function() {
      // Check if account has changed
      if (intervalAccounts[0] != App.account) {
        console.log(intervalAccounts[0]);
        console.log(App.account);
        $('#infoTitle').empty();
        $('infoMainText').empty();
        $('#infoTitle').text("Account just changed");
        $('infoMainText').text("Please note: Account actions are permission based.");
        $('#infoModal').modal('show');
        (intervalAccounts[0] = App.account);
      }
      App.displayAccountInfo();
    }, 3000);
  },

  // create an instance of our contract
  initContract: async() =>  {
    // Use JQuery Ajax call loading the json file that has info about our contract
    $.getJSON('OnlineMP.json', onlineMPArtifact => {
      App.contracts.OnlineMP = TruffleContract(onlineMPArtifact);
      App.contracts.OnlineMP.setProvider(window.web3.currentProvider);
      App.listenToEvents();
      App.reloadStores();
      return 
    });
  },   

  // listen to events triggered by the contract
  listenToEvents: async () => {
    const onlineMPInstance = await App.contracts.OnlineMP.deployed(); 
    if (App.logAddStoreEventListener == null) {
      console.log("subscribed to add store events");
      App.logAddStoreEventListener = onlineMPInstance
      .LogAddStore({fromBlock: '0'})
      .on("data", event => {
        $('#' + event.id).remove();
        $('#events').append('<li class="list-group-item" id="' +
        event.id + '">' + " * " + event.returnValues._storeName + ' has been added as a store</li>');
        App.reloadStores();
        App.reloadProducts();
      })
      .on("error", error => {
        console.error(error);
      });
    }
    if (App.logAddProductEventListener == null) {
      console.log("subscribed to add product events");
      App.logAddProductEventListener = onlineMPInstance
      .LogAddProduct({fromBlock: '0'})
      .on("data", event => {
        $('#' + event.id).remove();
        $('#events').append('<li class="list-group-item" id="' +
        event.id + '">' + " * " + event.returnValues._prodName + ' has been added as a product</li>');
        App.reloadProducts();
        App.reloadStores();
      })
      .on("error", error => {
        console.error(error);
      });
    }
    if (App.logAddStoreOwnerEventListener == null) {
      console.log("subscribed to add store owner events");
      App.logAddStoreOwnerEventListener = onlineMPInstance
      .LogAddStoreOwner({fromBlock: '0'})
      .on("data", event => {
        $('#' + event.id).remove();
        $('#events').append('<li class="list-group-item" id="' +
        event.id + '">' + " * " + event.returnValues._newStoreOwner + ' has been added as a store owner</li>');
        App.reloadProducts();
        App.reloadStores();
      })
      .on("error", error => {
        console.error(error);
        $('#events').append(error);
        $('#errMain').text(error); 
      });
    }
    $('.btn-subscribe').hide();
    $('.btn-unsubscribe').show();
    $('.btn-show-events').show();
  },

  stopListeningToEvents: async () => {
    if (App.logAddStoreEventListener != null) {
      console.log("unsubscribed from add store events");
      await App.logAddStoreEventListener.removeAllListeners();
      App.logAddStoreEventListener = null;
    }
    if (App.logAddProductEventListener != null) {
      console.log("unsubscribed from add product events");
      await App.logAddProductEventListener.removeAllListeners();
      App.logAddProductEventListener = null;
    }
    if (App.logAddStoreOwnerEventListener != null) {
      console.log("unsubscribed from add store events");
      await App.logAddStoreOwnerEventListener.removeAllListeners();
      App.logAddStoreOwnerEventListener = null;
    }
    $('#events')[0].className = "list-group-collapse";
    $('.btn-subscribe').show();
    $('.btn-unsubscribe').hide();
    $('.btn-show-events').hide();
  },
  
  addStoreOwner: async () => {
    // get values from web interface
    const _newStoreOwner = $('#store_owner').val();
    // var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
    if (_newStoreOwner.trim() == '') {
      // newStoreOwner cannot be empty
      return false;
    }
    App.contracts.OnlineMP.deployed().then(function(instance) {
      return instance.addStoreOwner(_newStoreOwner, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
    }).catch(function(err) {
      console.error("There was some error" + err);
      $('#errMain').text("Problem displaying in event addStoreerror return");
    });
  },

  addStore: async () => {
    // get values from web interface
    const _storeName = $('#store_name').val();
    if (_storeName.trim() == '') {
      // storename cannot be empty
      return false;
    }
    App.contracts.OnlineMP.deployed().then(function(instance) {
      return instance.addStore(_storeName, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
    }).catch(function(err) {
      console.error(err);
    });
  },

  selectStore: async () => {
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
    const _prodName = $('#product_name').val();
    const _prodDesc = $('#product_description').val();
    const _prodPriceValue = parseFloat($('#product_price').val());
    const _prodPrePrice = isNaN(_prodPriceValue) ? "0" : _prodPriceValue.toString();
    const _prodPrice = window.web3.utils.toWei(_prodPrePrice, "ether");
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
        const store = await onlineMPInstance.stores(storeIds[i]);
        App.displayStore(store[0], store[1], store[2], store[3], store[4]);
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
    // refresh account information becasue the balance may need update
    App.displayAccountInfo();
    try {
      const onlineMPInstance = await App.contracts.OnlineMP.deployed();
      const productIds = await onlineMPInstance.getProductsForSale();
      // clear productsRow
      $('#productsRow').empty();
      for (let i = 0; i < productIds.length; i++) {
        const product = await onlineMPInstance.products(productIds[i]);
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
    const etherPrice = web3.utils.fromWei(storeBalance, "ether");
    const storesTemplate = $('#storesTemplate');
    storesTemplate.find('.panel-title').text(name);
    storesTemplate.find('.store-id').text(id);
    storesTemplate.find('.store-name').text(name);
    storesTemplate.find('.store-balance').text(etherPrice + " ETH");
    /* storeOwner OLD
    if (storeOwner = App.account) {
      storesTemplate.find('.store-owner').text(storeOwner + "(You)");
      storesTemplate.find('.btn-buy').show();
    } else {
      storesTemplate.find('store-owner').text(storeOwner);
      storesTemplate.find('.btn-buy').show();
    }
    */
    storesTemplate.find('.store-owner').text(storeOwner.slice(0,6) + "...." + storeOwner.slice(-4));
    storesTemplate.find('.btn-buy').show();
    // App.selectProductById(1);
    // storesTemplate.find('.store-products').text(App.selectProduct(id));
    // App.displayProductInStore();
    storesTemplate.find('.btn-buy').attr('data-id', id);
    storesTemplate.find('.btn-buy').attr('data-value', etherPrice);
    // add new store
    storesRow.append(storesTemplate.html());
  },

  displayProduct: (prodId, prodName, prodDescription, prodPrice, prodOwner, storeIdp) => {
    const productsRow = $('#productsRow');
    const etherProdPrice = web3.utils.fromWei(prodPrice, "ether");
    const productsTemplate = $('#productsTemplate');
    productsTemplate.find('.panel-title').text(prodName);
    productsTemplate.find('.product-id').text(prodId);
    productsTemplate.find('.product-name').text(prodName);
    productsTemplate.find('.product-desc').text(prodDescription)
    productsTemplate.find('.product-price').text(etherProdPrice + " ETH");
    productsTemplate.find('.product-owner').text(prodOwner.slice(0,6) + "...." + prodOwner.slice(-4));
    productsTemplate.find('.store-idp').text(storeIdp);
    productsTemplate.find('.btn-buy').attr('data-id', prodId);
    productsTemplate.find('.btn-buy').attr('data-value', etherProdPrice);
    /* prodOwner OLD
    if (product = App.account) {
      productsTemplate.find('.product-owner').text('You');
      productsTemplate.find('.btn-buy').show();
    } else {
      productsTemplate.find('product-owner').text(prodOwner);
      productsTemplate.find('.btn-buy').show();
    }
    */
    productsTemplate.find('product-owner').text(prodOwner);
    productsTemplate.find('.btn-buy').show();
    // add new product
    productsRow.append(productsTemplate.html());
  },
};

$(function() {
  $(window).load(function() {
       App.init().then(App.updateAccountInfo());
  });
});