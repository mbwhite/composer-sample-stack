'use strict';

const Table = require('cli-table');
const prettyoutput = require('prettyoutput');
var config = require('config').get('composer-sample-app');
const uuidV1 = require('uuid/v1');


// Require the client API
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

// these are the credentials to use to connect to the Hyperledger Fabric
let participantId = config.get('participantId');
let participantPwd = config.get('participantPwd');

// physial connection details (eg port numbers) are held in a profile
let connectionProfile = config.get('connectionProfile');

// the logical business newtork has an indentifier
let businessNetworkIdentifier = config.get('businessNetworkIdentifier');

// ... which allows us to get a connection to this business network
let businessNetworkConnection = new BusinessNetworkConnection();

// the network definition will be used later to create assets
let businessNetworkDefinition;

// asset registry and asset factory
let assetRegistry;
let factory;

// create the connection
businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
  .then((result) => {
      businessNetworkDefinition = result;
      console.log('Connected: BusinessNetworkDefinition obtained=' + businessNetworkDefinition.getIdentifier());
      return businessNetworkConnection.getAllAssetRegistries();
  }).then((result) => {
      console.log('List of asset registries=');

      let table = new Table({
          head: ['Registry Type', 'ID', 'Name']
      });
      for (let i=0; i<result.length; i++){
          let tableLine = [];

          tableLine.push(result[i].registryType);
          tableLine.push(result[i].id);
          tableLine.push(result[i].name);
          table.push(tableLine);
      }

      console.log(table.toString());
      return;
  }).then( () => {
      console.log('Getting the asset registry or org.acme.biznet.detail.SampleAsset');
       return businessNetworkConnection.getAssetRegistry('org.acme.biznet.detail.SampleAsset');
  } )
  .then((result)=>{
      console.log('Getting the factory...');
      assetRegistry = result;
      factory = businessNetworkDefinition.getFactory();
      console.log('...got the factory');
      let asset = factory.newInstance('org.acme.biznet.detail','SampleAsset',uuidV1(),{'generate':'sample'});
      console.log('Creating the asset ');
      asset.superNotes = 'this is a note for the super-type';
      asset.coreAssetNote = 'Core Asset Note';
      console.log('Adding the asset '+prettyoutput(asset));
      return assetRegistry.add(asset);
  })
  .then (()=>{
    console.log('Getting all the registries');
    let assetBack = assetRegistry.getAll();
    return assetBack;
  })
  .then((result) => {
    console.log('Showing all the results');
    for (let i =0; i< result.length; i++){
        console.log(prettyoutput(result[i]));
    }

  })
  .then(() => {
      return businessNetworkConnection.disconnect();
  })
  .then(() => {
      console.log('All done');
      process.exit();
  })
  // and catch any exceptions that are triggered
  .catch(function (error) {
      throw error;
  });
