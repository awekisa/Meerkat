const { ethers, upgrades } = require('hardhat');

async function main() {
	const MeerkatCompetitionV1 = await ethers.getContractFactory(
		'MeerkatCompetitionV1'
	);
	const proxy = await upgrades.deployProxy(MeerkatCompetitionV1);
	await proxy.deployed();

	const implementationAddress = await upgrades.erc1967.getImplementationAddress(
		proxy.address
	);

	console.log('Proxy contract address: ' + proxy.address);

	console.log('Implementation contract address: ' + implementationAddress);
}

main();
