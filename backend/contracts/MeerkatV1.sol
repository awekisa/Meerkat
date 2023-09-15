// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";
contract MeerkatV1 is Initializable {
    struct Competition {
        uint id;
        address owner;
        string name;
    }

    enum Sport {
        Soccer
    }

    struct Game {
        uint id;
        string home;
        string away;
        uint startTime;
        uint8 homeScore;
        uint8 awayScore;
        bool isStarted;
        bool isFinished;
        bool isCancelled;
    }

    struct Prediction {
        uint id;
        uint8 homeScore;
        uint8 awayScore;
    }

    uint public lastCompetitionId;
    mapping (address => mapping(uint => Competition)) public competitions;
    // mapping (address => mapping(uint => Game[])) public games;

    function initialize() public initializer {
        lastCompetitionId = 0;
    }

    function addCompetition(string memory _name) public returns (uint) {
        uint compId = lastCompetitionId++;
        Competition memory competition = Competition(compId, msg.sender, _name);
        competitions[msg.sender][compId] = competition;
        return (competition.id);
    }

    function getCompetition(uint compId) public view returns (uint, address, string memory) {
        Competition memory competition = competitions[msg.sender][compId];
        return (competition.id, competition.owner, competition.name);
    }
}