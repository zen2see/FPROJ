App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    // load storesRow'
    /*
    var storesRow = $('#storesRow');
    var storesTemplate = $('#storesTemplate');

    storesTemplate.find('.panel-title').text('Store 1');
    storesTemplate.find('.store-id').text('Store Id');
    storesTemplate.find('.store-name').text('Store Name');
    storesTemplate.find('.store-balance').text("0.0");
    storesTemplate.find('.store-owner').text("0x01234567890123456789012345678901");

    storesRow.append(storesTemplate.html());
    */
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
    // refresh account information
    App.displayAccountInfo();
    // retrieve the stores placeholder and clear it
    $('#storesRow').empty();

    App.contracts.OnlineMP.deployed().then(function(instance) {
      return instance.getStore();
    }).then(function(stores) {
      // logic to check if store exists
      // retrieve the store template and fill it
      var storesTemplate = $('#storesTemplate');
      storesTemplate.find('.panel-title').text(stores[storeId].storeId);
      storesTemplate.find('.store-id').text(stores[storeId].storeId);
      storesTemplate.find('.store-name').text(stores[storeId].storeId);
      //storesTemplate.find('.store-balance').text(web3.fromWei(stores[storeId].storeBal, "ether"));
      storesTemplate.find('.store-balance').text(web3.fromWei(stores[storeId].storeId.storeBal, "ether"));
      storesTemplate.find('.store-owner').text(storeOwner);

      var storeOwner = msg.sender;

      // add this article
      $('#storesRow').append(storesTemplate.html());
    }).catch(function(err) {
      console.error(err.message);
    });
  }
};


$(function() {
  $(window).load(function() {
       App.init();
  });
});


