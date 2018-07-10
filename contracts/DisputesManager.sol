pragma solidity ^0.4.24;

contract DisputesManager {
  address public owner;
  address public judgeContract;

  struct Stage {
    address owner;
    address disputeStarter;
    uint32 start;
    uint32 disputeStartAllowed;
    uint32 disputeStart;
    uint8 disputed;
    string ipfsDisputeResultHash;
  }

  struct Case {
    uint id;
    string ipfsContractHash;
    address[] participants;
    bool[] finished;
  }

  mapping(uint => Case) public cases;
  mapping(uint => Stage[]) caseStages;

  event OpenCase(uint id, address[] party, uint stages);
  event OpenDispute(uint id, uint stage, address opener, bool isOwner);
  event FinishDispute(uint id, uint stage, string ipfsHash);
  event FinishCase(uint id);

  modifier onlyParty(uint id) {
    bool hasInParty = false;
    for (uint i = 0; i < cases[id].participants.length; i++) {
      if (cases[id].participants[i] == msg.sender) {
        hasInParty = true;
        break;
      }
    }
    require(hasInParty);
    _;
  }

  modifier caseNotFinished(uint id) {
    bool all = true;
    for (uint i = 0; i < cases[id].participants.length; i++) {
      if (!cases[id].finished[i]) {
        all = false;
        break;
      }
    }
    require(!all);
    _;
  }

  modifier canOpenDispute(uint id, uint stage) {
    require(caseStages[id][stage].disputeStartAllowed < now);
    _;
  }

  modifier isStageDisputed(uint id, uint stage) {
    require(caseStages[id][stage].disputed == 1);
    _;
  }

  modifier isNotDisputed(uint id) {
    uint st = findDisputedStage(id);
    require(st == caseStages[id].length);
    _;
  }

  modifier onlyJudges() {
    require(msg.sender == judgeContract);
    _;
  }

  function openCase(uint id, address[] party, uint32[] stages_starts,
                    uint32[] stages_dispute_starts, address[] stages_owners,
                    string ipfsHash) public {
    Stage[] storage stages = caseStages[id];
    stages.length = stages_starts.length;
    bool[] memory finished = new bool[](stages_starts.length);
    for (uint i = 0; i < stages.length; i++) {
      stages[i].owner = stages_owners[i];
      stages[i].start = stages_starts[i];
      stages[i].disputeStartAllowed = stages_dispute_starts[i];
      stages[i].disputeStart = 0;
      stages[i].disputeStarter = address(0);
      stages[i].disputed = 0;
      stages[i].ipfsDisputeResultHash = '';
      finished[i] = false;
    }
    Case memory currCase = Case(id, ipfsHash, party, finished);
    cases[id] = currCase;
    caseStages[id] = stages;
    emit OpenCase(id, party, stages.length);
  }

  function findDisputedStage(uint id) private view returns (uint) {
    Stage[] storage stages = caseStages[id];
    uint32 i = 0;
    for (; i < stages.length; i++) {
      if (stages[i].disputed == 1) {
        break;
      }
    }
    return i;
  }

  function openDispute(uint id, uint stage) public onlyParty(id)
                                            caseNotFinished(id)
                                            isNotDisputed(id)
                                            canOpenDispute(id, stage) {
    caseStages[id][stage].disputeStarter = msg.sender;
    caseStages[id][stage].disputeStart = uint32(now);
    caseStages[id][stage].disputed = 1;
    address stageOwner = caseStages[id][stage].owner;
    emit OpenDispute(id, stage, msg.sender, msg.sender == stageOwner);
  }

  /**
   * Close dispute opened on specified stage by judges decision.
   * Finish the case if the decision closes the case fully, not only stage.
   * events: FinishDispute, FinishCase
   */
  function closeDispute(uint id, uint stage, string resultIpfsHash,
                        bool forceFinish) public onlyJudges
                                          caseNotFinished(id)
                                          isStageDisputed(id, stage) {
    caseStages[id][stage].ipfsDisputeResultHash = resultIpfsHash;

    emit FinishDispute(id, stage, resultIpfsHash);

    if (forceFinish) {
      Case storage currCase = cases[id];
      for (uint i = 0; i < currCase.participants.length; i++) {
        currCase.finished[i] = true;
      }
      emit FinishCase(id);
    }
  }

  function finishCase(uint id) public onlyParty(id)
                               caseNotFinished(id)
                               isNotDisputed(id) {
    for (uint i = 0; i < cases[id].participants.length; i++) {
      if (cases[id].participants[i] == msg.sender) {
        cases[id].finished[i] = true;
        break;
      }
    }

    // If all parties has finished (multisig), then the case is closed
    bool all = true;
    for (i = 0; i < cases[id].participants.length; i++) {
      if (!cases[id].finished[i]) {
        all = false;
        break;
      }
    }
    if (all) {
      emit FinishCase(id);
    }
  }

  /**
   * Ownership and Judge contract connection part:
   * Transfer ownership
   * Change judge contract address
   * modifiers for owner and judges
   */
  event OwnershipTransferred(address from, address to);
  event JudgeContractChanged(address from, address to);

  constructor(address _judgeContract) public {
    judgeContract = _judgeContract;
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier ownerOrJudges() {
    require(msg.sender == judgeContract || msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  function changeJudgeContract(address newJudgeContract) public ownerOrJudges {
    require(newJudgeContract != address(0));
    emit JudgeContractChanged(judgeContract, newJudgeContract);
    judgeContract = newJudgeContract;
  }
}
