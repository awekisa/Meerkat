// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract MeerkatV1 is Initializable 
{
    struct CompetitionInfo {
       string name;
       address competitionAddress;
       address competitionOwner;
       uint timestamp;
    }

    CompetitionInfo[] public competitions;

    function initialize(string memory _name) public initializer{}

    function addCompetition(string memory _name, address _competitionAddress, address _competitionOwner) public {
        CompetitionInfo memory newCompetition = CompetitionInfo(_name, _competitionAddress, _competitionOwner, block.timestamp);
        competitions.push(newCompetition);
    }

    function getCompetitions() external view returns(CompetitionInfo[] memory) {
        console.log('from contract', competitions.length);

        CompetitionInfo[] memory fetchedCompetitions = new CompetitionInfo[](competitions.length);

        for (uint i = 0; i < competitions.length; i++) {
            fetchedCompetitions[i] = competitions[i];
        }

        return fetchedCompetitions;
    }
}