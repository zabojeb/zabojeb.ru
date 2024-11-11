// Array of letters to display
let letters = "zabojeb".split("");

// Array of font names to use for each letter
let fonts = ["Stick", "Barrio", "Chokokutai", "Barriecito", "Yatra One"];
let letterFonts = [];

// Interval for updating letter fonts (in milliseconds)
let interval = 550;
let lastUpdateTime = 0;

// Some variables
let background_color;
let fontSize;
let canvas;
let particlesArray = [];

function setup() {
  // Create canvas and attach it to the DOM
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas");
  textAlign(CENTER, CENTER);

  // Randomly assign a font to each letter
  letterFonts = Array(letters.length)
    .fill()
    .map(() => random(fonts));

  // Choose a random background color from the provided options
  let bgColors = [color("#0d41e1"), color("#000a71"), color("#001524")];
  background_color = random(bgColors);

  // Set the font size based on the window size
  fontSize = min(windowWidth, windowHeight) * 0.2;
  textSize(fontSize);

  // Initialize particles
  for (let i = 0; i < 150; i++) {
    particlesArray.push(new Particle());
  }
}

function draw() {
  // Draw the background
  background(background_color);

  // Update and draw the particles
  particlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  let currentTime = millis();

  // Periodically update the letter fonts
  if (currentTime - lastUpdateTime > interval) {
    letterFonts = Array(letters.length)
      .fill()
      .map(() => random(fonts));
    lastUpdateTime = currentTime;
  }

  // Draw the letters with random fonts
  let x = width / 2 - (fontSize * (letters.length - 1)) / 4;
  for (let i = 0; i < letters.length; i++) {
    textFont(letterFonts[i]);
    text(letters[i], x, height / 2);
    x += fontSize * 0.5;
  }

  // Draw the cursor crosshair
  push();
  translate(mouseX, mouseY);
  rotate(millis() / 1000);

  strokeWeight(1.5);
  stroke(255);
  noFill();

  // Draw the crosshair components
  line(-10, 0, -3, 0);
  line(0, 3, 0, 10);
  line(3, 0, 10, 0);
  line(0, -10, 0, -3);
  pop();
}

function textFont(fontName) {
  // Set the font family of the body element to the specified font name
  document.body.style.fontFamily = fontName;
}

function windowResized() {
  // Resize the canvas when the window is resized
  resizeCanvas(windowWidth, windowHeight);
  fontSize = min(windowWidth, windowHeight) * 0.2;
  textSize(fontSize);
}

class Particle {
  constructor() {
    // Initialize particle properties
    this.x = random(width);
    this.y = random(height);
    this.radius = random(1, 3);
    this.speed = random(1, 3);
    this.angle = random(0, 2 * Math.PI);
    this.hue = random(360);
    this.saturation = random(50, 100);
    this.lightness = random(50, 90);
  }

  update() {
    // Update particle position
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);

    // Gradually change the particle angle
    this.angle += random(-0.05, 0.05);

    // Add bounce effect when particles hit the edges
    if (this.x < 0 || this.x > width) {
      this.angle = Math.PI - this.angle;
      this.speed *= 0.9; // Decrease speed on bounce
    }

    if (this.y < 0 || this.y > height) {
      this.angle = -this.angle;
      this.speed *= 0.9;
    }
  }

  draw() {
    // Draw the particle as a colored circle
    fill(`hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`);
    noStroke();
    circle(this.x, this.y, this.radius);
  }
}
