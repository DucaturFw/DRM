import Web3 from 'web3'

import initListener from './listener'
import api from './api'

const abi = require('../../contract/build/contracts/DisputesManager.json');
const address = '0x60903CDA8643805F9567a083C1734E139Fe7dAD2';
const web3RPC = 'wss://rinkeby.infura.io/ws/OlWCtLVFGaNOXOgpelpw';

const main = async () => {
  try {
    const web3 = new Web3(web3RPC);
    await web3.eth.net.isListening();
    const ctr = new web3.eth.Contract(abi, address);

    await initListener(api, ctr);
  } catch (err) {
    console.log({ err })
  }
};

main();
