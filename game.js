// Requires draw_contra_background.js


// === Simple Contra-Style Game (No Animation) ===

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
let cameraX = 0;
let score = 0;
let gamePaused = false;

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const playerImg = new Image(); // sprite sheet for the player
const enemyWalkImg = new Image(); // sprite sheet for the enemy
const enemyImg = new Image(); enemyImg.src = "assets/alien_enemy.png"; // fallback image
const bulletImg = new Image(); bulletImg.src = "assets/bullet.png";

let enemyFrameWidth = 40;
let enemyFrameHeight = 60;
const enemyFrameCount = 4;
const enemyScale = 0.25;

let assetsToLoad = 2;
function assetLoaded() {
  assetsToLoad--;
  if (assetsToLoad === 0) gameLoop();
}

playerImg.onload = () => {
  player.frameWidth = playerImg.width / player.frameCount;
  player.frameHeight = playerImg.height;
  player.w = player.frameWidth * player.scale;
  player.h = player.frameHeight * player.scale;
  console.log('Player sprite loaded:', playerImg.width, 'x', playerImg.height);
  assetLoaded();
};
playerImg.onerror = (e) => {
  console.error('Failed to load player sprite:', e);
  // Create a fallback colored rectangle
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 160; // 4 frames * 40px
  tempCanvas.height = 180; // 3 states * 60px
  const tempCtx = tempCanvas.getContext('2d');
  
  // Draw colored rectangles for each state
  tempCtx.fillStyle = '#FF0000'; // Red for idle
  tempCtx.fillRect(0, 0, 160, 60);
  tempCtx.fillStyle = '#00FF00'; // Green for running
  tempCtx.fillRect(0, 60, 160, 60);
  tempCtx.fillStyle = '#0000FF'; // Blue for jumping
  tempCtx.fillRect(0, 120, 160, 60);
  
  playerImg.src = tempCanvas.toDataURL();
};
console.log('Attempting to load player sprite from:', "assets/player_walk_sheet.png");
playerImg.src = "assets/player_walk_sheet.png";

enemyWalkImg.onload = () => {
  enemyFrameWidth = enemyWalkImg.width / enemyFrameCount;
  enemyFrameHeight = enemyWalkImg.height;
  enemies.forEach(e => {
    e.w = enemyFrameWidth * enemyScale;
    e.h = enemyFrameHeight * enemyScale;
  });
  assetLoaded();
};
enemyWalkImg.src = "enemy_walk_sheet.png";

// Sound effects
const sounds = {
  jump: new Audio('assets/jump.wav'),
  shoot: new Audio('assets/shoot.wav'),
  hit: new Audio('assets/hit.wav'),
  gameOver: new Audio('assets/game_over.wav')
};

// Preload sounds
Object.values(sounds).forEach(sound => {
  sound.load();
});

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(() => {});
  }
}

class Player {
  constructor() {
    this.x = 100;
    this.y = 400;
    this.frameWidth = 24;
    this.frameHeight = 32;
    this.scale = 0.25;
    this.w = this.frameWidth * this.scale;
    this.h = this.frameHeight * this.scale;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.health = 3;
    this.alive = true;
    this.bullets = [];
    this.lastShot = 0;
    
    // Animation properties
    this.currentFrame = 0;
    this.frameCount = 4;
    this.frameDelay = 100;
    this.lastFrameUpdate = 0;
    this.facingRight = true;
    this.state = 'idle';
  }

  update() {
    if (!this.alive) return;
    
    // Update animation
    const now = Date.now();
    if (now - this.lastFrameUpdate > this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.lastFrameUpdate = now;
    }

    // Movement logic
    this.vx = 0;
    if (keys["ArrowRight"]) {
      this.vx = 5;
      this.facingRight = true;
      this.state = 'running';
    }
    if (keys["ArrowLeft"]) {
      this.vx = -5;
      this.facingRight = false;
      this.state = 'running';
    }
    if (!keys["ArrowRight"] && !keys["ArrowLeft"]) {
      this.state = 'idle';
    }
    if (keys["Space"] && this.onGround) {
      this.vy = -10;
      this.onGround = false;
      this.state = 'jumping';
      playSound('jump');
    }
    if (keys["KeyZ"]) this.shoot();

    // Update position
    this.x += this.vx;
    this.vy += 0.5;
    this.y += this.vy;
    
    // Ground collision
    if (this.y + this.h >= canvas.height - 20) {
      this.y = canvas.height - 20 - this.h;
      this.vy = 0;
      this.onGround = true;
      if (this.state === 'jumping') {
        this.state = 'idle';
      }
    }

    // Update bullets
    this.bullets = this.bullets.filter(b => b.x < canvas.width + cameraX);
    for (let bullet of this.bullets) bullet.update();
  }

  shoot() {
    if (Date.now() - this.lastShot > 300) {
      this.bullets.push(new Bullet(this.x + this.w, this.y + this.h / 2));
      playSound('shoot');
      this.lastShot = Date.now();
    }
  }

  draw() {
    if (!playerImg.complete) {
      console.log('Image not complete, drawing placeholder');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.x - cameraX, this.y, this.w, this.h);
      return;
    }

    // Debug: Draw the entire sprite sheet first (scaled down to 25%)
    const spriteSheetScale = 0.25; // Scale down to 25%
    ctx.drawImage(playerImg, 0, 0, playerImg.width, playerImg.height,
                 10, 10,
                 playerImg.width * spriteSheetScale,
                 playerImg.height * spriteSheetScale);

    // Draw the player character
    const frameWidth = this.frameWidth;
    const frameHeight = this.frameHeight;
    const sourceX = this.currentFrame * frameWidth;
    const sourceY = 0; // first row

    ctx.save();
    if (!this.facingRight) {
      ctx.translate(this.x - cameraX + this.w, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(playerImg, sourceX, sourceY, frameWidth, frameHeight, 0, 0, this.w, this.h);
    } else {
      ctx.drawImage(playerImg, sourceX, sourceY, frameWidth, frameHeight, this.x - cameraX, this.y, this.w, this.h);
    }
    ctx.restore();

    // Draw bullets
    for (let bullet of this.bullets) bullet.draw();
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 10;
    this.speed = 10;
  }
  update() { this.x += this.speed; }
  draw() { ctx.drawImage(bulletImg, this.x - cameraX, this.y, this.w, this.h); }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.currentFrame = 0;
    this.frameDelay = 150;
    this.lastFrameUpdate = 0;
    this.w = enemyFrameWidth * enemyScale;
    this.h = enemyFrameHeight * enemyScale;
    this.vx = 1.5;
    this.health = 3;
  }

  update() {
    this.x += this.vx;
    if (this.x <= 0 || this.x + this.w >= 2000) this.vx *= -1;

    const now = Date.now();
    if (now - this.lastFrameUpdate > this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % enemyFrameCount;
      this.lastFrameUpdate = now;
    }
  }

  draw() {
    if (enemyWalkImg.complete) {
      const sx = this.currentFrame * enemyFrameWidth;
      const sy = 0;
      ctx.drawImage(enemyWalkImg, sx, sy, enemyFrameWidth, enemyFrameHeight,
                    this.x - cameraX, this.y, this.w, this.h);
    } else {
      ctx.drawImage(enemyImg, this.x - cameraX, this.y, this.w, this.h);
    }
  }
}

function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

let player = new Player();
let enemies = [ new Enemy(600, canvas.height - 80) ];

function gameLoop() {
  drawContraBackground(cameraX);

  ctx.fillStyle = "#228B22";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  cameraX = player.x - canvas.width / 3;
  if (cameraX < 0) cameraX = 0;

  player.update();
  player.draw();

  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();

    player.bullets.forEach(bullet => {
      if (isColliding(bullet, enemy)) {
        enemy.health--;
        bullet.x = canvas.width + cameraX + 100;
        if (enemy.health <= 0) score++;
      }
    });
  });

  enemies = enemies.filter(e => e.health > 0);

  ctx.fillStyle = "yellow";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, canvas.width - 140, 40);

  requestAnimationFrame(gameLoop);
}

