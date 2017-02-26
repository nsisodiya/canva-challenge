/*
 *
 *     Note: I am heavy fan of React. This class is created for making a separation between UI and Business Logic.
 *     I do not use this kind of UI layer in production. I use proper React, FLUX or more suitable architecure.
 *
 * */

define("TournamentUI", function (Tournament) {
  class TournamentUI {
    constructor(node) {
      this.node = node;
      this.setUp();
    }

    setUp() {
      document.querySelector("#start").addEventListener("click", () => {
        //TODO - Add Validation
        document.querySelector("#winner").innerHTML = "";
        const teamsPerMatch = parseInt(document.querySelector("#teamsPerMatch").value);
        const numberOfTeams = parseInt(document.querySelector("#numberOfTeams").value);
        const rounds = Tournament.getNumberOfRounds(teamsPerMatch, numberOfTeams);
        if (rounds !== null && typeof rounds === "number" &&
          typeof teamsPerMatch === "number" && teamsPerMatch > 1) {
          this.runNewTournament(teamsPerMatch, numberOfTeams);
        } else {
          window.alert("Please fill proper values like (2,8), (2,16), (3,9), (3,27), (3,81)");
        }
      }, false);
    }

    runNewTournament(teamsPerMatch, numberOfTeams) {
      this.tournament = new Tournament(teamsPerMatch, numberOfTeams);
      this.tournament.setUICallback(() => {
        //This will be called when any Update is available from Business Logic
        this.node.innerHTML = this.render();
      });
    }

    render() {
      var matches = [];
      this.tournament.allMatchData.forEach(function (roundData) {
        roundData.forEach(function (matchData) {
          if (matchData.isMatchCompleted) {
            matches.push("■");
          } else {
            matches.push("□");
          }
        });
      });
      var winnerStr = "";
      if (this.tournament.tournamentEnded === true) {
        winnerStr = `<div>${this.tournament.finalWinnerTeamName} is the Winner.</div>`;
      }
      return `<div>\
            ${winnerStr}
            <div>${matches.join(" ")}</div>
            </div>\
      `;
    }
  }
  return TournamentUI;
});
