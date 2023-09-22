const { ethers, upgrades } = require('hardhat');

async function main() {
	const MeerkatCompetitionV1 = await ethers.getContractFactory(
		'MeerkatCompetitionV1'
	);
	const proxy = await upgrades.deployProxy(MeerkatCompetitionV1, [
		'First Competition',
	]);
	await proxy.waitForDeployment();

	const implementationAddress = await upgrades.erc1967.getImplementationAddress(
		await proxy.getAddress()
	);

	console.log('Proxy contract address: ' + (await proxy.getAddress()));

	console.log('Implementation contract address: ' + implementationAddress);
}

main();
