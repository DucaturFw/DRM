import { Contract } from 'web3/types'

const main = async (api: API, ctr: Contract, fromBlock: number) => {
    ctr.events.allEvents({fromBlock}, (error, event) =>
        error ? console.log(error) : insert(event).catch(console.log))
};

export default main;