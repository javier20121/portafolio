import { gsap } from 'gsap';

const wordEl = document.getElementById('word');
const letters = wordEl ? wordEl.querySelectorAll('span') : [];
const letterA = document.getElementById('letterA');
const canvas = document.getElementById('particles');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let animationUnlocked = false;

function startAnimation() {
  if (!canvas || animationUnlocked) return;
  animationUnlocked = true;
  window.dispatchEvent(new Event('portfolio:start-particles'));

  gsap.to(wordEl, {
    opacity: 0,
    scale: 1.03,
    duration: 0.6,
    ease: 'power1.inOut',
    onStart: () => gsap.to(canvas, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }),
    onComplete: () => { wordEl.style.visibility = 'hidden'; },
  });
}

function playIntro() {
  if (!canvas || !wordEl) return;

  animationUnlocked = false;
  gsap.killTweensOf([cursor, menu, letters, wordEl, canvas]);
  gsap.set(letters, { opacity: 0, y: 14 });
  gsap.set(wordEl, { opacity: 1, y: 0, visibility: 'visible' });
  gsap.set(canvas, { opacity: 0 });
  gsap.set(cursor, {
    opacity: 0,
    scale: 1,
    x: 0,
    y: 0,
    left: stage.clientWidth * 0.72,
    top: stage.clientHeight * 0.86,
  });
  gsap.set(menu, { opacity: 0, scale: 0.85, x: 0, y: 0 });
  if (menuItem) menuItem.classList.remove('hovered', 'pressed');
  hideMenu();

  if (reduced) {
    animationUnlocked = true;
    gsap.set(letters, { opacity: 1, y: 0 });
    gsap.set(canvas, { opacity: 1 });
    window.dispatchEvent(new Event('portfolio:draw-static'));
    return;
  }

  const tl = gsap.timeline();

  tl.to(letters, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out' })
    .to(cursor, { opacity: 1, duration: 0.3 }, '+=0.25')
    .add(() => {
      if (!letterA) return;
      const rect = letterA.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - stageRect.left;
      const y = rect.top + rect.height / 2 - stageRect.top;
      gsap.to(cursor, {
        left: x - 4,
        top: y - 20,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          showRipple(x, y);
          gsap.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 });
        },
      });
    })
    .to({}, { duration: 1.3 })
    .add(() => {
      if (!letterA || !menu) return;
      const rect = letterA.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const x = rect.right + 14 - stageRect.left;
      const y = rect.bottom + 10 - stageRect.top;
      showMenu(x, y - 12);
    })
    .to({}, { duration: 0.5 })
    .add(() => {
      if (!menuItem) return;
      const rect = menuItem.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - stageRect.left;
      const y = rect.top + rect.height / 2 - stageRect.top;
      gsap.to(cursor, {
        left: x - 4,
        top: y - 6,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          menuItem.classList.add('hovered');
          for (let i = 0; i < 7; i += 1) {
            spawnBubble(x, y);
          }
        },
      });
    })
    .to({}, { duration: 0.9 })
    .add(() => {
      if (!menuItem) return;
      const rect = menuItem.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - stageRect.left;
      const y = rect.top + rect.height / 2 - stageRect.top;
      showRipple(x, y);
      menuItem.classList.add('pressed');
      for (let i = 0; i < 16; i += 1) {
        spawnBubble(x, y);
      }
      gsap.to(cursor, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1 });
    })
    .to({}, { duration: 0.25 })
    .to(menu, { opacity: 0, scale: 0.9, duration: 0.3 }, '<')
    .to(cursor, { opacity: 0, duration: 0.25 }, '<')
    .to({}, { duration: 0.1 })
    .call(() => {
      hideMenu();
      startAnimation();
      // Forzar la visibilidad del root de React inmediatamente
      const root = document.getElementById('root');
      if (root) {
        root.style.opacity = '1';
        root.style.visibility = 'visible';
        root.style.display = 'block';
      }
    });
}

const stage = document.getElementById('stage');
const cursor = document.getElementById('cursor');
const menu = document.getElementById('menu');
const menuItem = menu?.querySelector('.menu-item.enabled');

function showRipple(x, y) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  stage?.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
}

function spawnBubble(x, y) {
  const bubble = document.createElement('span');
  bubble.className = 'bubble';
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.setProperty('--size', `${12 + Math.random() * 24}px`);
  bubble.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
  bubble.style.setProperty('--dy', `${-30 - Math.random() * 50}px`);
  stage?.appendChild(bubble);
  setTimeout(() => bubble.remove(), 900);
}

function setCursorPosition(x, y) {
  if (!cursor) return;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  cursor.style.opacity = '1';
  cursor.style.transform = 'translate(-50%, -50%) scale(1)';
}

function showMenu(x, y) {
  if (!menu) return;
  menu.style.left = `${x}px`;
  menu.style.top = `${y + 12}px`;
  menu.style.opacity = '1';
  menu.style.pointerEvents = 'auto';
  menu.style.transform = 'translate(0, 0) scale(1)';
  menu.classList.add('visible');
  menu.setAttribute('aria-hidden', 'false');
}

function hideMenu() {
  if (!menu) return;
  menu.style.opacity = '0';
  menu.style.pointerEvents = 'none';
  menu.style.transform = 'translate(-12px, -10px) scale(0.85)';
  menu.classList.remove('visible');
  menu.setAttribute('aria-hidden', 'true');
}

if (stage && cursor) {
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };

  const updateCursor = (event) => {
    const rect = stage.getBoundingClientRect();
    pointer.targetX = event.clientX - rect.left;
    pointer.targetY = event.clientY - rect.top;
    cursor.classList.add('visible');
    setCursorPosition(pointer.targetX, pointer.targetY);
  };

  window.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    updateCursor(event);
  });

  window.addEventListener('pointerdown', (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    cursor.classList.add('pressed');
    showRipple(event.clientX - stage.getBoundingClientRect().left, event.clientY - stage.getBoundingClientRect().top);
    setTimeout(() => cursor.classList.remove('pressed'), 120);
  });

  window.addEventListener('pointerup', () => cursor.classList.remove('pressed'));

  window.addEventListener('pointerleave', () => {
    cursor.classList.remove('visible');
    cursor.style.opacity = '0';
  });

  stage.addEventListener('click', (event) => {
    const rect = stage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const wordRect = wordEl?.getBoundingClientRect();
    const inWord = wordRect && event.clientX >= wordRect.left && event.clientX <= wordRect.right && event.clientY >= wordRect.top && event.clientY <= wordRect.bottom;

    if (inWord || event.target === canvas || event.target === stage) {
      event.stopPropagation();
      showMenu(x, y);
      showRipple(x, y);
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    const shouldIgnore = !menu || menu.contains(target) || target === stage || target === canvas || target.closest('#word');
    if (!shouldIgnore) {
      hideMenu();
    }
  });

  menuItem?.addEventListener('mouseenter', () => {
    menuItem.classList.add('hovered');
    const rect = menuItem.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    for (let i = 0; i < 7; i += 1) {
      spawnBubble(x, y);
    }
  });

  menuItem?.addEventListener('mouseleave', () => menuItem.classList.remove('hovered'));

  menuItem?.addEventListener('click', (event) => {
    event.stopPropagation();
    menuItem.classList.add('pressed');
    setTimeout(() => menuItem.classList.remove('pressed'), 150);
    const rect = menuItem.getBoundingClientRect();
    for (let i = 0; i < 16; i += 1) {
      spawnBubble(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    hideMenu();
  });

}

if (canvas) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
    let particles = [];
    let animationFrame;
    let animationRunning = false;
    let bounds;
    let resizeObserver;

    const getSettings = () => ({
      gap: window.innerWidth < 760 ? 4 : 5.2,
      radius: window.innerWidth < 760 ? 5 : 6,
    });

    const colorStops = [
        [255, 137, 201],
        [124, 220, 255],
        [174, 135, 255],
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

        const textCanvas = document.createElement('canvas');
        textCanvas.width = canvas.width;
        textCanvas.height = canvas.height;
        const textContext = textCanvas.getContext('2d', { willReadFrequently: true });
        textContext.setTransform(scale, 0, 0, scale, 0, 0);
        textContext.clearRect(0, 0, bounds.width, bounds.height);
        const word = 'PORTAFOLIO';
        const characters = Array.from(word);
        const baseFontSize = 100;
        const baseLetterSpacing = 4.5;
        textContext.font = `${baseFontSize}px Anton, sans-serif`;
        textContext.textAlign = 'center';
        textContext.textBaseline = 'middle';
        textContext.fillStyle = '#ffffff';
        const baseTextWidth = characters.reduce(
          (width, character) => width + textContext.measureText(character).width,
          baseLetterSpacing * (characters.length - 1),
        );
        const fontSize = Math.min(
          260,
          bounds.height * 0.3,
          bounds.width * 0.82 * baseFontSize / baseTextWidth,
        );
        const letterSpacing = baseLetterSpacing * fontSize / baseFontSize;
        textContext.font = `${fontSize}px Anton, sans-serif`;
        const characterWidths = characters.map((character) => textContext.measureText(character).width);
        const textWidth = characterWidths.reduce(
          (width, characterWidth) => width + characterWidth,
          letterSpacing * (characters.length - 1),
        );
        const startX = (bounds.width - textWidth) / 2;
        let characterX = startX;
        characters.forEach((character, index) => {
          textContext.fillText(character, characterX + characterWidths[index] / 2, bounds.height / 2);
          characterX += characterWidths[index] + letterSpacing;
        });

        const image = textContext.getImageData(0, 0, textCanvas.width, textCanvas.height);
        const nextParticles = [];
        const bubbleSprites = new Map();

        for (let y = 0; y < bounds.height; y += settings.gap) {
            for (let x = Math.floor(startX); x < Math.min(bounds.width, startX + textWidth); x += settings.gap) {
                const px = Math.floor(x * scale);
                const py = Math.floor(y * scale);
                const pixel = (py * image.width + px) * 4;
                if (image.data[pixel + 3] > 100) {
                    const targetX = x + (Math.random() - 0.5) * settings.gap * 0.5;
                    const targetY = y + (Math.random() - 0.5) * settings.gap * 0.5;
                    const radius = Math.round(settings.radius * (0.7 + Math.random() * 0.8) * 2) / 2;
                    const color = getParticleColor(Math.round(((targetX - startX) / textWidth) * 64) / 64);
                    const spriteKey = `${color}:${radius}`;
                    let sprite = bubbleSprites.get(spriteKey);
                    if (!sprite) {
                        const padding = 2;
                        const size = (radius + padding) * 2;
                        const bubbleCanvas = document.createElement('canvas');
                        bubbleCanvas.width = Math.ceil(size * scale);
                        bubbleCanvas.height = Math.ceil(size * scale);
                        const bubbleContext = bubbleCanvas.getContext('2d');
                        bubbleContext.setTransform(scale, 0, 0, scale, 0, 0);
                        const center = size / 2;

                        bubbleContext.beginPath();
                        bubbleContext.fillStyle = color;
                        bubbleContext.globalAlpha = 0.24;
                        bubbleContext.arc(center, center, radius, 0, Math.PI * 2);
                        bubbleContext.fill();

                        bubbleContext.globalAlpha = 0.82;
                        bubbleContext.strokeStyle = '#fff';
                        bubbleContext.lineWidth = Math.max(1, radius * 0.14);
                        bubbleContext.stroke();

                        bubbleContext.beginPath();
                        bubbleContext.fillStyle = '#fff';
                        bubbleContext.arc(
                          center - radius * 0.32,
                          center - radius * 0.34,
                          Math.max(0.8, radius * 0.13),
                          0,
                          Math.PI * 2,
                        );
                        bubbleContext.fill();
                        bubbleContext.globalAlpha = 1;
                        sprite = { canvas: bubbleCanvas, size };
                        bubbleSprites.set(spriteKey, sprite);
                    }
                    nextParticles.push({
                        x: targetX + (Math.random() - 0.5) * 12,
                        y: bounds.height + settings.radius + 8 + Math.random() * 80,
                        ox: targetX,
                        oy: targetY,
                        vx: 0,
                        vy: 0,
                        color,
                        sprite,
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
        if (!bounds || !animationUnlocked) {
            animationRunning = false;
            return;
        }

        context.clearRect(0, 0, bounds.width, bounds.height);

        const influence = 220;
        pointer.x += (pointer.targetX - pointer.x) * 0.15;
        pointer.y += (pointer.targetY - pointer.y) * 0.15;
        let unsettled = false;

        particles.forEach((particle) => {
          if (reduced) {
            particle.x = particle.ox;
            particle.y = particle.oy;
          }
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

            particle.vx *= 0.82;
            particle.vy *= 0.82;
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (
              Math.abs(particle.ox - particle.x) < 0.25
              && Math.abs(particle.oy - particle.y) < 0.25
              && Math.abs(particle.vx) < 0.025
              && Math.abs(particle.vy) < 0.025
            ) {
              particle.x = particle.ox;
              particle.y = particle.oy;
              particle.vx = 0;
              particle.vy = 0;
            } else {
              unsettled = true;
            }

            const rise = Math.max(0, (particle.oy - particle.y) * 0.2);
            const alpha = Math.min(1, 0.35 + rise / 80);

            context.globalAlpha = alpha;
            context.drawImage(
              particle.sprite.canvas,
              particle.x - particle.sprite.size / 2,
              particle.y - particle.sprite.size / 2,
              particle.sprite.size,
              particle.sprite.size,
            );
        });
        context.globalAlpha = 1;
        pointer.active = false;

        if (!reduced && unsettled) {
            animationFrame = requestAnimationFrame(draw);
        } else {
            animationRunning = false;
        }
    };

    const scheduleDraw = () => {
      if (reduced || animationRunning || !animationUnlocked) return;
      animationRunning = true;
      animationFrame = requestAnimationFrame(draw);
    };

    const updatePointer = (event) => {
        const point = event.touches ? event.touches[0] : event;
        pointer.targetX = point.clientX - bounds.left;
        pointer.targetY = point.clientY - bounds.top;
        pointer.active = true;
        scheduleDraw();
    };

    window.addEventListener('portfolio:draw-static', () => {
      if (reduced) draw(performance.now());
    });
    window.addEventListener('portfolio:start-particles', () => {
      scheduleDraw();
    });

    canvas.addEventListener('mousemove', updatePointer);
    canvas.addEventListener('touchmove', updatePointer, { passive: true });
    canvas.addEventListener('mouseleave', () => { pointer.active = false; });
    canvas.addEventListener('touchend', () => { pointer.active = false; });

    resizeObserver = new ResizeObserver(() => {
      createParticles();
      if (reduced && animationUnlocked) draw(performance.now());
      else scheduleDraw();
    });
    resizeObserver.observe(canvas);
    createParticles();
    document.fonts?.ready.then(() => {
      createParticles();
      if (reduced && animationUnlocked) draw(performance.now());
      else scheduleDraw();
    });
}

playIntro();
