const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = 400;
canvas.height = 600;

// 🟢 Local sounds
const bgMusic = document.getElementById("bgMusic");
const gameOverSound = document.getElementById("gameOverSound");

// 🟢 Local images
const birdImg = new Image();
birdImg.src = "bird.png"; // your bird image

const pipeImg = new Image();
pipeImg.src = "pipe.png"; // your pipe image

const gameOverImg = new Image();
gameOverImg.src = "gameover.png"; // image shown on game over

let frames = 0;
let score = 0;
let gameRunning = false;
const gravity = 0.25;

// 🕊️ Bird object
const bird = {
  x: 50,
  y: 150,
  width: 50,
  height: 40,
  velocity: 0,
  jump: 4.6,

  draw() {
    ctx.drawImage(
      birdImg,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  },

  flap() {
    this.velocity = -this.jump;
  },

  update() {
    this.velocity += gravity;
    this.y += this.velocity;

    // Bird falls off screen
    if (this.y + this.height / 2 >= canvas.height) {
      gameOver();
    }

    // Bird hits top
    if (this.y - this.height / 2 <= 0) {
      this.y = this.height / 2;
      this.velocity = 0;
    }
  },
};

// 🧱 Pipes
const pipes = [];
const pipeWidth = 60;
const pipeGap = 140;
const pipeFrequency = 90;

function drawPipes() {
  for (let p of pipes) {
    ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.top);
    ctx.drawImage(
      pipeImg,
      p.x,
      canvas.height - p.bottom,
      pipeWidth,
      p.bottom
    );
  }
}

function updatePipes() {
  if (frames % pipeFrequency === 0) {
    const top = Math.random() * (canvas.height / 2);
    const bottom = canvas.height - (top + pipeGap);
    pipes.push({ x: canvas.width, top, bottom });
  }

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    p.x -= 2;

    // Collision detection
    if (
      bird.x + bird.width / 2 > p.x &&
      bird.x - bird.width / 2 < p.x + pipeWidth &&
      (bird.y - bird.height / 2 < p.top ||
        bird.y + bird.height / 2 > canvas.height - p.bottom)
    ) {
      gameOver();
    }

    // Score
    if (p.x + pipeWidth === bird.x) {
      score++;
      document.getElementById("score").textContent = score;
    }
  }

  // Remove old pipes
  if (pipes.length && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }
}

// 🎨 Background
function drawBackground() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 🖼️ Show game over image
function showGameOverImage() {
  const imgWidth = 300;
  const imgHeight = 200;

  if (gameOverImg.complete) {
    ctx.drawImage(
      gameOverImg,
      (canvas.width - imgWidth) / 2,
      (canvas.height - imgHeight) / 2,
      imgWidth,
      imgHeight
    );
  } else {
    gameOverImg.onload = () => {
      ctx.drawImage(
        gameOverImg,
        (canvas.width - imgWidth) / 2,
        (canvas.height - imgHeight) / 2,
        imgWidth,
        imgHeight
      );
    };
  }
}

// 💥 Game over logic — image always on top
function gameOver() {
  // Stop the loop immediately
  gameRunning = false;

  // Stop background music
  bgMusic.pause();
  bgMusic.currentTime = 0;

  // Play game-over sound
  gameOverSound.currentTime = 0;
  gameOverSound.play();

  // Clear everything first
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw layers in correct order
  drawBackground();   // background bottom
  drawPipes();        // pipes middle
  bird.draw();        // bird above pipes
  showGameOverImage(); // 🟢 gameover image on top

  // Delay alert slightly so image shows clearly
  setTimeout(() => {
    alert("Game Over! Your score: " + score);
    resetGame();
  }, 600);
}

// 🔄 Reset game
function resetGame() {
  pipes.length = 0;
  bird.y = 150;
  bird.velocity = 0;
  score = 0;
  document.getElementById("score").textContent = score;
  drawBackground();
  bird.draw();
}

// 🕹️ Main game loop
function gameLoop() {
  if (!gameRunning) return;

  frames++;
  drawBackground();
  updatePipes();
  drawPipes();
  bird.update();
  bird.draw();

  requestAnimationFrame(gameLoop);
}

// ⌨️ Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameRunning) {
    bird.flap();
  }
});

// ▶️ Start button
document.getElementById("startBtn").addEventListener("click", () => {
  if (!gameRunning) {
    resetGame();
    gameRunning = true;
    bgMusic.currentTime = 0;
    bgMusic.play(); // 🟢 Play background music
    gameLoop();
  }
});

// Initial display
drawBackground();
bird.draw();
