import {Contract, EventLog} from 'web3/types'
import DrmApi, { Partial, NotifyEvent } from "./api";

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

/* List of available events:
 *
 * event OpenCase(uint id, address[] party, uint stages);
 * event OpenDispute(uint id, uint stage, address opener, bool isOwner);
 * event FinishDispute(uint id, uint stage, string ipfsHash);
 * event FinishCase(uint id);
 * event OwnershipTransferred(address from, address to);
 * event JudgeContractChanged(address from, address to);
 *
 */
function resolveEvent(api: DrmApi, event: EventLog) {
    const id = event.returnValues.id;
    console.log(id, event.event);
    switch (event.event) {
        case "OpenCase": {
            console.log(id, 'party: ', event.returnValues.party, 'stages: ', event.returnValues.stages);
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                stage_num: 0,
                event_type: "open",
                address_by: event.returnValues.opener
            };
            return api.createEvent(resEvent);
        }
        case "OpenDispute": {
            const stage = event.returnValues.stage;
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                stage_num: stage,
                event_type: "disp_open",
                address_by: event.returnValues.opener
            };
            return api.createEvent(resEvent);
        }
        case "FinishDispute": {
            const stage = event.returnValues.stage;
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                stage_num: stage,
                event_type: "disp_close"
            };
            return api.createEvent(resEvent);
        }
        case "FinishCase": {
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                event_type: "fin",
                stage_num: 0,
                finished: true,
                address_by: event.returnValues.opener
            };
            return api.createEvent(resEvent);
        }
        default: {
            return Promise.resolve(0);
        }
    }
}

const updateBlock = async (fileName: string, blockNum: number) => {
  return fs.writeFileAsync(fileName, blockNum, 'utf8');
};

const readBlock = async (fileName: string) : Promise<number> => {
    try {
        return Promise.resolve(parseInt(await fs.readFileAsync(fileName, 'utf8'), 10));
    } catch (err) {
        console.error('Error reading file', err);
        return Promise.resolve(0);
    }
};

const main = async (api: DrmApi, ctr: Contract, fileName: string) => {

    ctr.events.allEvents({ fromBlock: await readBlock(fileName) }, async (error, event) => {
        if (error) console.log(error, event);
        else {
            try {
                const res = await resolveEvent(api, event);
                await updateBlock(fileName, event.blockNumber);
                console.log(res);
            } catch (err) {
                console.error(err.response.data);
            }
        }
    })
};

export default main;