import { Contract } from 'web3/types'
import DrmApi, { Partial, NotifyEvent, CaseInfo } from "./api";


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
function resolveEvent(api, event) {
    const id = event.args.id;
    switch (event.event) {
        case "OpenDispute": {
            const stage = event.args.stage;
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                stage: stage,
                event_type: "disp_open",
                user_by: event.args.opener
            };
            return api.createEvent(resEvent);
        }
        case "FinishDispute": {
            const stage = event.args.stage;
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                stage: stage,
                event_type: "disp_close"
            };
            return api.createEvent(resEvent);
        }
        case "FinishCase": {
            const resEvent: Partial<NotifyEvent> = {
                contract: id,
                event_type: "fin",
                user_by: event.args.opener
            };
            return api.createEvent(resEvent);
        }
    }
}

const main = async (api: DrmApi, ctr: Contract, fromBlock: number) => {
    ctr.events.allEvents({fromBlock}, (error, event) =>
        error ? console.log(error) : resolveEvent(api, event).catch(console.log))
};

export default main;