// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract MeerkatCompetitionV1 is Initializable {
    struct Game {
        uint id;
        string homeCompetitor;
        string awayCompetitor;
        uint startTime;
        uint8 homeScore;
        uint8 awayScore;
    }

    struct Prediction {
        uint id;
        uint competitionId;
        uint gameId;
        uint8 homeScore;
        uint8 awayScore;
    }

    string public name;
    address public owner;
    mapping(uint => Game) private games;
    uint numberOfGames;
    mapping(address => mapping(uint => Prediction)) private predictions;

    function initialize(string memory _name) public initializer {
        name = _name;
        owner = msg.sender;
        numberOfGames = 0;
    }

    function addGame( 
        string memory _homeCompetitor, 
        string memory _awayCompetitor, 
        uint _startTime
        ) external onlyOwner {
        games[numberOfGames] = Game(++numberOfGames, _homeCompetitor, _awayCompetitor, _startTime, 0, 0);
    }

    function compareStringsbyBytes(string memory s1, string memory s2) internal pure returns(bool) {
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }

    function getGames() external view returns (Game[] memory) {
        Game[] memory fetchedGames = new Game[](numberOfGames);
        for (uint i = 0; i < numberOfGames; i++) {
            Game memory game = games[i+1];
            console.log('Game id ', game.id);
            if (game.id == 0) {
                continue;
            }

            fetchedGames[i] = game;
        }

        console.log('fetched Games length', fetchedGames.length);
        return fetchedGames;
    }

    function getGame(uint _gameId) external view returns(Game memory) {
        return games[_gameId];
    }

    function updateGame(uint _gameId, string memory _homeCompetitor, string memory _awayCompetitor, uint _startTime, uint8 _homeScore, uint8 _awayScore) external onlyOwner {
        Game storage game = games[_gameId];
        require(game.id != 0, 'Game does not exist!');

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

    function deleteGame(uint _gameId) external onlyOwner {
        Game storage game = games[_gameId];
        require(game.id != 0, 'Game does not exist!');

        delete games[_gameId];
        numberOfGames--;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, 'Unauthorized request!');
        _;
    }
}