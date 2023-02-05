const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");

const btnUp = document.querySelector("#up");
const btnLeft = document.querySelector("#left");
const btnRight = document.querySelector("#right");
const btnDown = document.querySelector("#down");

const spanLives = document.querySelector("#lives");
const spanTime = document.querySelector("#time");
const spanRecord = document.querySelector("#record");
const pResult = document.querySelector("#result");

window.addEventListener("load", setCanvasSize);
window.addEventListener("resize", setCanvasSize);

let canvasSize;
let elementSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

let playerPosition = {
  x: undefined,
  y: undefined,
  ix: undefined,
  iy: undefined,
};

let giftIndex = {
  ix: undefined,
  iy: undefined,
};

let bombIndexes = [];

function setCanvasSize() {
  canvasSize;
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.7;
  } else {
    canvasSize = window.innerHeight * 0.7;
  }
  canvas.setAttribute("width", canvasSize);
  canvas.setAttribute("height", canvasSize);

  elementSize = canvasSize / 10;
  elementSize *= 0.97;

  startGame();
}

function startGame() {
  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    spanRecord.innerHTML =
      (localStorage.getItem("record") / 1000).toFixed(1) + "s";
  }

  game.font = elementSize + "px Roboto";
  game.textAlign = "end";

  const map = maps[level];
  const mapRows = map.trim().split("\n");
  const mapRowCols = mapRows.map((row) => row.trim().split(""));
  bombIndexes = [];

  showLives();

  game.clearRect(0, 0, canvasSize, canvasSize);

  mapRowCols.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = Math.floor(0.3 * elementSize + elementSize * (colI + 1));
      const posY = Math.floor(elementSize * (rowI + 1));

      game.fillText(emoji, posX, posY);
      if (col == "O") {
        if (!playerPosition.x && !playerPosition.y) {
          playerPosition = {
            x: posX,
            y: posY,
            ix: colI,
            iy: rowI,
          };
        }
      }
      if (col == "I") {
        giftIndex = {
          ix: colI,
          iy: rowI,
        };
      }
      if (col == "X") {
        bombIndexes.push({ ix: colI, iy: rowI });
      }
    });
  });

  movePlayer();

  // for (let row = 1; row <= 10; row++) {
  //   for (let col = 1; col <= 10; col++) {
  //     game.fillText(
  //       emojis[mapRowCols[row - 1][col - 1]],
  //       0.3 * elementSize + elementSize * col,
  //       elementSize * row
  //     );
  //   }
  // }
}

function checkCollision() {
  const giftCollitionX = giftIndex.ix == playerPosition.ix;
  const giftCollitionY = giftIndex.iy == playerPosition.iy;
  const isGift = giftCollitionX && giftCollitionY;
  if (isGift) {
    levelUp();
    return;
  }
  const isBomb = bombIndexes.find((bomb) => {
    const collitionX = bomb.ix == playerPosition.ix;
    const collitionY = bomb.iy == playerPosition.iy;
    return collitionX && collitionY;
  });
  if (isBomb) {
    levelFail();
    console.log("Colision");
    return;
  }
}

function movePlayer() {
  // console.log(playerPosition);
  game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);
  checkCollision();
}

window.addEventListener("keydown", moveByKeys);
btnUp.addEventListener("click", moveUp);
btnLeft.addEventListener("click", moveLeft);
btnRight.addEventListener("click", moveRight);
btnDown.addEventListener("click", moveDown);

function moveUp() {
  // console.log("Up");
  if (playerPosition.y - elementSize > 0) {
    playerPosition.y -= elementSize;
    playerPosition.iy -= 1;
    startGame();
  }
}
function moveLeft() {
  // console.log("Left");
  if (playerPosition.x - elementSize > elementSize) {
    playerPosition.x -= elementSize;
    playerPosition.ix -= 1;
    startGame();
  }
}
function moveRight() {
  // console.log("Right");
  if (playerPosition.x + elementSize < canvasSize) {
    playerPosition.x += elementSize;
    playerPosition.ix += 1;
    startGame();
  }
}
function moveDown() {
  // console.log("Down");
  if (playerPosition.y + elementSize < canvasSize) {
    playerPosition.y += elementSize;
    playerPosition.iy += 1;
    startGame();
  }
}
function moveByKeys(event) {
  switch (event.key) {
    case "ArrowUp":
      moveUp();
      break;
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "ArrowDown":
      moveDown();
      break;
    default:
      break;
  }
}

function levelUp() {
  if (level < maps.length - 1) {
    level++;
    startGame();
    return;
  }
  gameWin();
}

function gameWin() {
  clearInterval(timeInterval);
  const recordTime = localStorage.getItem("record");
  const playerTime = Date.now() - timeStart;

  if (recordTime) {
    if (recordTime >= timePlayer) {
      localStorage.setItem("record", playerTime);
      pResult.innerHTML = "Nuevo record!";
      return;
    }
    pResult.innerHTML = "No superaste el record!";
    return;
  }
  pResult.innerHTML = "Primer record!";
  localStorage.setItem("record", playerTime);
}

function levelFail() {
  lives--;

  playerPosition = {
    x: undefined,
    y: undefined,
    ix: undefined,
    iy: undefined,
  };
  if (lives <= 0) {
    level = 0;
    lives = 3;
    timeStart = undefined;
  }
  startGame();
}

function showLives() {
  const heartsArray = Array(lives).fill(emojis["HEART"]);
  spanLives.innerHTML = "";
  heartsArray.forEach((heart) => spanLives.append(heart));
}

function showTime() {
  timePlayer = Date.now() - timeStart;
  spanTime.innerHTML = (timePlayer / 1000).toFixed(1) + "s";
}
