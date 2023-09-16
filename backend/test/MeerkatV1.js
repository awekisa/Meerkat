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

	it('should update own competition', async function () {
		const { proxy, owner } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';
		const newName = 'newName';

		await proxy.addCompetition(compName);

		await proxy.updateCompetition(1, newName);
		const competition = await proxy.getCompetition(1);

		expect(competition.name).to.equal(newName);
		expect(competition.id).to.equal(1);
		expect(competition.owner).to.equal(await owner.address);
	});

	it('should throw when updating non-owned competition', async function () {
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

	it('should delete own competition', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';

		await proxy.addCompetition(compName);

		await proxy.deleteCompetition(1);
		const competition = await proxy.getCompetition(1);

		expect(competition.name).to.equal('');
		expect(competition.id).to.equal(0);
		expect(competition.owner).to.equal(
			'0x0000000000000000000000000000000000000000'
		);
	});

	it('should throw when deleteing non-owned competition', async function () {
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
	it('should add game to own competition', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';
		await proxy.addCompetition(compName);

		const startTime = Date.now();

		await proxy.addGame(1, 'Real', 'Betis', startTime);
		await proxy.addGame(1, 'Arsenal', 'Newcastle', startTime);
		await proxy.addGame(1, 'Nice', 'PSG', startTime);

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
		expect(firstStartTime).to.equal(startTime);
		expect(firstHomeScore).to.equal(0);
		expect(firstAwayScore).to.equal(0);

		expect(secondId).to.equal(2);
		expect(secondCompetitionId).to.equal(1);
		expect(secondHomeCompetitor).to.equal('Arsenal');
		expect(secondAwayCompetitor).to.equal('Newcastle');
		expect(secondStartTime).to.equal(startTime);
		expect(secondHomeScore).to.equal(0);
		expect(secondAwayScore).to.equal(0);

		expect(thirdId).to.equal(3);
		expect(thirdCompetitionId).to.equal(1);
		expect(thirdHomeCompetitor).to.equal('Nice');
		expect(thirdAwayCompetitor).to.equal('PSG');
		expect(thirdStartTime).to.equal(startTime);
		expect(thirdHomeScore).to.equal(0);
		expect(thirdAwayScore).to.equal(0);
	});

	it('should throw when adding game to non-existant competition', async () => {
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

	it('should throw when adding game to non-owned competition', async function () {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		const compName = 'comp1';
		// add competition
		await proxy.connect(owner).addCompetition(compName);

		let errorMessageIsCorrect;
		// change signer
		try {
			await proxy.connect(other).addGame(1, 'Real', 'Betis', Date.now());
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should update game in own competition', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';
		await proxy.addCompetition(compName);
		const startTime = Date.now();
		await proxy.addGame(1, 'Real', 'Betis', startTime);

		const updatedStartTime = startTime + 1000;
		const tx = await proxy.updateGame(
			1,
			1,
			'Liverpool',
			'Aston Villa',
			updatedStartTime,
			3,
			3
		);
		await tx.wait();
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

		expect(games.length).to.equal(1);
		expect(firstId).to.equal(1);
		expect(firstCompetitionId).to.equal(1);
		expect(firstHomeCompetitor).to.equal('Liverpool');
		expect(firstAwayCompetitor).to.equal('Aston Villa');
		expect(firstStartTime).to.equal(updatedStartTime);
		expect(firstHomeScore).to.equal(3);
		expect(firstAwayScore).to.equal(3);
	});

	it('should throw when updating game in non-owned competition', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.connect(owner).addCompetition('Some Competition');
			await proxy.addGame(1, 'Real', 'Betis', Date.now());
			await proxy
				.connect(other)
				.updateGame(1, 111, 'Real2', 'Betis2', Date.now(), 1, 1);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should throw when updating game that does not exist', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.addCompetition('Some Competition');
			await proxy.addGame(1, 'Real', 'Betis', Date.now());
			await proxy.updateGame(1, 111, 'Real', 'Betis', Date.now(), 2, 3);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes('Game does not exist!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should delete game in own competition', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const compName = 'comp1';
		await proxy.addCompetition(compName);
		const startTime = Date.now();
		await proxy.addGame(1, 'Real', 'Betis', startTime);
		await proxy.addGame(1, 'Arsenal', 'Wolves', startTime);
		await proxy.addGame(1, 'Man City', 'PSG', startTime);

		await proxy.deleteGame(1, 2);

		const games = await proxy.getGames(1);

		const [
			deletedId,
			deletedCompetitionId,
			deletedHomeCompetitor,
			deletedAwayCompetitor,
			deletedStartTime,
			deletedHomeScore,
			deletedAwayScore,
		] = games[1];

		expect(games.length).to.equal(3);
		expect(deletedId).to.equal(0);
		expect(deletedCompetitionId).to.equal(0);
		expect(deletedHomeCompetitor).to.equal('');
		expect(deletedAwayCompetitor).to.equal('');
		expect(deletedStartTime).to.equal(0);
		expect(deletedHomeScore).to.equal(0);
		expect(deletedAwayScore).to.equal(0);
	});

	it('should throw when deleting game in non-owned competition', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.connect(owner).addCompetition('Some Competition');
			await proxy.addGame(1, 'Real', 'Betis', Date.now());
			await proxy.connect(other).deleteGame(1, 111);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes(
				'Competition owned by this user does not exist!'
			);
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should throw when deleting game that does not exist', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.addCompetition('Some Competition');
			await proxy.addGame(1, 'Real', 'Betis', Date.now());
			await proxy.deleteGame(1, 111);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes('Game does not exist!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});
});
