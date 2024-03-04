// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BettingContract {
    address public owner;

    struct Bet {
        address bettor;
        uint predictedScoreHome;
        uint predictedScoreAway;
        bool isWinner;
    }

   struct Match {
    uint scoreHome;
    uint scoreAway;
    bool isFinished;
    Bet[] bets;
    uint totalBet;
    }


    mapping(uint => Match) public matches;

    event BetPlaced(address user, uint matchId, uint predictedScoreHome, uint predictedScoreAway, uint betAmount);
    event MatchResultUpdated(uint matchId, uint scoreHome, uint scoreAway);
    event WinnersUpdated(uint matchId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function placeBet( uint _matchId, uint _predictedScoreHome, uint _predictedScoreAway ) external payable {
    require(msg.value > 0, "Bet must be greater than 0");

    Match storage match_ = matches[_matchId];
    match_.bets.push(Bet({
        bettor: msg.sender,
        predictedScoreHome: _predictedScoreHome,
        predictedScoreAway: _predictedScoreAway,
        isWinner: false
    }));
    match_.totalBet += msg.value;

    emit BetPlaced(msg.sender, _matchId, _predictedScoreHome, _predictedScoreAway, msg.value);
    }

    function updateMatchResult(uint _matchId, uint _scoreHome, uint _scoreAway) external onlyOwner {
        Match storage match_ = matches[_matchId];
        match_.scoreHome = _scoreHome;
        match_.scoreAway = _scoreAway;
        match_.isFinished = true;

        emit MatchResultUpdated(_matchId, _scoreHome, _scoreAway);
    }

    function determineWinners(uint _matchId) external onlyOwner {
        Match storage match_ = matches[_matchId];
        require(match_.isFinished, "Match not finished yet.");

        for (uint i = 0; i < match_.bets.length; i++) {
            Bet storage bet = match_.bets[i];
            if (bet.predictedScoreHome == match_.scoreHome && bet.predictedScoreAway == match_.scoreAway) {
                bet.isWinner = true;
            }
        }

        emit WinnersUpdated(_matchId);
    }

    function distributeWinnings(uint _matchId) external onlyOwner {
        Match storage match_ = matches[_matchId];
        require(match_.isFinished, "Match not finished yet.");

        uint winnersCount = 0;
        // Compter le nombre de gagnants
        for (uint i = 0; i < match_.bets.length; i++) {
            if (match_.bets[i].isWinner) {
                winnersCount++;
            }
        }

        require(winnersCount > 0, "No winners");

        uint winningAmountPerWinner = match_.totalBet / (winnersCount < 5 ? winnersCount : 5); // Diviser par le nombre de gagnants ou 5, lequel est le plus petit

        uint paidWinners = 0;
        for (uint i = 0; i < match_.bets.length && paidWinners < 5; i++) {
            Bet storage bet = match_.bets[i];
            if (bet.isWinner) {
                payable(bet.bettor).transfer(winningAmountPerWinner);
                paidWinners++;
            }
        }
    }

}
