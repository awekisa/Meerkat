require('@nomicfoundation/hardhat-toolbox');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

module.exports = {
	solidity: {
		version: '0.8.17',
		settings: {
			optimizer: {
				enabled: true,
			},
		},
	},
	allowUnlimitedContractSize: true,
	networks: {
		hardhat: {
			accounts: {
				count: 1000,
			},
		},
		sepolia: {
			accounts: [`${process.env.PRIVATE_KEY}`],
			url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
		},
	},
	etherscan: {
		apiKey: `${process.env.ETHERSCAN_API_KEY}`,
	},
	paths: {
		artifacts: '../fronted/artifacts',
	},
};
