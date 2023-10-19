const { ethers, upgrades } = require('hardhat');

async function main() {
	const MeerkatV1 = await ethers.getContractFactory('MeerkatV1');
	const proxy = await upgrades.deployProxy(MeerkatV1, ['Meerkat']);
	await proxy.waitForDeployment();

	const implementationAddress = await upgrades.erc1967.getImplementationAddress(
		await proxy.getAddress()
	);

	console.log('Proxy Meerkat contract address: ' + (await proxy.getAddress()));

	console.log('Implementation contract address: ' + implementationAddress);
}

main();
