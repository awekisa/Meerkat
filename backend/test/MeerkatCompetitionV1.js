const { upgrades } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('MeerkatCompetitionV1', function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployContractAndSetVariables() {
		const MeerkatCompetitionV1 = await ethers.getContractFactory(
			'MeerkatCompetitionV1'
		);
		const proxy = await upgrades.deployProxy(MeerkatCompetitionV1, [
			'TestComp',
		]);
		await proxy.waitForDeployment();

		const [owner, other] = await ethers.getSigners();
		return { proxy, owner, other };
	}

	it('should add game as owner', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);

		const startTime = Date.now();

		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Arsenal', 'Newcastle', startTime);
		await proxy.addGame('Nice', 'PSG', startTime);

		const games = await proxy.getGames();

		const [
			firstId,
			firstHomeCompetitor,
			firstAwayCompetitor,
			firstStartTime,
			firstHomeScore,
			firstAwayScore,
		] = games[0];
		const [
			secondId,
			secondHomeCompetitor,
			secondAwayCompetitor,
			secondStartTime,
			secondHomeScore,
			secondAwayScore,
		] = games[1];
		const [
			thirdId,
			thirdHomeCompetitor,
			thirdAwayCompetitor,
			thirdStartTime,
			thirdHomeScore,
			thirdAwayScore,
		] = games[2];

		expect(games.length).to.equal(3);
		expect(firstId).to.equal(1);
		expect(firstHomeCompetitor).to.equal('Real');
		expect(firstAwayCompetitor).to.equal('Betis');
		expect(firstStartTime).to.equal(startTime);
		expect(firstHomeScore).to.equal(0);
		expect(firstAwayScore).to.equal(0);

		expect(secondId).to.equal(2);
		expect(secondHomeCompetitor).to.equal('Arsenal');
		expect(secondAwayCompetitor).to.equal('Newcastle');
		expect(secondStartTime).to.equal(startTime);
		expect(secondHomeScore).to.equal(0);
		expect(secondAwayScore).to.equal(0);

		expect(thirdId).to.equal(3);
		expect(thirdHomeCompetitor).to.equal('Nice');
		expect(thirdAwayCompetitor).to.equal('PSG');
		expect(thirdStartTime).to.equal(startTime);
		expect(thirdHomeScore).to.equal(0);
		expect(thirdAwayScore).to.equal(0);
	});

	it('should throw when add game as non owner', async function () {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);

		let errorMessageIsCorrect;
		// change signer
		try {
			await proxy.connect(other).addGame('Real', 'Betis', Date.now());
		} catch ({ ex, message }) {
			console.log(message);
			errorMessageIsCorrect = message.includes('Unauthorized request!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should update game as owner', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const startTime = Date.now();
		await proxy.addGame('Real', 'Betis', startTime);

		const updatedStartTime = startTime + 1000;
		const tx = await proxy.updateGame(
			1,
			'Liverpool',
			'Aston Villa',
			updatedStartTime,
			3,
			3
		);
		await tx.wait();
		const game = await proxy.getGame(1);

		const [
			firstId,
			firstHomeCompetitor,
			firstAwayCompetitor,
			firstStartTime,
			firstHomeScore,
			firstAwayScore,
		] = game;

		expect(firstId).to.equal(1);
		expect(firstHomeCompetitor).to.equal('Liverpool');
		expect(firstAwayCompetitor).to.equal('Aston Villa');
		expect(firstStartTime).to.equal(updatedStartTime);
		expect(firstHomeScore).to.equal(3);
		expect(firstAwayScore).to.equal(3);
	});

	it('should throw when updating game as non owner', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.addGame('Real', 'Betis', Date.now());
			await proxy
				.connect(other)
				.updateGame(1, 'Real2', 'Betis2', Date.now(), 1, 1);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes('Unauthorized request!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should throw when updating game that does not exist', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.addGame('Real', 'Betis', Date.now());
			await proxy.updateGame(111, 'Real', 'Betis', Date.now(), 2, 3);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes('Game does not exist!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should delete game as owner', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const startTime = Date.now();
		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Arsenal', 'Wolves', startTime);
		await proxy.addGame('Man City', 'PSG', startTime);

		const tx = await proxy.deleteGame(2);
		await tx.wait();

		const games = await proxy.getGames();

		expect(games.length).to.equal(2);
	});

	it('should throw when deleting game as non owner', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.addGame('Real', 'Betis', Date.now());
			await proxy.connect(other).deleteGame(1);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes('Unauthorized request!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should throw when deleting game that does not exist', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);
		let errorMessageIsCorrect;
		try {
			await proxy.addGame('Real', 'Betis', Date.now());
			await proxy.deleteGame(111);
		} catch ({ ex, message }) {
			errorMessageIsCorrect = message.includes('Game does not exist!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});
});
