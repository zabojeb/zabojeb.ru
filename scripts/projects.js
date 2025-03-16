let particlesArray = [];
let background_color;
let mouseTrailPoints = [];
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let projectCards = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas");

  let bgColors = [color("#0d41e1"), color("#000a71"), color("#001524")];
  background_color = random(bgColors);

  let particleCount = isMobile ? 35 : 100;
  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle());
  }

  document.querySelectorAll(".project-card").forEach((card, index) => {
    projectCards.push({
      element: card,
      particles: [],
      maxParticles: 10,
    });

    card.addEventListener("mouseenter", () => {
      createCardEffect(index);
    });

    card.style.setProperty("--i", index + 1);
  });

  document.querySelectorAll(".project-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      createClickRipple(e);

      setTimeout(() => {
        window.location.href = link.getAttribute("href");
      }, 400);
    });
  });
}

function createCardEffect(cardIndex) {
  const card = projectCards[cardIndex];
  const rect = card.element.getBoundingClientRect();

  card.particles = [];

  for (let i = 0; i < card.maxParticles; i++) {
    const side = Math.floor(random(4));
    let x, y;

    switch (side) {
      case 0:
        x = random(rect.left, rect.right);
        y = rect.top;
        break;
      case 1:
        x = rect.right;
        y = random(rect.top, rect.bottom);
        break;
      case 2:
        x = random(rect.left, rect.right);
        y = rect.bottom;
        break;
      case 3:
        x = rect.left;
        y = random(rect.top, rect.bottom);
        break;
    }

    card.particles.push({
      x,
      y,
      xSpeed: random(-1, 1),
      ySpeed: random(-1, 1),
      size: random(2, 4),
      life: 255,
      hue: random(180, 240),
    });
  }
}

function createClickRipple(e) {
  const ripple = document.createElement("span");
  const rect = e.currentTarget.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ripple.style.width = ripple.style.height = `${
    Math.max(rect.width, rect.height) * 2
  }px`;
  ripple.style.left = `${x - ripple.offsetWidth / 2}px`;
  ripple.style.top = `${y - ripple.offsetHeight / 2}px`;
  ripple.className = "ripple";

  e.currentTarget.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function draw() {
  background(background_color);

  // Update and draw card particles
  projectCards.forEach((card) => {
    for (let i = card.particles.length - 1; i >= 0; i--) {
      let p = card.particles[i];
      p.x += p.xSpeed;
      p.y += p.ySpeed;
      p.life -= 3;

      if (p.life <= 0) {
        card.particles.splice(i, 1);
      } else {
        fill(`hsla(${p.hue}, 80%, 70%, ${p.life / 255})`);
        noStroke();
        circle(p.x, p.y, p.size);
      }
    }
  });

  if (!isMobile) {
    mouseTrailPoints.push({ x: mouseX, y: mouseY, age: 255 });
    if (mouseTrailPoints.length > 25) {
      mouseTrailPoints.shift();
    }

    stroke(255, 30);
    particlesArray.forEach((particle) => {
      let d = dist(particle.x, particle.y, mouseX, mouseY);
      if (d < 150) {
        strokeWeight(map(d, 0, 150, 2, 0.5));
        line(particle.x, particle.y, mouseX, mouseY);
      }
    });

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

document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    .project-link {
      position: relative;
      overflow: hidden;
    }
    .ripple {
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }
    @keyframes ripple {
      to {
        transform: scale(1);
        opacity: 0;
      }
    }
  </style>
`
);
