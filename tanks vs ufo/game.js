// Pełny plik game.js do gry "Czołg kontra UFO"
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let w = canvas.width;
let h = canvas.height;

let tank = {
  x: w / 2,
  y: h - 100,
  width: 60,
  height: 40,
  barrelLength: 40,
  color: "green",
  lives: 3
};

let bullets = [];
let ufos = [];
let keys = {};
let theme = "day";
let difficulty = "easy";
let score = 0;
let gameRunning = false;
let ufoSpawnRate = 2000;
let tankColor = "green";
let barrelLength = 40;

function startGame(diff) {
  difficulty = diff;
  gameRunning = true;
  document.getElementById("menu").style.display = "none";
  document.getElementById("bgMusic").play();
  tank.color = document.getElementById("tankColor").value;
  tank.barrelLength = parseInt(document.getElementById("barrelLength").value);
  theme = document.getElementById("themeSelect").value;

  if (difficulty === "medium") ufoSpawnRate = 1200;
  if (difficulty === "hard") ufoSpawnRate = 700;

  setInterval(spawnUFO, ufoSpawnRate);
  gameLoop();
}

function spawnUFO() {
  const type = Math.random() < 0.3 ? (Math.random() < 0.5 ? 'red' : 'blue') : 'gray';
  const ufo = {
    x: Math.random() * w,
    y: -40,
    width: 40,
    height: 20,
    speed: type === 'blue' ? 5 : (type === 'red' ? 2 : 3),
    life: type === 'red' ? 2 : 1,
    color: type
  };
  ufos.push(ufo);
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, w, h);
  drawBackground();
  drawForest();
  moveTank();
  drawTank();
  moveBullets();
  drawBullets();
  moveUFOs();
  drawUFOs();
  detectCollisions();
  drawScore();
  requestAnimationFrame(gameLoop);
}

function drawBackground() {
  ctx.fillStyle = theme === 'day' ? '#87CEEB' : '#0B0B3B';
  ctx.fillRect(0, 0, w, h);
}

function drawForest() {
  const treeSpacing = 50;
  ctx.fillStyle = '#2E8B57';
  ctx.fillRect(0, h - 100, w, 100);

  for (let i = 0; i < w; i += treeSpacing) {
    let trunkHeight = Math.random() * 60 + 100;
    let trunkWidth = 14;
    let trunkX = i + Math.random() * 10;
    let trunkY = h - 100 - trunkHeight;

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);

    ctx.beginPath();
    ctx.arc(trunkX + trunkWidth / 2, trunkY, 35, 0, Math.PI * 2);
    ctx.fillStyle = 'darkgreen';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(trunkX + trunkWidth / 2 - 15, trunkY + 10, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(trunkX + trunkWidth / 2 + 15, trunkY + 10, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTank() {
  ctx.fillStyle = tank.color;
  ctx.fillRect(tank.x, tank.y, tank.width, tank.height);

  ctx.beginPath();
  ctx.moveTo(tank.x + tank.width / 2, tank.y);
  ctx.lineTo(tank.x + tank.width / 2, tank.y - tank.barrelLength);
  ctx.strokeStyle = tank.color;
  ctx.lineWidth = 6;
  ctx.stroke();
}

function moveTank() {
  if (keys["ArrowLeft"]) tank.x -= 5;
  if (keys["ArrowRight"]) tank.x += 5;
  if (tank.x < 0) tank.x = 0;
  if (tank.x + tank.width > w) tank.x = w - tank.width;
}

function drawBullets() {
  ctx.fillStyle = "black";
  bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function moveBullets() {
  bullets.forEach(b => b.y -= 7);
  bullets = bullets.filter(b => b.y > 0);
}

function drawUFOs() {
  ufos.forEach(u => {
    ctx.fillStyle = u.color;
    ctx.beginPath();
    ctx.ellipse(u.x, u.y, u.width, u.height, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function moveUFOs() {
  ufos.forEach(u => {
    u.y += u.speed;
    if (u.y + u.height > tank.y && u.x > tank.x && u.x < tank.x + tank.width) {
      if (difficulty === "hard") createExplosion(tank.x + tank.width / 2, tank.y);
      tank.lives--;
      document.getElementById("hitSound").play();
      ufos.splice(ufos.indexOf(u), 1);
      if (tank.lives <= 0) {
        createExplosion(tank.x + tank.width / 2, tank.y);
        endGame();
      }
    }
  });
  ufos = ufos.filter(u => u.y < h);
}

function detectCollisions() {
  bullets.forEach(bullet => {
    ufos.forEach(ufo => {
      if (
        bullet.x > ufo.x - ufo.width &&
        bullet.x < ufo.x + ufo.width &&
        bullet.y > ufo.y - ufo.height &&
        bullet.y < ufo.y + ufo.height
      ) {
        ufo.life--;
        if (ufo.life <= 0) {
          createExplosion(ufo.x, ufo.y);
          document.getElementById("explosionSound").play();
          score++;
          ufos.splice(ufos.indexOf(ufo), 1);
        }
        bullets.splice(bullets.indexOf(bullet), 1);
      }
    });
  });
}

function createExplosion(x, y) {
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Wynik: " + score + " | Życia: " + tank.lives, 20, 30);
}

function endGame() {
  gameRunning = false;
  document.getElementById("bgMusic").pause();
  document.getElementById("gameover").style.display = "block";
  document.getElementById("finalScore").innerText = "Twój wynik: " + score;
  const best = localStorage.getItem("bestScore") || 0;
  if (score > best) {
    localStorage.setItem("bestScore", score);
  }
  document.getElementById("bestScore").innerText = "Najlepszy wynik: " + localStorage.getItem("bestScore");
}

function restart() {
  location.reload();
}

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " " && gameRunning) {
    bullets.push({ x: tank.x + tank.width / 2, y: tank.y });
    document.getElementById("shootSound").play();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function checkOptionsSelected() {
  const themeSelected = document.getElementById("themeSelect").value;
  const tankColor = document.getElementById("tankColor").value;
  const barrelLength = document.getElementById("barrelLength").value;
  const buttons = document.querySelectorAll("#difficultyButtons button");
  if (themeSelected && tankColor && barrelLength) {
    buttons.forEach(btn => btn.disabled = false);
  }
}

// Instrukcje
window.onload = () => {
  const menu = document.getElementById("menu");
  const instructions = document.createElement("p");
  instructions.innerHTML = "Sterowanie: &#8592; i &#8594; - ruch, Spacja - strzał";
  menu.appendChild(instructions);
};
