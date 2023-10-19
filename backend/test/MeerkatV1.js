const { upgrades } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('MeerkatV1', function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployContractAndSetVariables() {
		const MeerkatV1 = await ethers.getContractFactory('MeerkatV1');
		const proxy = await upgrades.deployProxy(MeerkatV1, ['Meerkat']);
		await proxy.waitForDeployment();

		const [owner, other, other2] = await ethers.getSigners();
		return { proxy, owner, other, other2 };
	}

	// games
	it('should add competition', async function () {
		const { proxy, owner } = await loadFixture(deployContractAndSetVariables);

		const MeerkatCompetitionV1 = await ethers.getContractFactory(
			'MeerkatCompetitionV1'
		);
		const competitionProxy1 = await upgrades.deployProxy(MeerkatCompetitionV1, [
			'TestCompetition',
		]);
		await competitionProxy1.waitForDeployment();

		await proxy.addCompetition(
			await competitionProxy1.name(),
			await competitionProxy1.getAddress(),
			await competitionProxy1.owner()
		);

		const competitions = await proxy.getCompetitions();

		const [name, competitionAddress, competitionOwner, timestamp] =
			competitions[0];

		expect(competitions.length).to.equal(1);
		expect(name).to.equal('TestCompetition');
		expect(competitionAddress).to.equal(await competitionProxy1.getAddress());
		expect(competitionOwner).to.equal(owner.address);
	});
});
