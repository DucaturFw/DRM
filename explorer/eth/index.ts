import Web3 from 'web3'

import initListener from './listener'
import DrmApi from './api'

const abi = require('../../contract/build/contracts/DisputesManager.json');
const config = require('./config.json');
const address = config.address;
const web3RPC = config.web3rpc;

const main = async () => {
  try {
    const web3 = new Web3(web3RPC);
    await web3.eth.net.isListening();
    const ctr = new web3.eth.Contract(abi, address);

    const API = new DrmApi(config);
    await initListener(API, ctr, config.fromBlock);
  } catch (err) {
    console.log({ err })
  }
};

main();
