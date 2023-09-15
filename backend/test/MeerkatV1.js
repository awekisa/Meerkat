const { upgrades } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('MeerkatV1', function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployContractAndSetVariables() {
		const MeerkatV1 = await ethers.getContractFactory('MeerkatV1');
		const proxy = await upgrades.deployProxy(MeerkatV1, []);
		await proxy.waitForDeployment();

		const [owner] = await ethers.getSigners();
		console.log('Signer 1 address: ', owner.address);
		return { proxy, owner };
	}

	it('should deploy and set the owner correctly', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);

		const lastCompetitionId = await proxy.lastCompetitionId();
		expect(lastCompetitionId).to.equal(0);
	});

	it('should add competition', async function () {
		const { proxy, owner } = await loadFixture(deployContractAndSetVariables);

		const compName = 'comp1';

		await proxy.addCompetition(compName);
		const [_id, _owner, _name] = await proxy.getCompetition(0);
		expect(_name).to.equal(compName);
		expect(_id).to.equal(0);
		expect(_owner).to.equal(await owner.address);
	});
});
