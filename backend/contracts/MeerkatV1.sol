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

    function getCompetition(uint _competitionId) external view returns (Competition memory) {
        return competitions[msg.sender][_competitionId];
    }

    function competitionOwner(uint _competitionId) internal view returns (bool) {
        Competition memory competition = competitions[msg.sender][_competitionId];

        return competition.id != 0 
            && competition.owner != address(0) 
            && !compareStringsbyBytes(competition.name, '');
    }

    function updateCompetition(uint _competitionId, string memory _name) external {
        require(competitionOwner(_competitionId), 'Competition owned by this user does not exist!');

        Competition storage competition = competitions[msg.sender][_competitionId];
        competition.name = _name;
    }

    function deleteCompetition(uint _competitionId) external {
        require(competitionOwner(_competitionId), 'Competition owned by this user does not exist!');

        delete competitions[msg.sender][_competitionId];
    }

    // games
    function addGame(
        uint _competitionId, 
        string memory _homeCompetitor, 
        string memory _awayCompetitor, 
        uint _startTime
        ) external {
        require(competitionOwner(_competitionId), 'Competition owned by this user does not exist!');

        Game memory newGame = Game(lastGameId++, _competitionId, _homeCompetitor, _awayCompetitor, _startTime, 0, 0);
        games[_competitionId].push(newGame);
    }

    function getGames(uint _competitionId) external view returns (Game[] memory) {
        Game[] memory gamesPerCompetition = games[_competitionId];
        return gamesPerCompetition;
    }

    function updateGame(uint _competitionId, uint _gameId, string memory _homeCompetitor, string memory _awayCompetitor, uint _startTime, uint8 _homeScore, uint8 _awayScore) external {
        require(competitionOwner(_competitionId), 'Competition owned by this user does not exist!');
        
        (bool exists, uint index) = gameExistsAt(_competitionId, _gameId);
        require(exists, 'Game does not exist!');

        Game storage game = games[_competitionId][index];
        if (!compareStringsbyBytes(game.homeCompetitor, _homeCompetitor)) {
            game.homeCompetitor = _homeCompetitor;
        }
        if (!compareStringsbyBytes(game.awayCompetitor, _awayCompetitor)) {
            game.awayCompetitor = _awayCompetitor;
        }
        if (game.startTime != _startTime) {
            game.startTime = _startTime;
        }
        if (game.homeScore != _homeScore) {
            game.homeScore = _homeScore;
        }
        if (game.awayScore != _awayScore) {
            game.awayScore = _awayScore;
        }
    }

    function deleteGame(uint _competitionId, uint _gameId) external {
        require(competitionOwner(_competitionId), 'Competition owned by this user does not exist!');
        
        (bool exists, uint index) = gameExistsAt(_competitionId, _gameId);
        require(exists, 'Game does not exist!');

        console.log(exists);
        delete games[_competitionId][index];

    }

    function gameExistsAt(uint _competitionId, uint _gameId) internal view returns(bool, uint) {
        Game[] storage competitionGames = games[_competitionId];
        for (uint i = 0; i < competitionGames.length; i++) {
            Game storage game = competitionGames[i];
            if (game.id == _gameId) {
                return (true, i);
            }
        }

        return (false, 0);
    }

    function compareStringsbyBytes(string memory s1, string memory s2) internal pure returns(bool){
    return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));

    
}
}