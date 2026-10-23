/**
 * Backup de la implementación de Fondo Animado WebGL (Lila)
 * Para restaurar:
 * 1. Copiar este contenido a components/hero-background.js
 * 2. Asegurar que index.html tenga <canvas id="hero-canvas"></canvas>
 * 3. Asegurar que style.css tenga el estilo para #hero-canvas
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export function initHeroBackground() {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Geometría Orgánica en color Lila
    const geometry = new THREE.IcosahedronGeometry(12, 30);
    const material = new THREE.MeshStandardMaterial({
        color: 0xda70d6, // Color lila (Orchid)
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Iluminación mejorada
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0x404040, 1));

    camera.position.z = 20;

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.0005;

        sphere.rotation.y += 0.0015;
        sphere.rotation.x += 0.001;

        sphere.scale.x = 1 + Math.sin(time) * 0.05;
        sphere.scale.y = 1 + Math.cos(time) * 0.05;
        sphere.scale.z = 1 + Math.sin(time * 0.5) * 0.05;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}
