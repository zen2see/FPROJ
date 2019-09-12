App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initialize web3
    if (typeof web3 !== 'undefined') {
      // reuse the provider of the web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      // create a new provider for use with our local currentProvider
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    // initiate provider
    web3 = new Web3(App.web3Provider);
    // display account address and balance
    App.displayAccountInfo();
    // initiate contract
    return App.initContract();
  },

  displayAccountInfo: function() {
    // retrieve main account we are connected to
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        // display account
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            // display balance
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },

  // create an instance of our contract
  initContract: function() {
    // Use JQuery Ajax call loading the json file that has info about our contract
    $.getJSON('OnlineMP.json', function(onlineMPArtifact) {
      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.OnlineMP = TruffleContract(onlineMPArtifact);
      // set the provider for our contracts
      App.contracts.OnlineMP.setProvider(App.web3Provider);
      // retrieve the stores from the contract

      //App.reloadProducts();
      return App.reloadStores();
    });
  },

  reloadStores: function() {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;
    // refresh account information
    App.displayAccountInfo();
    var onlineMPinstance;
    App.contracts.OnlineMP.deployed().then(function(instance) {
      onlineMPinstance = instance;
      return onlineMPinstance.getStoresOwned();
    }).then(function(storeIds) {
      // clear storesRow
      $('#storesRow').empty();
      for (var i = 0; i < storeIds.length; i++) {
         var storeId = storeIds[i];
         onlineMPinstance.stores(storeId.toNumber()).then(function(store) {
           App.displayStore(store[0], store[1], store[2], store[3], store[4]);
           //return onlineMPinstance.getProductsForSale();
         });
      }

      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  reloadProducts: function() {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;
    // refresh account information
    App.displayAccountInfo();
    var onlineMPinstance;
    App.contracts.OnlineMP.deployed().then(function(instance) {
      onlineMPinstance = instance;
      return onlineMPinstance.getProductsForSale();
    }).then(function(productIds) {
      // clear productsRow
      $('#productsRow').empty();
      for (var i = 0; i < productIds.length; i++) {
         var prodId = productIds[i];
         onlineMPinstance.products(prodId.toNumber()).then(function(product) {
           App.displayProduct(product[0], product[1], product[2], product[3], product[4], product[5]);
           App.displayProductInStore(product[1]);
         });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  displayProductInStore: function(prodName) {
    // var productsTemplate = $('#productsTemplate');
    var storesTemplate = $('#storesTemplate');
    storesTemplate.find('.store-products').text(prodName);
  },

  displayStore: function(id, name, storeBalance, storeOwner, products) {
    var storesRow = $('#storesRow');
    var etherPrice = web3.fromWei(storeBalance, "ether");
    var storesTemplate = $('#storesTemplate');
    storesTemplate.find('.panel-title').text(name);
    storesTemplate.find('.store-id').text(id);
    storesTemplate.find('.store-name').text(name);
    storesTemplate.find('.store-balance').text(etherPrice + " ETH");
    storesTemplate.find('.store-owner').text(storeOwner);
    //storesTemplate.find('.store-products').text(se);
    App.displayProductInStore();
    storesTemplate.find('.btn-buy').attr('data-id', id);
    storesTemplate.find('.btn-buy').attr('data-value', etherPrice);
    // storeOwner
    if (storeOwner = App.account) {
      storesTemplate.find('.store-owner').text('You');
      storesTemplate.find('.btn-buy').show();
    } else {
      storesTemplate.find('store-owner').text('storeOwner');
      storesTemplate.find('.btn-buy').show();
    }
    // add new store
    storesRow.append(storesTemplate.html());
  },

  displayProduct: function(prodId, prodName, prodDescription, prodPrice, prodPurchaser) {
    var productsRow = $('#productsRow');
    var etherProdPrice = web3.fromWei(prodPrice, "ether");
    var productsTemplate = $('#productsTemplate');
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

  addStore: function() {
    // get values from web interface
    var _storeName = $('#store_name').val();
    var _storeOwner = App.account;
    // var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
    if(_storeName.trim() == '') {
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

  selectStore: function() {
    var _storeId = $('#store_id').val();
    App.contracts.OnlineMP.deployed().then(function(instance) {
      onlineMPinstance = instance;
      return onlineMPinstance.selectStore(_storeId);
    }).then(function(result) {
      // clear storesRow
      $('#storesRow').empty();
      // clear poductsRow
      $('#productsRow').empty();
      //var storeId = _storeId;
      onlineMPinstance.stores(_storeId).then(function(store) {
        App.displayStore(store[0], store[1], store[2], store[3]);
      });
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  addProduct: function() {
    // get values from web interface
    var _prodName = $('#product_name').val();
    var _prodDesc = $('#product_description').val();
    var _prodPrice = web3.toWei(parseFloat($('#product_price').val() || 0), "ether");
    var storesTemplate = $('#storesTemplate');
    storesTemplate.find('.store-id').val();
    if((_prodName.trim() == '') || (_prodPrice == 0)) {
      // nothing to add
      return false;
    }
    App.contracts.OnlineMP.deployed().then(function(instance) {
      return instance.addProduct(_prodName, _prodDesc, _prodPrice, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
    }).catch(function(err) {
      console.error(err);
    });
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
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.OnlineMP.deployed().then(function(instance) {
      instance.LogAddStore({}, {}).watch(function(error, event) {
        $("#events").append('<li class="list-group-item">' + event.args._purchaser + ' bought ' + event.args._name + '</li>');
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now a new store</li>');
        } else {
          console.error(error);
        }
        App.reloadStores();
        App.reloadProducts();
      });
      instance.LogAddProduct({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._purchaser + ' bought ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadStores();
        App.reloadProducts();
      });
    });
  }
};

$(function() {
  $(window).load(function() {
       App.init();
  });
});
