const stage = document.getElementById('stage');
const wordEl = document.getElementById('word');
const letters = wordEl ? wordEl.querySelectorAll('span') : [];
const letterA = document.getElementById('letterA');
const canvas = document.getElementById('particles');
const cursor = document.getElementById('cursor');
const menu = document.getElementById('menu');
const toqueUnico = document.getElementById('toqueUnico');
const replayBtn = document.getElementById('replay');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let animationUnlocked = false;

function rand(max = 1, min = 0, dec = 0) {
  return +(min + Math.random() * (max - min)).toFixed(dec);
}

function center(el) {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function ripple(x, y) {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  stage.appendChild(r);
  gsap.to(r, { scale: 3.2, opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => r.remove() });
}

function resetState() {
  gsap.killTweensOf([cursor, menu, letters, wordEl, canvas]);
  gsap.set(letters, { opacity: 0, y: 14 });
  gsap.set(wordEl, { opacity: 1 });
  gsap.set(canvas, { opacity: 0 });
  gsap.set(cursor, { opacity: 0, x: window.innerWidth * 0.72, y: window.innerHeight * 0.86 });
  gsap.set(menu, { opacity: 0, scale: 0.85, x: 0, y: 0 });
  if (toqueUnico) {
    toqueUnico.classList.remove('hovered', 'pressed');
  }
}

function startAnimation() {
  if (!canvas || animationUnlocked) return;

  animationUnlocked = true;

  const wordTimeline = gsap.timeline();
  wordTimeline
    .to(menu, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.inOut' })
    .to(cursor, { opacity: 0, duration: 0.25 }, 0)
    .to(wordEl, {
      opacity: 0,
      scale: 1.03,
      y: -18,
      duration: 0.7,
      ease: 'power2.inOut',
      onStart: () => {
        gsap.to(canvas, { opacity: 1, duration: 0.45, ease: 'power2.out' });
      }
    }, 0.05)
    .call(() => {
      if (wordEl) {
        wordEl.style.visibility = 'hidden';
      }
    }, [], 0.7);

  if (toqueUnico) {
    toqueUnico.classList.add('pressed');
  }
}

function playIntro() {
  if (reduced) {
    resetState();
    gsap.set(letters, { opacity: 1, y: 0 });
    gsap.set(canvas, { opacity: 1 });
    return;
  }

  resetState();

  const tl = gsap.timeline();

  tl.to(letters, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out' })
    .to(cursor, { opacity: 1, duration: 0.3 }, '+=0.3')
    .add(() => {
      const c = center(letterA);
      gsap.to(cursor, {
        x: c.x - 4,
        y: c.y - 20,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          ripple(c.x, c.y);
          gsap.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 });
        }
      });
    })
    .to({}, { duration: 1.3 })
    .add(() => {
      const r = letterA.getBoundingClientRect();
      gsap.set(menu, { x: r.right + 14, y: r.bottom + 10 });
      gsap.to(menu, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' });
    })
    .to({}, { duration: 0.5 })
    .add(() => {
      const t = center(toqueUnico);
      gsap.to(cursor, {
        x: t.x - 4,
        y: t.y - 6,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          if (toqueUnico) toqueUnico.classList.add('hovered');
        }
      });
    })
    .to({}, { duration: 0.9 })
    .add(() => {
      const t = center(toqueUnico);
      ripple(t.x - 4, t.y - 6);
      if (toqueUnico) toqueUnico.classList.add('pressed');
      gsap.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 });
    })
    .to({}, { duration: 0.25 })
    .call(() => {
      startAnimation();
    });
}

if (canvas) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
    let particles = [];
    let animationFrame;
    let bounds;
    let resizeObserver;
    let animationStartTime = 0;

    const getSettings = () => ({
        gap: window.innerWidth < 800 ? 3.5 : 4.8,
        radius: window.innerWidth < 800 ? 3.2 : 4.4,
        fontSize: Math.min(window.innerWidth * 0.12, 200),
    });

    const colorStops = [
      [255, 238, 74],
      [0, 238, 255],
      [255, 76, 166],
    ];

    const getParticleColor = (position) => {
        const scaledPosition = Math.min(1, Math.max(0, position)) * (colorStops.length - 1);
        const firstStop = Math.floor(scaledPosition);
        const secondStop = Math.min(colorStops.length - 1, firstStop + 1);
        const blend = scaledPosition - firstStop;
        const color = colorStops[firstStop].map((channel, channelIndex) => (
            Math.round(channel + (colorStops[secondStop][channelIndex] - channel) * blend)
        ));
        return `rgb(${color.join(', ')})`;
    };

    const createParticles = () => {
        const settings = getSettings();
        const scale = window.devicePixelRatio || 1;
        bounds = canvas.getBoundingClientRect();
        canvas.width = bounds.width * scale;
        canvas.height = bounds.height * scale;
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.clearRect(0, 0, bounds.width, bounds.height);
        animationStartTime = 0;

        const textCanvas = document.createElement('canvas');
        textCanvas.width = canvas.width;
        textCanvas.height = canvas.height;
        const textContext = textCanvas.getContext('2d', { willReadFrequently: true });
        textContext.setTransform(scale, 0, 0, scale, 0, 0);
        textContext.clearRect(0, 0, bounds.width, bounds.height);
        textContext.font = `700 ${settings.fontSize}px Arial, sans-serif`;
        textContext.textAlign = 'center';
        textContext.textBaseline = 'middle';
        textContext.fillStyle = '#ffffff';
        textContext.fillText('PORTAFOLIO', bounds.width / 2, bounds.height / 2);

        const textWidth = textContext.measureText('PORTAFOLIO').width;
        const textX = bounds.width / 2;
        const startX = Math.max(0, textX - textWidth / 2);
        const image = textContext.getImageData(0, 0, textCanvas.width, textCanvas.height);
        const nextParticles = [];

        for (let y = 0; y < bounds.height; y += settings.gap) {
            for (let x = Math.floor(startX); x < Math.min(bounds.width, startX + textWidth); x += settings.gap) {
                const px = Math.floor(x * scale);
                const py = Math.floor(y * scale);
                const pixel = (py * image.width + px) * 4;
                if (image.data[pixel + 3] > 100) {
                    const targetX = x + (Math.random() - 0.5) * settings.gap * 0.5;
                    const targetY = y + (Math.random() - 0.5) * settings.gap * 0.5;
                    nextParticles.push({
                        x: targetX + (Math.random() - 0.5) * 30,
                        y: bounds.height + 50 + Math.random() * 220,
                        ox: targetX,
                        oy: targetY,
                        vx: 0,
                        vy: 0,
                        radius: settings.radius * (0.7 + Math.random() * 0.8),
                        color: getParticleColor((targetX - startX) / textWidth),
                    });
                }
            }
        }

        for (let particleIndex = nextParticles.length - 1; particleIndex > 0; particleIndex -= 1) {
            const randomIndex = Math.floor(Math.random() * (particleIndex + 1));
            [nextParticles[particleIndex], nextParticles[randomIndex]] = [nextParticles[randomIndex], nextParticles[particleIndex]];
        }

        particles = nextParticles;
    };

    const draw = (timestamp) => {
        if (!bounds) {
            return;
        }

        if (!animationStartTime) {
            animationStartTime = timestamp;
        }

        context.clearRect(0, 0, bounds.width, bounds.height);

        if (!animationUnlocked) {
            if (!reduced) {
                animationFrame = requestAnimationFrame(draw);
            }
            return;
        }

        const influence = 220;
        pointer.x += (pointer.targetX - pointer.x) * 0.15;
        pointer.y += (pointer.targetY - pointer.y) * 0.15;

        particles.forEach((particle) => {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distance = Math.hypot(dx, dy);

            if (pointer.active && distance < influence && distance > 0) {
                const force = ((influence - distance) / influence) * 4.8;
                const pushX = (dx / distance) * force;
                const pushY = (dy / distance) * force;
                particle.vx += pushX;
                particle.vy += pushY;
            }

            const restoreX = (particle.ox - particle.x) * 0.08;
            const restoreY = (particle.oy - particle.y) * 0.08;
            particle.vx += restoreX;
            particle.vy += restoreY;

            particle.vx += Math.sin((particle.y + particle.x) * 0.02) * 0.02;
            particle.vy += Math.cos((particle.x - particle.y) * 0.02) * 0.02;

            particle.vx *= 0.82;
            particle.vy *= 0.82;
            particle.x += particle.vx;
            particle.y += particle.vy;

            const rise = Math.max(0, (particle.oy - particle.y) * 0.2);
            const alpha = Math.min(1, 0.8 + rise / 120);

            context.beginPath();
            context.shadowBlur = 8;
            context.shadowColor = 'rgba(0, 0, 0, 0.8)';
            context.fillStyle = particle.color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();
            context.shadowBlur = 0;
        });

        if (!reduced) {
            animationFrame = requestAnimationFrame(draw);
        }
    };

    const updatePointer = (event) => {
        const point = event.touches ? event.touches[0] : event;
        pointer.targetX = point.clientX - bounds.left;
        pointer.targetY = point.clientY - bounds.top;
        pointer.active = true;
    };

    canvas.addEventListener('mousemove', updatePointer);
    canvas.addEventListener('touchmove', updatePointer, { passive: true });
    canvas.addEventListener('mouseleave', () => { pointer.active = false; });
    canvas.addEventListener('touchend', () => { pointer.active = false; });

    resizeObserver = new ResizeObserver(createParticles);
    resizeObserver.observe(canvas);
    createParticles();
    draw(performance.now());
}

if (toqueUnico) {
  toqueUnico.style.pointerEvents = 'none';
}

if (replayBtn) {
  replayBtn.addEventListener('click', playIntro);
}

playIntro();

