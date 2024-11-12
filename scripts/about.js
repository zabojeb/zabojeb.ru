let particlesArray = [];
let background_color;
let mouseTrailPoints = [];
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas");

  let bgColors = [color("#0d41e1"), color("#000a71"), color("#001524")];
  background_color = random(bgColors);

  // Reduce particle count on mobile
  let particleCount = isMobile ? 35 : 100;
  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle());
  }
}

function draw() {
  background(background_color);

  // Only show mouse effects on non-touch devices
  if (!isMobile) {
    // Update mouse trail
    mouseTrailPoints.push({ x: mouseX, y: mouseY });
    if (mouseTrailPoints.length > 20) {
      mouseTrailPoints.shift();
    }

    // Draw connections between particles near mouse
    stroke(255, 50);
    particlesArray.forEach((particle) => {
      let d = dist(particle.x, particle.y, mouseX, mouseY);
      if (d < 100) {
        line(particle.x, particle.y, mouseX, mouseY);
      }
    });

    // Draw mouse trail
    noFill();
    stroke(255, 100);
    beginShape();
    mouseTrailPoints.forEach((point) => {
      vertex(point.x, point.y);
    });
    endShape();

    // Draw cursor
    push();
    translate(mouseX, mouseY);
    rotate(millis() / 1000);
    strokeWeight(1.5);
    stroke(255);
    noFill();
    line(-10, 0, -3, 0);
    line(0, 3, 0, 10);
    line(3, 0, 10, 0);
    line(0, -10, 0, -3);
    pop();
  }

  // Draw and update particles
  particlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });
}

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.radius = random(1, isMobile ? 2 : 3);
    this.speed = random(1, isMobile ? 2 : 3);
    this.angle = random(0, 2 * Math.PI);
    this.hue = random(360);
    this.saturation = random(50, 100);
    this.lightness = random(50, 90);
    this.originalRadius = this.radius;
  }

  update() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
    this.angle += random(-0.05, 0.05);

    // Interact with mouse only on non-mobile
    if (!isMobile) {
      let d = dist(this.x, this.y, mouseX, mouseY);
      if (d < 50) {
        this.radius = this.originalRadius * (1 + (50 - d) / 25);
      } else {
        this.radius = this.originalRadius;
      }
    }

    if (this.x < 0 || this.x > width) {
      this.angle = Math.PI - this.angle;
      this.speed *= 0.9;
    }

    if (this.y < 0 || this.y > height) {
      this.angle = -this.angle;
      this.speed *= 0.9;
    }
  }

  draw() {
    fill(`hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`);
    noStroke();
    circle(this.x, this.y, this.radius * 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Touch-friendly hover effects
if (!isMobile) {
  document.querySelectorAll(".stat-item").forEach((item) => {
    item.addEventListener("mousemove", (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      item.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), rgba(255,255,255,0.1))`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.background = "rgba(255,255,255,0.1)";
    });
  });
}
