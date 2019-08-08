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
            $('#accountBalance').text(web3.fromWei(balance, "ether") + "ETH");
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
           App.displayStore(store[0], store[1], store[2], store[3], store[4], store[5]);
         });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  displayStore: function(id, storeOwner, name, description, price, products) {
    var storesRow = $('#storesRow');

    var etherPrice = web3.fromWei(price, "ether");

    var storesTemplate = $('#storesTemplate');
    storesTemplate.find('.panel-title').text(name);
    storesTemplate.find('.store-id').text(description);
    storesTemplate.find('.store-name').text(name);
    storesTemplate.find('.store-balance').text(etherPrice + "ETH");
    storesTemplate.find('.store-owner').text(storeOwner);
    storesTemplate.find('.store-products').text(products);
    storesTemplate.find('.btn-buy').attr('data-id', id);
    storesTemplate.find('.btn-buy').attr('data-value', etherPrice);

    // storeOwner
    if (storeOwner = App.account) {
      storesTemplate.find('.store-owner').text('You');
      storesTemplate.find('.btn-buy').hide();
    } else {
      storesTemplate.find('store-owner').text('storeOwner');
      storesTemplate.find('.btn-bbuy').show();
    }

    // add new store
    storesRow.append(storesTemplate.html());
  },

  addStore: function() {
    // retrieve the detail of the store
    var _storeName = $('#store_name').val();
    var _storeOwner = $('#store-owner').val();
    if ((_storeName.trim() == '')) {
      // no store
      return false;
    }

    App.contracts.OnlineMP.deployed().then(function(instance) {
      return instance.addStore(_storeName, App.account, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // listen to events triggered by the contract
  listenToEvents: function() {
    App.contracts.OnlineMP.deployed().then(function(instance) {
      instance.LogAddStore({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now a new store</li>');
        } else {
          console.error(error);
        }
        App.reloadStores();
      });

      instance.LogAddProduct({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._purchaser + ' bought ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadStores();
      });
    });
  }
};
/*
addProduct: function() {
  // retrieve the detail of the product
  var _prodName = $('#prod_name').val();
  var _prodDesc = $('#prod-desc').val()
  var _storeOwner = $('#purchaser').val();
  if ((_storeName.trim() == '')) {
    // no store
    return false;
  }

  App.contracts.OnlineMP.deployed().then(function(instance) {
    return instance.addStore(_storeName, App.account, {
      from: App.account,
      gas: 50000
    });
  }).then(function(result) {

  }).catch(function(err) {
    console.error(err);
  });
},

// listen to events triggered by the contract
listenToEvents: function() {
  App.contracts.OnlineMP.deployed().then(function(instance) {
    instance.LogAddStore({}, {}).watch(function(error, event) {
      if (!error) {
        $("#events").append('<li class="list-group-item">' + event.args._name + ' is now a new store</li>');
      } else {
        console.error(error);
      }
      App.reloadStores();
    });
*/



$(function() {
  $(window).load(function() {
       App.init();
  });
});


