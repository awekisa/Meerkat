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

		const [owner, other] = await ethers.getSigners();
		return { proxy, owner, other };
	}

	// competitions
	it('should add competition', async function () {
		const { proxy, owner } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';

		await proxy.addCompetition(compName);
		const [_id, _owner, _name] = await proxy.getCompetition(1);

		expect(_name).to.equal(compName);
		expect(_id).to.equal(1);
		expect(_owner).to.equal(await owner.address);
	});

	it('should update competition user owns', async function () {
		const { proxy, owner } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';
		const newName = 'newName';

		await proxy.addCompetition(compName);

		await proxy.updateCompetition(1, newName);
		const [_id, _owner, _name] = await proxy.getCompetition(1);

		expect(_name).to.equal(newName);
		expect(_id).to.equal(1);
		expect(_owner).to.equal(await owner.address);
	});

	it('should not allow to update competition user does not own', async function () {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		const compName = 'comp1';
		const newName = 'newName';

		await proxy.addCompetition(compName);

		let errorMessageIsCorrect;
		// switch user and try to update
		try {
			await proxy.connect(other).updateCompetition(1, newName);
		} catch ({ err, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should delete competition user owns', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';

		await proxy.addCompetition(compName);

		await proxy.deleteCompetition(1);
		const [_id, _owner, _name] = await proxy.getCompetition(1);

		expect(_name).to.equal('');
		expect(_id).to.equal(0);
		expect(_owner).to.equal('0x0000000000000000000000000000000000000000');
	});

	it('should not allow to delete competition user does not own', async function () {
		const { proxy, other } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';

		await proxy.addCompetition(compName);

		let errorMessageIsCorrect;
		// switch user and try to delete
		try {
			await proxy.connect(other).deleteCompetition(1);
		} catch ({ err, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	// games
	it('should not allow to add game to non-existant competition!', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		let errorMessageIsCorrect;
		try {
			await proxy.addGame(111, 'Real', 'Betis', Date.now());
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should not allow to add game to non-owned competition', async function () {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		const compName = 'comp1';
		// add competition
		await proxy.connect(owner).addCompetition(compName);

		const date = Date.now();

		let errorMessageIsCorrect;
		// change signer
		try {
			await proxy.connect(other).addGame(1, 'Real', 'Betis', date);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should add game to your competition', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';
		await proxy.addCompetition(compName);

		const date = Date.now();

		await proxy.addGame(1, 'Real', 'Betis', date);
		await proxy.addGame(1, 'Arsenal', 'Newcastle', date);
		await proxy.addGame(1, 'Nice', 'PSG', date);

		const games = await proxy.getGames(1);

		const [
			firstId,
			firstCompetitionId,
			firstHomeCompetitor,
			firstAwayCompetitor,
			firstStartTime,
			firstHomeScore,
			firstAwayScore,
		] = games[0];
		const [
			secondId,
			secondCompetitionId,
			secondHomeCompetitor,
			secondAwayCompetitor,
			secondStartTime,
			secondHomeScore,
			secondAwayScore,
		] = games[1];
		const [
			thirdId,
			thirdCompetitionId,
			thirdHomeCompetitor,
			thirdAwayCompetitor,
			thirdStartTime,
			thirdHomeScore,
			thirdAwayScore,
		] = games[2];

		expect(games.length).to.equal(3);
		expect(firstId).to.equal(1);
		expect(firstCompetitionId).to.equal(1);
		expect(firstHomeCompetitor).to.equal('Real');
		expect(firstAwayCompetitor).to.equal('Betis');
		expect(firstStartTime).to.equal(date);
		expect(firstHomeScore).to.equal(0);
		expect(firstAwayScore).to.equal(0);

		expect(secondId).to.equal(2);
		expect(secondCompetitionId).to.equal(1);
		expect(secondHomeCompetitor).to.equal('Arsenal');
		expect(secondAwayCompetitor).to.equal('Newcastle');
		expect(secondStartTime).to.equal(date);
		expect(secondHomeScore).to.equal(0);
		expect(secondAwayScore).to.equal(0);

		expect(thirdId).to.equal(3);
		expect(thirdCompetitionId).to.equal(1);
		expect(thirdHomeCompetitor).to.equal('Nice');
		expect(thirdAwayCompetitor).to.equal('PSG');
		expect(thirdStartTime).to.equal(date);
		expect(thirdHomeScore).to.equal(0);
		expect(thirdAwayScore).to.equal(0);
	});
});
