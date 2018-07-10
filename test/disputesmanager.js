var DisputesManager = artifacts.require("./DisputesManager.sol");

contract('DisputesManager', function(accounts) {

  it("should test 2-staged case.", function() {
      let judgesContract = accounts[8];
      let owner = accounts[0];
      let caseObj = {
          id: 10,
          party: [accounts[2], accounts[3]],
          starts: [Math.floor(Date.now() / 1000) - 100,
                   Math.floor(Date.now() / 1000) + 100000],
          disputes: [Math.floor(Date.now() / 1000) - 10, // could be disputed
                     Math.floor(Date.now() / 1000) + 200000],
          owners: [accounts[2], accounts[3]],
          hash: '0000',
      };

    return DisputesManager.new(judgesContract).then(function(instance) {
      disputesManager = instance;
      return disputesManager.openCase(
          caseObj.id, caseObj.party, caseObj.starts, caseObj.disputes,
          caseObj.owners, caseObj.hash,
          { from: accounts[2] });
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'OpenCase',
                   "The case should be created");
      assert.equal(result.logs[0].args.id, caseObj.id,
                   "Case id should match");
      assert.lengthOf(result.logs[0].args.party, 2,
                   "Party should be exactly 2 elements long");
      assert.includeMembers(result.logs[0].args.party, caseObj.party,
                   "Party should contain 2 members");
      assert.equal(result.logs[0].args.stages, caseObj.starts.length,
                   "Stages amount should match");
      return disputesManager.openDispute(caseObj.id, 1, { from: accounts[5] });
    }).catch(function(error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true,
          `Expected "revert" on wrong dispute starter, got ${error} instead`);
      return disputesManager.openDispute(caseObj.id, 1, { from: accounts[2] });
    }).catch(function(error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true,
          `Expected "revert" on wrong dispute start time, got ${error} instead`);
      return disputesManager.openDispute(caseObj.id, 0, { from: accounts[2] });
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'OpenDispute',
                   "The dispute should be opened");
      assert.equal(result.logs[0].args.id, caseObj.id,
                   "Case id should match");
      assert.equal(result.logs[0].args.stage, 0,
                   "Stage should match");
      assert.equal(result.logs[0].args.opener, accounts[2],
                   "Dispute starter should match");
      assert.equal(result.logs[0].args.isOwner, true,
                   "Dispute starter is owner");
      return disputesManager.closeDispute(caseObj.id, 0, '0123', false,
          {from: accounts[6]})
    }).catch(function(error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true,
          `Expected "revert" on wrong dispute close caller, got ${error} instead`);
      return disputesManager.closeDispute(caseObj.id, 1, '0123', false,
          {from: judgesContract});
    }).catch(function(error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true,
          `Expected "revert" on wrong dispute stage close, got ${error} instead`);
      return disputesManager.finishCase(caseObj.id, {from: caseObj.party[0]});
    }).catch(function(error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true,
          `Expected "revert" on disputed case close, got ${error} instead`);
      return disputesManager.closeDispute(caseObj.id, 0, '3210', false,
          {from: judgesContract});
    }).then(function(result) {
      assert.lengthOf(result.logs, 1, "Only one event should be emitted");
      assert.equal(result.logs[0].event, 'FinishDispute',
                   "The dispute should be finished");
      assert.equal(result.logs[0].args.id, caseObj.id,
                   "Case id should match");
      assert.equal(result.logs[0].args.stage, 0,
                   "Stage should match");
      assert.equal(result.logs[0].args.ipfsHash, '3210',
                   "IPFS Hash of judges summary should match");
      return disputesManager.finishCase(caseObj.id, {from: caseObj.party[0]});
    }).then(function(result) {
      assert.lengthOf(result.logs, 0,
                   "The dispute should not be finished after one close");
      return disputesManager.finishCase(caseObj.id, {from: caseObj.party[1]});
    }).then(function(result) {
      assert.lengthOf(result.logs, 1,
                   "The dispute should be finished after 2 close actions");
      assert.equal(result.logs[0].event, 'FinishCase',
                   "The case should be finished");
      assert.equal(result.logs[0].args.id, caseObj.id,
                   "Case id should match");
      return disputesManager.finishCase(caseObj.id, {from: caseObj.party[1]});
    }).catch(function(error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true,
          `Expected "revert" on finished case close, got ${error} instead`);
      return disputesManager.transferOwnership(accounts[9], {from: owner});
    }).then(function(result) {
      assert.lengthOf(result.logs, 1,
                   "Only the owner should be changed");
      assert.equal(result.logs[0].event, 'OwnershipTransferred',
                   "The ownership should be transferred");
      assert.equal(result.logs[0].args.from, owner,
                   "Old owner should match");
      assert.equal(result.logs[0].args.to, accounts[9],
                   "New owner should match");
      return disputesManager.changeJudgeContract(accounts[7],
          {from: judgesContract});
    }).then(function(result) {
      assert.lengthOf(result.logs, 1,
                   "Only the judges contract should be changed");
      assert.equal(result.logs[0].event, 'JudgeContractChanged',
                   "The judges contract should be changed");
      assert.equal(result.logs[0].args.from, judgesContract,
                   "Old judges contract should match");
      assert.equal(result.logs[0].args.to, accounts[7],
                   "New judges contract should match");
    });
  });

});
