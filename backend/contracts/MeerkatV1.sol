// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";
contract MeerkatV1 is Initializable {
    struct Competition {
        uint id;
        address owner;
        string name;
    }

    struct Game {
        uint id;
        uint competitionId;
        string homeCompetitor;
        string awayCompetitor;
        uint startTime;
        uint8 homeScore;
        uint8 awayScore;
    }

    struct Prediction {
        uint id;
        uint gameId;
        uint8 homeScore;
        uint8 awayScore;
    }

    uint public lastCompetitionId;
    uint public lastGameId;
    mapping (address => mapping(uint => Competition)) public competitions;
    mapping (uint => Game[]) public games;

    function initialize() public initializer {
        lastCompetitionId = 1;
        lastGameId = 1;
    }

    // competitions
    function addCompetition(string memory _name) external returns (uint) {
        uint compId = lastCompetitionId++;
        Competition memory competition = Competition(compId, msg.sender, _name);
        competitions[msg.sender][compId] = competition;
        return (competition.id);
    }

    function getCompetition(uint _competitionId) external view returns (uint, address, string memory) {
        Competition memory competition = competitions[msg.sender][_competitionId];
        return (competition.id, competition.owner, competition.name);
    }

    function competitionExists(uint _competitionId) internal view returns (bool) {
        Competition memory competition = competitions[msg.sender][_competitionId];

        return competition.id != 0 
            && competition.owner != address(0) 
            && !compareStringsbyBytes(competition.name, '');
    }

    function updateCompetition(uint _competitionId, string memory _name) external {
        require(competitionExists(_competitionId), 'Competition owned by this user does not exist!');

        Competition storage competition = competitions[msg.sender][_competitionId];
        competition.name = _name;
    }

    function deleteCompetition(uint _competitionId) external {
        require(competitionExists(_competitionId), 'Competition owned by this user does not exist!');

        delete competitions[msg.sender][_competitionId];
    }

    // games
    function addGame(
        uint _competitionId, 
        string memory _homeCompetitor, 
        string memory _awayCompetitor, 
        uint _startTime
        ) external {
        require(competitionExists(_competitionId), 'Competition owned by this user does not exist!');

        Game memory newGame = Game(lastGameId++, _competitionId, _homeCompetitor, _awayCompetitor, _startTime, 0, 0);
        games[_competitionId].push(newGame);
    }

    function getGames(uint _competitionId) external view returns (Game[] memory) {
        Game[] memory gamesPerCompetition = games[_competitionId];
        return gamesPerCompetition;
    }

    function compareStringsbyBytes(string memory s1, string memory s2) internal pure returns(bool){
    return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
}
}