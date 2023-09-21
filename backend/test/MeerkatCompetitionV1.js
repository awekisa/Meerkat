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

		const [owner, other, other2] = await ethers.getSigners();
		return { proxy, owner, other, other2 };
	}

	// games
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
			3,
			true
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
			firstIsFinalized,
		] = game;

		expect(firstId).to.equal(1);
		expect(firstHomeCompetitor).to.equal('Liverpool');
		expect(firstAwayCompetitor).to.equal('Aston Villa');
		expect(firstStartTime).to.equal(updatedStartTime);
		expect(firstHomeScore).to.equal(3);
		expect(firstAwayScore).to.equal(3);
		expect(firstIsFinalized).to.equal(true);
	});

	it('should throw when updating game as non owner', async () => {
		const { proxy, other } = await loadFixture(deployContractAndSetVariables);
		let errorMessageIsCorrect;
		try {
			await proxy.addGame('Real', 'Betis', Date.now());
			await proxy
				.connect(other)
				.updateGame(1, 'Real2', 'Betis2', Date.now(), 1, 1, false);
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
			await proxy.updateGame(111, 'Real', 'Betis', Date.now(), 2, 3, false);
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

		expect(games.length).to.equal(3);
		expect(games[0].gameId == 1);
		expect(games[1].gameId == 0);
		expect(games[2].gameId == 3);
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

	// predictions
	it('should add prediction for a game', async function () {
		const { proxy, owner } = await loadFixture(deployContractAndSetVariables);

		const startTime = Date.now();

		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Arsenal', 'Newcastle', startTime);
		await proxy.addGame('Nice', 'PSG', startTime);

		await proxy.addOrUpdatePrediction(1, 2, 1);
		await proxy.addOrUpdatePrediction(2, 3, 0);
		await proxy.addOrUpdatePrediction(3, 1, 5);
		const predictions = await proxy.getPredictions(owner.address);
		const [firstGameId, firstHomeScore, firstAwayScore] = predictions[0];

		const [secondGameId, secondHomeScore, secondAwayScore] = predictions[1];

		const [thirdGameId, thirdHomeScore, thirdAwayScore] = predictions[2];

		expect(predictions.length).to.equal(3);

		expect(firstGameId).to.equal(1);
		expect(firstHomeScore).to.equal(2);
		expect(firstAwayScore).to.equal(1);

		expect(secondGameId).to.equal(2);
		expect(secondHomeScore).to.equal(3);
		expect(secondAwayScore).to.equal(0);

		expect(thirdGameId).to.equal(3);
		expect(thirdHomeScore).to.equal(1);
		expect(thirdAwayScore).to.equal(5);
	});

	it('should throw when add prediction for a game that does not exist', async function () {
		const { proxy } = await loadFixture(deployContractAndSetVariables);

		let errorMessageIsCorrect;
		try {
			await proxy.addOrUpdatePrediction(1, 2, 1);
		} catch ({ ex, message }) {
			console.log(message);
			errorMessageIsCorrect = message.includes('Game does not exist!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should update prediction as owner', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const startTime = Date.now();
		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addOrUpdatePrediction(1, 5, 1);

		const tx = await proxy.addOrUpdatePrediction(1, 5, 2);
		await tx.wait();
		const game = await proxy.getPrediction(1);

		const [firstId, firstHomeScore, firstAwayScore] = game;

		expect(firstId).to.equal(1);
		expect(firstHomeScore).to.equal(5);
		expect(firstAwayScore).to.equal(2);
	});

	it('should add and not update prediction as other user', async () => {
		const { proxy, owner, other } = await loadFixture(
			deployContractAndSetVariables
		);

		const startTime = Date.now();

		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Arsenal', 'Newcastle', startTime);

		await proxy.addOrUpdatePrediction(1, 1, 2);
		await proxy.connect(other).addOrUpdatePrediction(1, 3, 0);

		const predictionsOwner = await proxy.getPredictions(owner.address);
		const predictionsOther = await proxy.getPredictions(other.address);

		const [firstGameId, firstHomeScore, firstAwayScore] = predictionsOwner[0];

		const [secondGameId, secondHomeScore, secondAwayScore] =
			predictionsOther[0];

		expect(predictionsOwner.length).to.equal(1);
		expect(predictionsOther.length).to.equal(1);
		expect(firstGameId).to.equal(1);
		expect(firstHomeScore).to.equal(1);
		expect(firstAwayScore).to.equal(2);

		expect(secondGameId).to.equal(1);
		expect(secondHomeScore).to.equal(3);
		expect(secondAwayScore).to.equal(0);
	});

	it('should throw when add prediction after game started', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const startTime = Date.now();
		const epochTimestamp = Math.floor(startTime / 1000.0);
		await proxy.addGame('Real', 'Betis', epochTimestamp);

		await ethers.provider.send('evm_increaseTime', [3600]);
		await ethers.provider.send('evm_mine');

		let errorMessageIsCorrect;
		try {
			await proxy.addOrUpdatePrediction(1, 2, 1);
		} catch ({ ex, message }) {
			console.log(message);
			errorMessageIsCorrect = message.includes('Game has already started!');
		}

		expect(errorMessageIsCorrect).to.be.true;
	});

	it('should throw when update prediction after game started', async () => {
		const { proxy } = await loadFixture(deployContractAndSetVariables);
		const startTime = Date.now();
		const epochTimestamp = Math.floor(startTime / 1000.0) + 1000;
		await proxy.addGame('Real', 'Betis', epochTimestamp);
		await proxy.addOrUpdatePrediction(1, 2, 1);

		await ethers.provider.send('evm_increaseTime', [3600]);
		await ethers.provider.send('evm_mine');

		let errorMessageIsCorrect;
		try {
			await proxy.addOrUpdatePrediction(1, 3, 4);
		} catch ({ ex, message }) {
			console.log(message);
			errorMessageIsCorrect = message.includes('Game has already started!');
		}

		const prediction = await proxy.getPrediction(1);
		expect(errorMessageIsCorrect).to.be.true;
		expect(prediction.homeScore).to.equal(2);
		expect(prediction.awayScore).to.equal(1);
	});

	it('should calculate points', async () => {
		const { proxy, owner, other, other2 } = await loadFixture(
			deployContractAndSetVariables
		);
		const startTime = Date.now();
		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Barcelona', 'Gerona', startTime);
		await proxy.addGame('Atletico', 'Elche', startTime);

		// add predictions from multiple users
		await proxy.addOrUpdatePrediction(1, 2, 1);
		await proxy.addOrUpdatePrediction(2, 1, 1);
		await proxy.addOrUpdatePrediction(3, 1, 2);
		await proxy.connect(other).addOrUpdatePrediction(1, 3, 1);
		await proxy.connect(other).addOrUpdatePrediction(2, 2, 2);
		await proxy.connect(other).addOrUpdatePrediction(3, 1, 3);
		await proxy.connect(other2).addOrUpdatePrediction(1, 1, 1);
		await proxy.connect(other2).addOrUpdatePrediction(2, 1, 1);
		await proxy.connect(other2).addOrUpdatePrediction(3, 1, 1);

		// finalize game
		await proxy.updateGame(1, 'Real', 'Betis', startTime, 3, 1, true);
		await proxy.updateGame(2, 'Barcelona', 'Gerona', startTime, 1, 1, true);
		await proxy.updateGame(3, 'Atletico', 'Elche', startTime, 1, 2, true);

		const userPoints = await proxy.getPoints();

		expect(userPoints.length).to.equal(3);

		const [
			firstUser,
			firstScore,
			firstCorrectPredictions,
			firstCorrectOutcomes,
		] = userPoints[0];

		const [
			secondUser,
			secondScore,
			secondCorrectPredictions,
			secondCorrectOutcomes,
		] = userPoints[1];

		const [
			thirdUser,
			thirdScore,
			thirdCorrectPredictions,
			thirdCorrectOutcomes,
		] = userPoints[2];

		expect(firstUser).to.equal(await owner.address);
		expect(firstScore).to.equal(7);
		expect(firstCorrectPredictions).to.equal(2);
		expect(firstCorrectOutcomes).to.equal(3);

		expect(secondUser).to.equal(await other.address);
		expect(secondScore).to.equal(5);
		expect(secondCorrectPredictions).to.equal(1);
		expect(secondCorrectOutcomes).to.equal(3);

		expect(thirdUser).to.equal(await other2.address);
		expect(thirdScore).to.equal(3);
		expect(thirdCorrectPredictions).to.equal(1);
		expect(thirdCorrectOutcomes).to.equal(1);
	});

	it('should calculate points correctly when game is deleted', async () => {
		const { proxy, owner, other, other2 } = await loadFixture(
			deployContractAndSetVariables
		);
		const startTime = Date.now();
		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Barcelona', 'Gerona', startTime);
		await proxy.addGame('Atletico', 'Elche', startTime);

		// add predictions from multiple users
		await proxy.addOrUpdatePrediction(1, 2, 1);
		await proxy.addOrUpdatePrediction(2, 1, 1);
		await proxy.addOrUpdatePrediction(3, 1, 2);
		await proxy.connect(other).addOrUpdatePrediction(1, 3, 1);
		await proxy.connect(other).addOrUpdatePrediction(2, 2, 2);
		await proxy.connect(other).addOrUpdatePrediction(3, 1, 3);
		await proxy.connect(other2).addOrUpdatePrediction(1, 1, 1);
		await proxy.connect(other2).addOrUpdatePrediction(2, 1, 1);
		await proxy.connect(other2).addOrUpdatePrediction(3, 1, 1);

		// finalize game
		await proxy.updateGame(1, 'Real', 'Betis', startTime, 3, 1, true);
		await proxy.updateGame(2, 'Barcelona', 'Gerona', startTime, 1, 1, true);
		await proxy.updateGame(3, 'Atletico', 'Elche', startTime, 1, 2, true);

		// delete game
		await proxy.deleteGame(2);

		const userPoints = await proxy.getPoints();

		console.log(userPoints);

		expect(userPoints.length).to.equal(3);

		const [
			firstUser,
			firstScore,
			firstCorrectPredictions,
			firstCorrectOutcomes,
		] = userPoints[0];

		const [
			secondUser,
			secondScore,
			secondCorrectPredictions,
			secondCorrectOutcomes,
		] = userPoints[1];

		const [
			thirdUser,
			thirdScore,
			thirdCorrectPredictions,
			thirdCorrectOutcomes,
		] = userPoints[2];

		expect(firstUser).to.equal(await owner.address);
		expect(firstScore).to.equal(4);
		expect(firstCorrectPredictions).to.equal(1);
		expect(firstCorrectOutcomes).to.equal(2);

		expect(secondUser).to.equal(await other.address);
		expect(secondScore).to.equal(4);
		expect(secondCorrectPredictions).to.equal(1);
		expect(secondCorrectOutcomes).to.equal(2);

		expect(thirdUser).to.equal(await other2.address);
		expect(thirdScore).to.equal(0);
		expect(thirdCorrectPredictions).to.equal(0);
		expect(thirdCorrectOutcomes).to.equal(0);
	});

	it('should calculate points with correct number of predictions', async () => {
		const { proxy, owner, other, other2 } = await loadFixture(
			deployContractAndSetVariables
		);
		const startTime = Date.now();
		await proxy.addGame('Real', 'Betis', startTime);
		await proxy.addGame('Barcelona', 'Gerona', startTime);
		await proxy.addGame('Atletico', 'Elche', startTime);

		// add predictions from multiple users

		// user1 has 3 predictions
		await proxy.addOrUpdatePrediction(1, 2, 1);
		await proxy.addOrUpdatePrediction(2, 1, 1);
		await proxy.addOrUpdatePrediction(3, 1, 2);

		// user2 has 2 predictions
		await proxy.connect(other).addOrUpdatePrediction(1, 3, 1);
		await proxy.connect(other).addOrUpdatePrediction(2, 2, 2);

		// user3 has 1 prediction
		await proxy.connect(other2).addOrUpdatePrediction(1, 1, 1);

		// finalize game
		await proxy.updateGame(1, 'Real', 'Betis', startTime, 3, 1, true);
		await proxy.updateGame(2, 'Barcelona', 'Gerona', startTime, 1, 1, true);
		await proxy.updateGame(3, 'Atletico', 'Elche', startTime, 1, 2, true);

		const userPoints = await proxy.getPoints();

		expect(userPoints.length).to.equal(3);

		const [
			firstUser,
			firstScore,
			firstCorrectPredictions,
			firstCorrectOutcomes,
			firstTotalNumberOfPredictions,
		] = userPoints[0];

		const [
			secondUser,
			secondScore,
			secondCorrectPredictions,
			secondCorrectOutcomes,
			secondTotalNumberOfPredictions,
		] = userPoints[1];

		const [
			thirdUser,
			thirdScore,
			thirdCorrectPredictions,
			thirdCorrectOutcomes,
			thirdTotalNumberOfPredictions,
		] = userPoints[2];

		expect(firstUser).to.equal(await owner.address);
		expect(firstScore).to.equal(7);
		expect(firstCorrectPredictions).to.equal(2);
		expect(firstCorrectOutcomes).to.equal(3);
		expect(firstTotalNumberOfPredictions).to.equal(3);

		expect(secondUser).to.equal(await other.address);
		expect(secondScore).to.equal(4);
		expect(secondCorrectPredictions).to.equal(1);
		expect(secondCorrectOutcomes).to.equal(2);
		expect(secondTotalNumberOfPredictions).to.equal(2);

		expect(thirdUser).to.equal(await other2.address);
		expect(thirdScore).to.equal(0);
		expect(thirdCorrectPredictions).to.equal(0);
		expect(thirdCorrectOutcomes).to.equal(0);
		expect(thirdTotalNumberOfPredictions).to.equal(1);
	});
});
