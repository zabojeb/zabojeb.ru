let particlesArray = [];
let background_color;
let mouseTrailPoints = [];
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let linkParticles = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas");

  let bgColors = [color("#0d41e1"), color("#000a71"), color("#001524")];
  background_color = random(bgColors);

  let particleCount = isMobile ? 35 : 100;
  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle());
  }

  // Initialize link particles
  document.querySelectorAll(".contact-link").forEach((link) => {
    linkParticles.push(new LinkParticle(link));
  });
}

class LinkParticle {
  constructor(element) {
    this.element = element;
    this.originalBg = window.getComputedStyle(element).backgroundColor;
    this.particles = [];
    this.maxParticles = 25;

    element.addEventListener("mouseenter", () => {
      this.createBurstEffect();
      this.element.style.transform = "scale(1.1)";
    });

    element.addEventListener("mouseleave", () => {
      this.particles = [];
      this.element.style.transform = "scale(1)";
    });
  }

  createBurstEffect() {
    const rect = this.element.getBoundingClientRect();
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        angle: random(TWO_PI),
        speed: random(2, 5),
        size: random(2, 4),
        life: 255,
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += cos(p.angle) * p.speed;
      p.y += sin(p.angle) * p.speed;
      p.life -= 5;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.particles.forEach((p) => {
      noStroke();
      fill(255, p.life);
      circle(p.x, p.y, p.size);
    });
  }
}

function draw() {
  background(background_color);

  // Update and draw link particles
  linkParticles.forEach((lp) => {
    lp.update();
    lp.draw();
  });

  // VISUAL BUG FIX: Clear the mouse trail if the mouse has moved too far
  if (
    mouseTrailPoints.length > 0 &&
    (Math.abs(mouseTrailPoints[mouseTrailPoints.length - 1].x - mouseX) >
      width / 4 ||
      Math.abs(mouseTrailPoints[mouseTrailPoints.length - 1].y - mouseY) >
        height / 4)
  ) {
    mouseTrailPoints = [];
  }
  // END OF THE FIX

  if (!isMobile) {
    // Enhanced mouse trail
    mouseTrailPoints.push({ x: mouseX, y: mouseY, age: 255 });
    if (mouseTrailPoints.length > 25) {
      mouseTrailPoints.shift();
    }

    // Draw enhanced connections
    stroke(255, 30);
    particlesArray.forEach((particle) => {
      let d = dist(particle.x, particle.y, mouseX, mouseY);
      if (d < 150) {
        strokeWeight(map(d, 0, 150, 2, 0.5));
        line(particle.x, particle.y, mouseX, mouseY);
      }
    });

    // Draw enhanced mouse trail
    noFill();
    beginShape();
    mouseTrailPoints.forEach((point, index) => {
      point.age -= 200;
      stroke(255, point.age);
      strokeWeight(map(index, 0, mouseTrailPoints.length, 0.5, 2));
      vertex(point.x, point.y);
    });
    endShape();

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
    this.pulseSpeed = random(0.02, 0.05);
    this.pulseOffset = random(TWO_PI);
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
    this.radius =
      this.originalRadius *
      (1 + 0.2 * sin(millis() * this.pulseSpeed + this.pulseOffset));

    particlesArray.forEach((other) => {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d < 50) {
          stroke(255, map(d, 0, 50, 50, 0));
          line(this.x, this.y, other.x, other.y);
        }
      }
    });
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
