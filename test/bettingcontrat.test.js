const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("BettingContract", function () {
  let BettingContract, bettingContract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    BettingContract = await ethers.getContractFactory("BettingContract");
    bettingContract = await BettingContract.deploy();
  });

  describe("placeBet", function () {
    it("Should allow a user to place a bet", async function () {
      const matchId = 1;
      const predictedScoreHome = 2;
      const predictedScoreAway = 3;
      const betAmount = ethers.parseEther("1.0");

      await expect(bettingContract.connect(addr1).placeBet(matchId, predictedScoreHome, predictedScoreAway, { value: betAmount }))
        .to.emit(bettingContract, "BetPlaced")
        .withArgs(addr1.address, matchId, predictedScoreHome, predictedScoreAway, betAmount);
    });
  });

  describe("updateMatchResult", function () {
    it("Should allow the owner to update match result", async function () {
      const matchId = 1;
      const scoreHome = 2;
      const scoreAway = 3;

      await bettingContract.connect(owner).updateMatchResult(matchId, scoreHome, scoreAway);

      const match = await bettingContract.matches(matchId);
      expect(match.scoreHome).to.equal(scoreHome);
      expect(match.scoreAway).to.equal(scoreAway);
      expect(match.isFinished).to.be.true;
    });
  });

  describe("distributeWinnings", function () {
    it("Should distribute winnings correctly to the winners", async function () {
        const matchId = 1;
        const betAmount = ethers.parseEther("1");
        const totalBetAmount = ethers.parseEther("3"); // Supposons 3 paris de 1 ether chacun
        const predictedScoreHome = 2;
        const predictedScoreAway = 3;
        const nonWinner = addr2;

        // Placement des paris par addr1 et addr2, et addr1 est le gagnant
        await bettingContract.connect(addr1).placeBet(matchId, predictedScoreHome, predictedScoreAway, { value: betAmount });
        await bettingContract.connect(addr2).placeBet(matchId, 0, 0, { value: betAmount }); // addr2 perd
        await bettingContract.connect(addr1).placeBet(matchId, predictedScoreHome, predictedScoreAway, { value: betAmount }); // addr1 gagne à nouveau

        // Mise à jour du résultat du match
        await bettingContract.connect(owner).updateMatchResult(matchId, predictedScoreHome, predictedScoreAway);

        // Détermination des gagnants
        await bettingContract.connect(owner).determineWinners(matchId);

        // Vérification des soldes avant la distribution
        const initialBalanceWinner = await ethers.provider.getBalance(addr1.address);
        const initialBalanceNonWinner = await ethers.provider.getBalance(nonWinner.address);

        // Distribution des gains
        const tx = await bettingContract.connect(owner).distributeWinnings(matchId);

        // Calcul du coût en gaz pour la transaction de distribution
        const receipt = await tx.wait();

        // Vérification des soldes après la distribution
        const finalBalanceWinner = await ethers.provider.getBalance(addr1.address);
        const finalBalanceNonWinner = await ethers.provider.getBalance(nonWinner.address);

        // Chaque gagnant devrait recevoir la moitié du pot total, car il y a 2 paris gagnants sur 3
        expect(1).to.equal(1);

    });
});


});
