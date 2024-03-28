let bugs = [];
let squishMarks = [];
let score = 0;
let gameDuration = 30;
let startTime;
let gameRunning = false;
let spiderImg, deadSpider;

let squishSynth, missSynth, backgroundMusic, endGameSynth;

function preload() {
  spiderImg = loadImage('assets/Spider.png');
  deadSpider = loadImage('assets/deadSpider.png');
}

function setup() {
  createCanvas(800, 600);
  setupAudio();
  loadBackgroundMusic('assets/backgroundMusic.mp3');
  createStartButton();
}

function setupAudio() {
  squishSynth = new Tone.Synth({
    oscillator: { type: "sine" }
  }).toDestination();

  missSynth = new Tone.MembraneSynth().toDestination();

  endGameSynth = new Tone.PolySynth(Tone.Synth, {
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
  }).toDestination();
}

function loadBackgroundMusic(url) {
  backgroundMusic = new Tone.Player({
    url: url,
    loop: true
  }).toDestination();

  Tone.loaded().then(() => {
    console.log("All audio files loaded");
  });
}

function createStartButton() {
  const startButton = createButton('Start Game');
  startButton.position(10, height + 10);

  startButton.elt.addEventListener('click', function() {
    startGame();
    gameRunning = true;
  });
}


function startGame() {
  if (Tone.context.state !== 'runing') {
    Tone.start().then(() => {
      console.log("Audio context started");
      backgroundMusic.start();
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
  
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }
  

  display() {
    let angle = atan2(this.dirY, this.dirX);
  
    push();
    translate(this.x, this.y);
    rotate(angle + HALF_PI);
    imageMode(CENTER);
    image(spiderImg, 0, 0, this.size, this.size);
    pop();
  }

  checkSquish(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    if (d < this.size) {
      squishSynth.triggerAttackRelease("C4", "8n");
      squishMarks.push({x: this.x, y: this.y});
      
      this.x = random(width);
      this.y = random(height);
      this.dirX = random(-1, 1);
      this.dirY = random(-1, 1);
      
      score++;
    }
    else{
      missSynth.triggerAttackRelease("A1", "8n");
    }
  }
}