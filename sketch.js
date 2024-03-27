// Make sure to include Tone.js in your HTML or as an import if using modules

let bugs = [];
let squishMarks = []; 
let score = 0;
let gameDuration = 30;
let startTime;
let gameRunning = false;
let spiderImg, deadSpider;

// Audio components
let squishSynth, missSynth, backgroundMusic, endGameSynth;

function preload() {
  spiderImg = loadImage('assets/Spider.png');
  deadSpider = loadImage('assets/deadSpider.png');
}

function setup() {
  createCanvas(800, 600);
  setupAudio();
  loadBackgroundMusic('assets/backgroundMusic.mp3');
}

function setupAudio() {
  // For squishing bugs
  squishSynth = new Tone.Synth({
    oscillator: { type: "sine" }
  }).toDestination();

  // For missing a bug
  missSynth = new Tone.MembraneSynth().toDestination();

  // End game sound
  endGameSynth = new Tone.PolySynth(Tone.Synth, {
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
  }).toDestination();
}

// Loads and sets up the background music for looping
function loadBackgroundMusic(url) {
  backgroundMusic = new Tone.Player({
    url: url,
    loop: true
  }).toDestination();

  // Wait for all buffers to load before enabling game start
  Tone.loaded().then(() => {
    console.log("All audio files loaded");
    // Enable start game functionality here, e.g., display a start button
  });
}

// Function to start the game, intended to be called by a user action like clicking a 'Start Game' button
function startGame() {
  if (Tone.context.state !== 'running') {
    Tone.start().then(() => {
      console.log("Audio context started");
      backgroundMusic.start();
      // Reset or initialize game variables
      gameRunning = true;
      score = 0;
      bugs = [];
      squishMarks = [];
      startTime = millis();
      for (let i = 0; i < 5; i++) {
        bugs.push(new Bug(random(width), random(height)));
      }
    });
  }
}

function draw() {
  if (!gameRunning) return;

  background(220);
  let currentTime = millis();
  let timeLeft = gameDuration - ((currentTime - startTime) / 1000);

  if (timeLeft <= 0) {
    gameRunning = false;
    displayEndGame();
  }

  updateBugSpeed();
  displayHUD(timeLeft);

  for (let i = bugs.length - 1; i >= 0; i--) {
    bugs[i].move();
    bugs[i].display();
  }

  squishMarks.forEach(mark => {
    image(deadSpider, mark.x, mark.y, 20, 20);
  });
}

function mousePressed() {
  if (!gameRunning) return;
  for (let i = bugs.length - 1; i >= 0; i--) {
    if (bugs[i].checkSquish(mouseX, mouseY)) {
      squishSynth.triggerAttackRelease("C4", "8n");
      score++;
      squishMarks.push({x: bugs[i].x, y: bugs[i].y});
      bugs.splice(i, 1); // Remove squished bug
    }
  }
}

function updateBugSpeed() {
  let speedIncrease = score;
  bugs.forEach(bug => {
    bug.speed = 2 + speedIncrease * 0.05;
  });
}

function displayHUD(timeLeft) {
  textSize(32);
  fill(0);
  text(`Time: ${timeLeft.toFixed(1)}`, 10, 30);
  text(`Score: ${score}`, 10, 70);
}

function displayEndGame() {
  textSize(64);
  textAlign(CENTER, CENTER);
  text("Game Over!", width / 2, height / 2);
  text(`Final Score: ${score}`, width / 2, height / 2 + 70);
  backgroundMusic.stop();
  endGameSynth.triggerAttackRelease(["C4", "E4", "G4"], "2n");
}

class Bug {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.dirX = random(-1, 1);
    this.dirY = random(-1, 1);
    this.speed = 2;
  }

  move() {
    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;
  
    // Wrap the bug around the screen to appear from the other side
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }
  

  display() {
    // Calculate the angle of movement
    let angle = atan2(this.dirY, this.dirX);
  
    push(); // Start a new drawing state
    translate(this.x, this.y); // Move to bug's location
    rotate(angle + HALF_PI); // Rotate to the direction of movement; adjust as needed
    imageMode(CENTER); // Ensure the image is centered on its position
    image(spiderImg, 0, 0, this.size, this.size); // Draw the spider image
    pop(); // Restore original state
  }

  checkSquish(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    if (d < this.size) {
      squishSynth.triggerAttackRelease("C4", "8n");
      squishMarks.push({x: this.x, y: this.y}); // Leave a mark where the bug was squished
      
      // Respawn the bug at a new location with a new random direction
      this.x = random(width);
      this.y = random(height);
      this.dirX = random(-1, 1);
      this.dirY = random(-1, 1);
      
      // Increment the score
      score++;
    }
    else{
      missSynth.triggerAttackRelease("A1", "8n");
    }
  }
}