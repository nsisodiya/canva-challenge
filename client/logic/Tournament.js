/**
 * Created by narendrasisodiya on 23/02/17.
 */

/*
 *   Tournament is Class for managing all information about a Tournament. You can create a Tournament, and extract information on who is winner.
 * */

/*  Sample Data Structure used in this CLASS

{
    "tournamentEnded": true,
    "tournamentId": 6,
    "allTeams": {
        "0": {
            "teamId": 0,
            "name": "Mount Druitt Platypuses",
            "score": 34
         },
         "1": {
             "teamId": 1,
             "name": "Northbridge Emus",
             "score": 93
         },
         "2": {
             "teamId": 2,
             "name": "Wareemba Highlanders",
             "score": 93
         },
         "3": {
             "teamId": 3,
             "name": "Matraville Magic",
             "score": 45
         }
    },
    "allMatchData": [
       [
           {
               "roundId": 0,
               "matchId": 0,
               "teamIds": [0,1],
               "isMatchCompleted": true,
               "matchScore": 61,
               "winnerTeamId": 0
           },
           {
               "roundId": 0,
               "matchId": 1,
               "teamIds": [2,3],
               "isMatchCompleted": true,
               "matchScore": 53,
               "winnerTeamId": 3
           }
       ],
       [
            {
               "roundId": 1,
               "matchId": 0,
               "teamIds": [3,0],
               "isMatchCompleted": true,
               "matchScore": 61,
               "winnerTeamId": 3
            }
       ]
    ],
    "allTeamIds": [0,1,2,3],
    "finalWinnerTeamName": "Matraville Magic"
}

 * */

const getArrayOf = (length) => {
  return Array.from(Array(length));
};

define("Tournament", function (parallelExec, sequentialExec, ajax) {
  class Tournament {
    constructor(teamsPerMatch, numberOfTeams) {
      this.tournamentEnded = false;
      this.teamsPerMatch = teamsPerMatch;
      this.numberOfTeams = numberOfTeams;
      this.allTeams = {};
      const totalRounds = Tournament.getNumberOfRounds(this.teamsPerMatch, this.numberOfTeams);
      this.allMatchData = [];
      getArrayOf(totalRounds).forEach((v, roundId) => {
        const numMatchInTheRound = this.numberOfTeams / Math.pow(this.teamsPerMatch, roundId + 1);
        getArrayOf(numMatchInTheRound).forEach((y, matchId) => {
          if (this.allMatchData[roundId] === undefined) {
            this.allMatchData[roundId] = [];
          }
          this.allMatchData[roundId][matchId] = {
            roundId,
            matchId,
            teamIds: null, //Who is Playing on this match
            isMatchCompleted: false, // Used for UI to show block
            matchScore: null,
            winnerTeamId: null
          };
        });
      });

      this.sendUpdateToUI();
      this.runTournament();
      console.log(this);
      //var Process = ["CreateTournament", ["getTeamInfo", "getScoreInfo"], "PlayTournament", "SetWinner"];
    }

    runTournament() {
      this.createTournament()
        .then(() => {
          return Promise.all([
            parallelExec(this.allTeamIds, (teamId) => {
              return this.getTeamInfo(teamId);
            }),
            parallelExec(this.allMatchData, (roundData, roundId) => {
              return parallelExec(roundData, (matchData, matchId) => {
                return this.getScore(roundId, matchId);
              });
            })
          ]);
        })
        .then(() => {
          console.log("We got All Needed Info", this);
          //We will play all Match one by one
          //All Round will be in Sequence. One by One
          //All Match inside a Round will be Parallel,
          return sequentialExec(this.allMatchData, (roundData) => {
            return parallelExec(roundData, (matchData) => {
              return this.playMatch(matchData);
            });
          });
        })
        .then(() => {
          console.log("Match END");
          this.tournamentEnded = true;
          const finalMatch = this.allMatchData[this.allMatchData.length - 1][0];
          const finalWinnerTeamId = finalMatch.winnerTeamId;
          const finalWinnerTeamName = this.allTeams[finalWinnerTeamId].name;
          this.finalWinnerTeamName = finalWinnerTeamName;
          document.querySelector("#winner").innerHTML = finalWinnerTeamName;
        });
    }

    static getNumberOfRounds(teamsPerMatch, numberOfTeams) {
      let rounds = 1;
      let teamCount;

      for (teamCount = teamsPerMatch; teamCount < numberOfTeams; teamCount *= teamsPerMatch) {
        rounds++;
      }
      if (teamCount === numberOfTeams) {
        return rounds;
      } else {
        return null;
      }
    }

    //This will create a Tournament.
    createTournament() {
      //This will make a XHR call to Server and get Initial Data

      return ajax.post(
        {
          url: "/tournament",
          body: `numberOfTeams=${this.numberOfTeams}&teamsPerMatch=${this.teamsPerMatch}`
        })
        .then(({matchUps, tournamentId}) => {
          this.tournamentId = tournamentId;
          //FILL teamIds
          this.allTeamIds = [];
          matchUps.forEach(({match, teamIds}) => {
            this.allMatchData[0][match].teamIds = teamIds;
            this.allTeamIds.push(...teamIds);
          });
        });
    }

    getScore(roundId, matchId) {
      //http://localhost:8765/match?tournamentId=0&round=0&match=0
      return ajax.get(
        {
          url: `/match?tournamentId=${this.tournamentId}&round=${roundId}&match=${matchId}`
        })
        .then(({score}) => {
          this.allMatchData[roundId][matchId].matchScore = score;
        });
    }

    getTeamInfo(teamId) {
      //http://localhost:8765/team?tournamentId=0&teamId=0
      return ajax.get(
        {
          url: `/team?tournamentId=${this.tournamentId}&teamId=${teamId}`
        })
        .then((teamData) => {
          this.allTeams[teamData.teamId] = teamData;
        });
    }

    playMatch(matchData) {
      console.log("Playing Match", matchData);
      const {teamIds, roundId, matchId, matchScore} = matchData;

      const querystr = teamIds.map((teamId) => {
        return `teamScores=${this.allTeams[teamId].score}`;
      }).join("&");

      //http://localhost:8765/winner?tournamentId=0&teamScores=8&teamScores=9&matchScore=67
      return ajax.get(
        {
          url: `/winner?tournamentId=${this.tournamentId}&${querystr}&matchScore=${matchScore}`
        })
        .then(({score}) => {
          this.findWinnerFromScore(teamIds, score, roundId, matchId);
        });
    }

    findWinnerFromScore(teamIds, score, roundId, matchId) {
      //Check if there is a Tie
      //Step 1 - Convert All Teams IDs Array to Team Object Array with score
      //Step 2 - Filter all Winner Teams
      const allWinnerTeamIds = teamIds
        .map((teamId) => {
          return {
            teamId: teamId,
            score: this.allTeams[teamId].score
          };
        })
        .filter(function (teamData) {
          return teamData.score === score;
        })
        .map(function (teamData) {
          return teamData.teamId;
        });
      //Step 3 - If there are multiple Winner, Take something which is having Lowest id.
      var winnerTeamId = Math.min(...allWinnerTeamIds);
      this.allMatchData[roundId][matchId].winnerTeamId = winnerTeamId;
      this.allMatchData[roundId][matchId].isMatchCompleted = true;
      console.log("Winner Team Id ", winnerTeamId);
      //Now, this Team is Winner, Lets Pass it to next Round.

      var totalRoundsPossible = this.allMatchData.length;
      var nextRound = roundId + 1;
      var nextMatchId = parseInt(matchId / this.teamsPerMatch);
      if (nextRound < totalRoundsPossible) {
        this.passTeamToNextRoundMatch(winnerTeamId, nextRound, nextMatchId);
      }
      this.sendUpdateToUI();
    }

    passTeamToNextRoundMatch(winnerTeamId, nextRound, nextMatchId) {
      if (this.allMatchData[nextRound][nextMatchId].teamIds === null) {
        this.allMatchData[nextRound][nextMatchId].teamIds = [];
      }
      this.allMatchData[nextRound][nextMatchId].teamIds.push(winnerTeamId);
    }

    setUICallback(uiCallback) {
      this.uiCallback = uiCallback;
    }

    sendUpdateToUI() {
      //This is a HACK - Better solutions is available.
      //Push a ASync Update to UI
      window.setTimeout(() => {
        try {
          if (typeof this.uiCallback === "function") {
            this.uiCallback();
          }
        } catch (ex) {
          console.log(ex);
        }
      }, 0);
    }
  }
  return Tournament;
});
