"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
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
    var id = event.args.id;
    switch (event.event) {
        case "OpenDispute": {
            var stage = event.args.stage;
            var resEvent = {
                contract: id,
                stage: stage,
                event_type: "disp_open",
                user_by: event.args.opener
            };
            return api.createEvent(resEvent);
        }
        case "FinishDispute": {
            var stage = event.args.stage;
            var resEvent = {
                contract: id,
                stage: stage,
                event_type: "disp_close"
            };
            return api.createEvent(resEvent);
        }
        case "FinishCase": {
            var resEvent = {
                contract: id,
                event_type: "fin",
                user_by: event.args.opener
            };
            return api.createEvent(resEvent);
        }
    }
}
var main = function (api, ctr, fromBlock) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ctr.events.allEvents({ fromBlock: fromBlock }, function (error, event) {
            return error ? console.log(error) : resolveEvent(api, event)["catch"](console.log);
        });
        return [2 /*return*/];
    });
}); };
exports["default"] = main;
