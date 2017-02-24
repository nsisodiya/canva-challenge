/**
 * Created by narendrasisodiya on 23/02/17.
 */

/*
 *   Tournament is Class for managing all information about a Tournament. You can create a Tournament, and extract information on who is winner.
 * */

const sequentialProcess = function (arr, callback) {
  var pp = Promise.resolve();
  arr.forEach(function (v, i, A) {
    pp = pp.then(function () {
      return callback(v, i, A);
    });
  });
  return pp;
};

//WHeN to use ? when async result from One Element is NOT needed in another.
const parallelProcess = function (arr, callback) {
  var pArray = [];
  arr.forEach(function (v, i, A) {
    pArray.push(callback(v, i, A));
  });
  return Promise.all(pArray);
};

const getArrayOf = (length) => {
  return Array.from(Array(length));
};
const SERVER_URL = window.location.origin;
// const log = (b) => {
//   window.res = b;
//   console.log(b);
//   return b;
// };
// const processStatus = function (response) {
//   // status "0" to handle local files fetching (e.g. Cordova/Phonegap etc.)
//   if (response.status === 200 || response.status === 0) {
//     return Promise.resolve(response)
//   } else {
//     return Promise.reject(new Error(response.statusText))
//   }
// };
define("Tournament", function () {
  class Tournament {
    constructor(teamsPerMatch, numberOfTeams) {
      this.isTournamentStarted = false;
      this.teamsPerMatch = teamsPerMatch;
      this.numberOfTeams = numberOfTeams;
      this.allTeams = {};
      this.generateCombinations();
      this.create();
      console.log(this);
      //var Process = ["CreateTournament", ["getTeamInfo", "getScoreInfo"], "PlayTournament", "Winner"];
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

    generateCombinations() {
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

    }

    //This will create a Tournament.
    create() {
      //This will make a XHR call to Server and get Initial Data

      fetch(
        `${SERVER_URL}/tournament`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          body: `numberOfTeams=${this.numberOfTeams}&teamsPerMatch=${this.teamsPerMatch}`
          //Note : A much better better is - JSON to queryString conversion. But I have to use Webpack in order to use which is not allowed in assignment.
        })
        .then(function (response) {
          return response.json();
        })
        .then(({matchUps, tournamentId}) => {
          this.tournamentId = tournamentId;
          this.getAllInfo();
          //FILL teamIds
          matchUps.forEach(({match, teamIds}) => {
            this.allMatchData[0][match].teamIds = teamIds;
          });
        });
      //.then(processStatus)

    }

    /*  This will load information of all Teams
     * */
    getAllInfo() {
      var pArray = [];
      //Get Team Data
      getArrayOf(this.numberOfTeams).forEach((v, teamId) => {
        pArray.push(this.getTeamInfo(teamId));
      });

      //Get Score Data
      this.allMatchData.forEach((roundData, roundId) => {
        roundData.forEach((matchData, matchId) => {
          pArray.push(this.getScore(roundId, matchId));
        });
      });

      Promise.all(pArray).then(() => {
        console.log("We got Everything", this);
        this.startTournament()
          .then(() => {
            console.log("Match END");
            const finalMatch = this.allMatchData[this.allMatchData.length - 1][0];
            const finalWinnerTeamId = finalMatch.winnerTeamId;
            const finalWinnerTeamName = this.allTeams[finalWinnerTeamId].name;
            document.querySelector("#winner").innerHTML = finalWinnerTeamName;
          });
      });
    }

    getScore(roundId, matchId) {
      //http://localhost:8765/match?tournamentId=0&round=0&match=0
      return fetch(
        `${SERVER_URL}/match?tournamentId=${this.tournamentId}&round=${roundId}&match=${matchId}`,
        {
          method: "GET"
        })
        .then(function (response) {
          return response.json();
        }).then(({score}) => {
          this.allMatchData[roundId][matchId].matchScore = score;
        });
    }

    getTeamInfo(teamId) {
      //http://localhost:8765/team?tournamentId=0&teamId=0
      return fetch(
        `${SERVER_URL}/team?tournamentId=${this.tournamentId}&teamId=${teamId}`,
        {
          method: "GET"
        })
        .then(function (response) {
          return response.json();
        }).then((teamData) => {
          this.allTeams[teamData.teamId] = teamData;
        });
    }

    startTournament() {
      //We will play all Match one by one
      //All Round will be in Sequence. One by One
      //All Match inside a Round will be Parallel,
      return sequentialProcess(this.allMatchData, (roundData) => {
        return parallelProcess(roundData, (matchData) => {
          return this.playMatch(matchData);
        });
      });
    }

    playMatch(matchData) {
      console.log("Playing Match", matchData);
      const {teamIds, roundId, matchId, matchScore} = matchData;

      const querystr = teamIds.map((teamId) => {
        return `teamScores=${this.allTeams[teamId].score}`;
      }).join("&");
      const queryPath = `/winner?tournamentId=${this.tournamentId}&${querystr}&matchScore=${matchScore}`;

      //http://localhost:8765/winner?tournamentId=0&teamScores=8&teamScores=9&matchScore=67
      return fetch(
        `${SERVER_URL}${queryPath}`,
        {
          method: "GET"
        })
        .then(function (response) {
          return response.json();
        }).then(({score}) => {
          console.log("Winning", score, queryPath);
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
          this.passTeamToNextRoundMatch(winnerTeamId, roundId, matchId);
        });
    }

    passTeamToNextRoundMatch(winnerTeamId, roundId, matchId) {
      var totalRoundsPossible = this.allMatchData.length;
      var nextRound = roundId + 1;
      if (nextRound === totalRoundsPossible) {
        //Skip
      } else {
        var nextMatchId = parseInt(matchId / this.teamsPerMatch);
        if (this.allMatchData[nextRound][nextMatchId].teamIds === null) {
          this.allMatchData[nextRound][nextMatchId].teamIds = [];
        }
        this.allMatchData[nextRound][nextMatchId].teamIds.push(winnerTeamId);
        console.log(this);
      }
    }
  }
  return Tournament;
});
