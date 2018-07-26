import Web3 = require('web3');

import initListener from './listener';
import DrmApi from './api';

const abi = require('../../contract/build/contracts/DisputesManager.json').abi;
const config = require('./config.json');
const address = config.address;
const web3RPC = config.web3rpc;

const main = async () => {
  try {
    const web3 = new Web3(new Web3.providers.WebsocketProvider(web3RPC));
    await web3.eth.net.isListening();
    const ctr = new web3.eth.Contract(abi, address);

    const API = new DrmApi(config.login, config.password, config.endpoint);
    await initListener(API, ctr, config.fromBlock);
  } catch (err) {
    console.log({ err })
  }
};

main();
