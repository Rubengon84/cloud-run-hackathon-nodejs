const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Let the battle begin!");
});

app.post("/", function (req, res) {
  // TODO add your implementation here to replace the random response

  res.send(requestProcess(req.body));
});

app.listen(process.env.PORT || 8080);

const requestProcess = (bodyRequest) => {
  /*********************************************/
  //get Xmatch and Ymatch targets
  const user =
    bodyRequest.arena.state[
      "https://cloud-run-hackathon-nodejs-n6ncw5mplq-uc.a.run.app"
    ];
  delete bodyRequest.arena.state[
    "https://cloud-run-hackathon-nodejs-n6ncw5mplq-uc.a.run.app"
  ];
  let arenaArray = Object.values(bodyRequest.arena.state);
  let { Xmatch, Ymatch, nonMatching } = arenaArray.reduce(
    (acc, userRecord) => {
      userRecord.x == user.x && Math.abs(userRecord.y - user.y) <= 3
        ? // or, if you need to compare by _id
          // userRecord._id == user_id
          acc.Xmatch.push(userRecord)
        : userRecord.y == user.y && Math.abs(userRecord.y - user.y) <= 3
        ? acc.Ymatch.push(userRecord)
        : acc.nonMatching.push(userRecord);
      return acc;
    },
    { Xmatch: [], Ymatch: [], nonMatching: [] }
  );

  Xmatch.sort((a, b) => {
    return Math.abs(a.y - user.y) - Math.abs(b.y - user.y);
  });

  Ymatch.sort((a, b) => {
    return Math.abs(a.x - user.x) - Math.abs(b.x - user.x);
  });

  /***************************************************/
  // Funtion to return the posible movements Array when the player in in the edge of the Arena
  //new Set(["W", "S"]).has(player.y)
  const moveCharacterOptions = (arenaX, arenaY, player) => {
    if (
      (player.x == arenaX && player.y == 0 && player.direction !== "S") ||
      (player.x == arenaX && player.y == arenaY && player.direction !== "W") ||
      (player.y == arenaY && player.x == 0 && player.direction !== "N") ||
      (player.y == 0 && player.x == 0 && player.direction !== "E")
    ) {
      return "R";
    } else if (
      (player.y == 0 &&
        ![0, "0", arenaX].includes(player.x) &&
        player.direction !== "E") ||
      (player.x == 0 &&
        ![0, "0", arenaY].includes(player.y) &&
        player.direction !== "N") ||
      (player.x == arenaX &&
        ![0, "0", arenaY].includes(player.y) &&
        player.direction !== "S") ||
      (player.y == arenaY &&
        ![0, "0", arenaX].includes(player.x) &&
        player.direction !== "W")
    ) {
      return "R";
    } else {
      return "F";
    }
  };
  /******************************************************************************/
  //Start the action of the player
  //Shoot to other users
  const arenaX = bodyRequest.arena.dims[0];
  const arenaY = bodyRequest.arena.dims[1];
  if (Xmatch.length > 0) {
    const onXTarget = parseInt(user.y) - parseInt(Xmatch[0].y);
    console.log(onXTarget);
    if (
      (user.direction == "E" && onXTarget < 0) ||
      (user.direction == "W" && onXTarget > 0)
    ) {
      return "T";
    } else if (["N", "S"].includes(user.direction)) {
      return "R";
    } else {
      return moveCharacterOptions(arenaX, arenaY, user);
    }
  } else if (Ymatch.length > 0) {
    const onYTarget = parseInt(user.x) - parseInt(Ymatch[0].x);

    if (
      (user.direction == "N" && onYTarget > 0) ||
      (user.direction == "S" && onYTarget < 0)
    ) {
      return "T";
    } else if (["W", "E"].includes(user.direction)) {
      return "R";
    } else {
      return moveCharacterOptions(arenaX, arenaY, user);
    }

    /***************************************************************************/
    // If player does not shoot, move player in the Arena
  } else {
    return moveCharacterOptions(arenaX, arenaY, user);
  }
};
