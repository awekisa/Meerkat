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
        bool isFinalized;
    }

    struct Prediction {
        uint gameId;
        uint8 homeScore;
        uint8 awayScore;
    }

    struct UserScore {
        address user;
        uint8 points;
        uint8 correctPredictions;
        uint8 correctOutcomes;
        uint8 totalNumberOfPredictions;
    }

    string public name;
    address public owner;
    mapping(uint => Game) private games;
    uint[] private gameIds;
    uint private lastGameId;
    mapping(address => mapping(uint => Prediction)) private predictions;
    mapping(address => uint[]) private predictionGameIds;
    mapping(address => bool) private activeUsers;
    address[] private userIds;

    function initialize(string memory _name) public initializer {
        name = _name;
        owner = msg.sender;
    }

    // games
    function addGame( 
        string memory _homeCompetitor, 
        string memory _awayCompetitor, 
        uint _startTime
        ) external onlyOwner {
            uint gameId = ++lastGameId;
        games[gameId] = Game(gameId, _homeCompetitor, _awayCompetitor, _startTime, 0, 0, false);
        gameIds.push(gameId);
    }

    function compareStringsbyBytes(string memory s1, string memory s2) internal pure returns(bool) {
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }

    function getGames() external view returns (Game[] memory) {
        Game[] memory fetchedGames = new Game[](gameIds.length);
        for (uint i = 0; i < gameIds.length; i++) {
            fetchedGames[i] = games[i+1];
        }

        return fetchedGames;
    }

    function getGame(uint _gameId) external view returns(Game memory) {
        return games[_gameId];
    }

    function updateGame(uint _gameId, string memory _homeCompetitor, string memory _awayCompetitor, uint _startTime, uint8 _homeScore, uint8 _awayScore, bool _isFinalized)
        external onlyOwner gameExists(_gameId) {
        Game storage game = games[_gameId];

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
        if (game.isFinalized != _isFinalized) {
            game.isFinalized = _isFinalized;
        }
    }

    function deleteGame(uint _gameId) external onlyOwner gameExists(_gameId) {
        delete games[_gameId];
        delete gameIds[_gameId-1];
    }

    // predictions
    function addOrUpdatePrediction(uint _gameId, uint8 _homeScore, uint8 _awayScore) external gameExists(_gameId) {
        Prediction storage prediction = predictions[msg.sender][_gameId];
        
        uint currentTime = block.timestamp;
        require(currentTime <= games[_gameId].startTime, 'Game has already started!');
        
        if (!activeUsers[msg.sender]) {
            activeUsers[msg.sender] = true;
            userIds.push(msg.sender);
        }

        if (prediction.gameId == 0) {
            predictions[msg.sender][_gameId] = Prediction(_gameId, _homeScore, _awayScore);
            predictionGameIds[msg.sender].push(_gameId);
        } else {
            if (prediction.homeScore != _homeScore) {
                prediction.homeScore = _homeScore;
            }
            if (prediction.awayScore != _awayScore) {
                prediction.awayScore = _awayScore;
            }
        }
    }

    function getPredictions(address _user) external view returns (Prediction[] memory) {
        Prediction[] memory results = new Prediction[](predictionGameIds[_user].length);
        for (uint i = 0; i < predictionGameIds[_user].length; i++) {
            Prediction storage prediction = predictions[_user][predictionGameIds[_user][i]];

            if (prediction.gameId != 0) {
                results[i] = prediction;
            }
        }

        return results;
    }

    function getPrediction(uint _gameId) external view gameExists(_gameId) returns (Prediction memory) {
        return predictions[msg.sender][_gameId];
    }

    function getPoints() external view returns (UserScore[] memory) {
        UserScore[] memory userScores = new UserScore[] (userIds.length);

        for(uint i = 0; i < userIds.length; i++) {
            address user = userIds[i];
            
            UserScore memory score = getScorePerUser(user);
            userScores[i] = score;
        }

        return userScores;
    }

    function getScorePerUser(address _user) internal view returns (UserScore memory) {
        UserScore memory score = UserScore(_user, 0, 0, 0, 0);
        for (uint i = 0; i < gameIds.length; i++) {
            uint gameId = gameIds[i];
            Game memory game = games[gameId];

            if (game.isFinalized) {
                Prediction memory prediction = predictions[_user][gameId];

                if (prediction.gameId != 0) {
                    if (isScoreCorrect(game.homeScore, game.awayScore, prediction.homeScore, prediction.awayScore)) {
                        score.points += 3;
                        score.correctPredictions++;
                        score.correctOutcomes++;
                    } else if (isOutcomeCorrect(game.homeScore, game.awayScore, prediction.homeScore, prediction.awayScore)) {
                        score.points++;
                        score.correctOutcomes++;
                    }

                    score.totalNumberOfPredictions++;
                }
            }
        }

        return score;
    }

    function isScoreCorrect(uint8 _gameHomeScore, uint8 _gameAwayScore, uint8 _predictionHomeScore, uint8 _predictionAwayScore) internal pure returns (bool) {
        return _gameHomeScore == _predictionHomeScore && _gameAwayScore == _predictionAwayScore;
    }

    function isOutcomeCorrect(uint8 _gameHomeScore, uint8 _gameAwayScore, uint8 _preditionHomeScore, uint8 _predictionAwayScore) internal pure returns (bool) {
        return homeWinPredicted(_gameHomeScore, _gameAwayScore, _preditionHomeScore, _predictionAwayScore)
            || awayWinPredicted(_gameHomeScore, _gameAwayScore, _preditionHomeScore, _predictionAwayScore)
            || drawPredicted(_gameHomeScore, _gameAwayScore, _preditionHomeScore, _predictionAwayScore);
    }

    function homeWinPredicted(uint8 _gameHomeScore, uint8 _gameAwayScore, uint8 _predictionHomeScore, uint8 _predictionAwayScore) internal pure returns (bool) {
        return _gameHomeScore > _gameAwayScore && _predictionHomeScore > _predictionAwayScore;
    }

    function awayWinPredicted(uint8 _gameHomeScore, uint8 _gameAwayScore, uint8 _predictionHomeScore, uint8 _predictionAwayScore) internal pure returns (bool) {
        return _gameHomeScore < _gameAwayScore && _predictionHomeScore < _predictionAwayScore;
    }

    function drawPredicted(uint8 _gameHomeScore, uint8 _gameAwayScore, uint8 _predictionHomeScore, uint8 _predictionAwayScore) internal pure returns (bool) {
        return _gameHomeScore == _gameAwayScore 
            && _predictionHomeScore == _predictionAwayScore
            && _gameHomeScore == _gameAwayScore;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, 'Unauthorized request!');
        _;
    }

    modifier gameExists(uint _gameId) {
        Game storage game = games[_gameId];
        require(game.id != 0, 'Game does not exist!');
        _;
    }
}