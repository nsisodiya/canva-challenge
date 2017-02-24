// Edit me.
// Feel free to add other JS files in this directory as you see fit.

define("client", function (Tournament) {
  document.querySelector("#start").addEventListener("click", function () {
    //TODO - Add Validation
    const teamsPerMatch = parseInt(document.querySelector("#teamsPerMatch").value);
    const numberOfTeams = parseInt(document.querySelector("#numberOfTeams").value);
    new Tournament(teamsPerMatch, numberOfTeams);
  }, false);
});
