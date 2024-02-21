let bugs = [];
let squishMarks = []; 
let score = 0;
let gameDuration = 30;
let startTime;
let gameRunning = false;
let spiderImg;
let deadSpider

function preload() {
  spiderImg = loadImage('assets/spider.png');
  deadSpider = loadImage('assets/deadSpider.png');
}

function setup() {
  createCanvas(800, 600);
  startTime = millis();
  gameRunning = true;
  // Initialize bugs
  for (let i = 0; i < 5; i++) {
    bugs.push(new Bug(random(width), random(height)));
  }
}

function draw() {
  background(220);
  let currentTime = millis();
  let timeLeft = gameDuration - ((currentTime - startTime) / 1000);

  if (timeLeft <= 0) {
    gameRunning = false;
    timeLeft = 0;
    displayEndGame();
  }

  if (gameRunning) {
    updateBugSpeed();
    textSize(32);
    fill(0);
    text(`Time: ${timeLeft.toFixed(1)}`, 10, 30);
    text(`Score: ${score}`, 10, 70);

    // Update and display bugs
    for (let i = bugs.length - 1; i >= 0; i--) {
      bugs[i].move();
      bugs[i].display();
      if (bugs[i].isSquished) {
        bugs.splice(i, 1);
        score++;
        // Optionally, make the game harder by adding a new bug or increasing speed
      }
    }
    fill(0, 255, 0); // Set fill to green
    squishMarks.forEach(mark => {
      image(deadSpider, mark.x, mark.y, 20, 20); // Draw a green circle
    });
  }
}

function mousePressed() {
  for (let i = 0; i < bugs.length; i++) {
    bugs[i].checkSquish(mouseX, mouseY);
  }
}

function updateBugSpeed() {
  // Define how the score affects the bug speed
  let speedIncrease = score; // Adjust this value to balance the game difficulty
  bugs.forEach(bug => {
    bug.speed = 2 + speedIncrease; // Update each bug's speed based on the current score
  });
}

function displayEndGame() {
  textSize(64);
  textAlign(CENTER, CENTER);
  text("Game Over!", width / 2, height / 2);
  text(`Final Score: ${score}`, width / 2, height / 2 + 70);
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
      squishMarks.push({x: this.x, y: this.y}); // Leave a mark where the bug was squished
      
      // Respawn the bug at a new location with a new random direction
      this.x = random(width);
      this.y = random(height);
      this.dirX = random(-1, 1);
      this.dirY = random(-1, 1);
      
      // Increment the score
      score++;
    }
  }
}