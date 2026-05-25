/**
 * Muskan Singla's 24th Birthday Website Logic
 * Handles Web Audio API Synthesizer, Three.js 3D WebGL scenes, GSAP animations,
 * Confetti bursts, Cursor sparkle trails, and interactive overlays.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DESIGN THE WISHES ARRAY ---
    const wishes = [
        "May every dream you dare to dream come true this year 🌟",
        "May you always find reasons to smile, even on the hardest days 🌸",
        "May your 24th year be your most adventurous yet ✈️",
        "May love, success, and laughter follow you everywhere 💖",
        "May you always know how deeply you are loved 🥰",
        "May your confidence be unshakeable and your heart be fearless 💪",
        "May this year bring you clarity, purpose, and joy beyond measure ✨",
        "May every door you knock on open wide for you 🚪",
        "May your kindness continue to touch lives and light up the world 🌎",
        "May you find magic in the ordinary moments of life 🦋",
        "May your path be lined with peace, warmth, and cozy moments ☕",
        "May your laughter be loud, your worries be quiet, and your dreams be giant 🎈",
        "May you grow stronger through every challenge and wiser with every step 🌱",
        "May your creativity flow limitlessly and bring you endless pride 🎨",
        "May you surround yourself with souls who lift you higher and love you truest 🤝",
        "May you always celebrate the wonderful, unique person you are 👑",
        "May your health be robust and your energy be boundlessly radiant ⚡",
        "May you achieve every milestone you set your eyes on this year 🏆",
        "May you find beauty in beginnings and peace in completions 🌅",
        "May your heart be a sanctuary of gratitude, love, and light 🏛️",
        "May you always have the courage to take up space and speak your truth 📣",
        "May your days be filled with warm sun rays and your nights with sweet dreams 🌙",
        "May this year bring you closer to your truest, happiest self 🌸",
        "May Muskan's name always be synonymous with joy and success! 🎉"
    ];

    // --- DESIGN THE QUOTES ARRAY ---
    const quotes = [
        { text: "She is clothed in strength and dignity, and she laughs without fear of the future.", author: "Proverbs 31:25" },
        { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
        { text: "A sister is both your mirror and your opposite.", author: "Elizabeth Fishel" },
        { text: "The most beautiful thing you can wear is confidence.", author: "Blake Lively" },
        { text: "Do not wait for the perfect moment — take the moment and make it perfect.", author: "Unknown" },
        { text: "At 24, the whole world is still yours to conquer. Go get it, queen.", author: "Unknown" },
        { text: "A sister is a gift to the heart, a friend to the spirit, a golden thread to the meaning of life.", author: "Isadora James" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Always be a first-rate version of yourself, instead of a second-rate version of somebody else.", author: "Judy Garland" },
        { text: "Here's to the nights that turned into memories, and the sister who turned into a best friend.", author: "Unknown" }
    ];

    // --- 1. PROCEDURAL MUSIC & SOUNDS (WEB AUDIO API + MP3 FALLBACK) ---
    class AudioManager {
        constructor() {
            this.ctx = null;
            this.audioEl = null;
            this.isMuted = true;
            this.synthInterval = null;
            this.melodyNoteIndex = 0;
            this.isUsingSynth = false;

            // Soft luxury ambient progression: Cmaj7 - Am7 - Fmaj7 - Gmaj7
            this.chords = [
                [60, 64, 67, 71], // Cmaj7
                [57, 60, 64, 67], // Am7
                [53, 57, 60, 64], // Fmaj7
                [55, 59, 62, 66]  // Gmaj7
            ];
            this.chordIndex = 0;
        }

        init() {
            // Setup HTML Audio element for MP3
            this.audioEl = new Audio();
            this.audioEl.src = 'assets/bgm.mp3';
            this.audioEl.loop = true;
            this.audioEl.volume = 0.5;

            this.audioEl.addEventListener('error', () => {
                console.warn("BGM MP3 load failed. Using procedural Web Audio synthesizer.");
                this.isUsingSynth = true;
            });
        }

        startAudio() {
            if (this.ctx) return;
            
            // Initialize Audio Context on click
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.isMuted = false;
            document.getElementById('audio-toggle').classList.remove('muted');

            if (this.isUsingSynth) {
                this.startSynth();
            } else {
                this.audioEl.play().catch(err => {
                    console.warn("Autoplay failed, falling back to Web Audio Synthesizer:", err);
                    this.isUsingSynth = true;
                    this.startSynth();
                });
            }
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            const btn = document.getElementById('audio-toggle');
            
            if (this.isMuted) {
                btn.classList.add('muted');
                if (this.isUsingSynth) {
                    this.stopSynth();
                } else {
                    this.audioEl.pause();
                }
            } else {
                btn.classList.remove('muted');
                // Resume Context if suspended
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                
                if (this.isUsingSynth) {
                    this.startSynth();
                } else {
                    this.audioEl.play().catch(() => {
                        this.isUsingSynth = true;
                        this.startSynth();
                    });
                }
            }
        }

        // Web Audio Synthesizer Code
        startSynth() {
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();

            this.stopSynth(); // Clear existing loops

            // Main Synth Loop - plays chords and chimes procedurally
            const playStep = () => {
                if (this.isMuted) return;

                // Play soft chord
                const chordNotes = this.chords[this.chordIndex];
                chordNotes.forEach((midiNote, idx) => {
                    this.playPianoNote(midiNote, 0.08, idx * 0.05, 3.5);
                });

                // Generate a random sweet melody note
                const chord = this.chords[this.chordIndex];
                const melodyNote = chord[Math.floor(Math.random() * chord.length)] + 12; // Octave up
                this.playChimeNote(melodyNote, 0.04, 0.8, 2.0);
                
                // Advance chord structure
                this.chordIndex = (this.chordIndex + 1) % this.chords.length;
            };

            playStep();
            this.synthInterval = setInterval(playStep, 4000);
        }

        stopSynth() {
            if (this.synthInterval) {
                clearInterval(this.synthInterval);
                this.synthInterval = null;
            }
        }

        midiToFreq(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }

        playPianoNote(midiNote, volume, delay, duration) {
            const freq = this.midiToFreq(midiNote);
            const time = this.ctx.currentTime + delay;

            // Oscillators
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'triangle';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(freq, time);
            osc2.frequency.setValueAtTime(freq * 1.002, time); // Subtle detune

            // Filter (Lowpass to make it warm and soft)
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, time);
            filter.frequency.exponentialRampToValueAtTime(100, time + duration);

            // Envelope Gain
            const gainNode = this.ctx.createGain();
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(volume, time + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            // Connections
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + duration);
            osc2.stop(time + duration);
        }

        playChimeNote(midiNote, volume, delay, duration) {
            const freq = this.midiToFreq(midiNote);
            const time = this.ctx.currentTime + delay;

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            // High filter for bell chime sound
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(freq * 1.5, time);

            const gainNode = this.ctx.createGain();
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(volume, time + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, time + duration);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + duration);
        }
    }

    const musicPlayer = new AudioManager();
    musicPlayer.init();

    // Attach to audio toggle button
    document.getElementById('audio-toggle').addEventListener('click', () => {
        musicPlayer.toggleMute();
    });


    // --- 2. GLOBAL BACKROUND STARS CANVAS ---
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    let stars = [];
    const starCount = 120;

    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);

    class Star {
        constructor() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.alpha = Math.random();
            this.speed = Math.random() * 0.15 + 0.05;
            this.color = Math.random() > 0.5 ? '#B76E79' : '#D4AF37'; // Rose Gold or Champagne Gold
        }

        update() {
            this.y -= this.speed;
            if (this.y < 0) {
                this.y = bgCanvas.height;
                this.x = Math.random() * bgCanvas.width;
            }
            this.alpha = Math.sin(Date.now() * 0.001 * this.speed + this.size) * 0.4 + 0.6;
        }

        draw() {
            bgCtx.save();
            bgCtx.globalAlpha = this.alpha;
            bgCtx.fillStyle = this.color;
            bgCtx.shadowBlur = 10;
            bgCtx.shadowColor = this.color;
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            bgCtx.fill();
            bgCtx.restore();
        }
    }

    // Populate Background Stars
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    function animateBackground() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        requestAnimationFrame(animateBackground);
    }
    animateBackground();


    // --- 3. CURSOR SPARKLE TRAIL ---
    const trailCanvas = document.getElementById('trail-canvas');
    const trailCtx = trailCanvas.getContext('2d');

    let trailParticles = [];

    function resizeTrailCanvas() {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }
    resizeTrailCanvas();
    window.addEventListener('resize', resizeTrailCanvas);

    class TrailParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 1.5;
            this.color = `hsl(${Math.random() * 40 + 330}, 75%, 75%)`; // Glowing pastel pinks and purples
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2 - 1.0; // Gravity/Drift upwards slightly
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw() {
            trailCtx.save();
            trailCtx.globalAlpha = this.alpha;
            trailCtx.fillStyle = this.color;
            trailCtx.shadowBlur = 8;
            trailCtx.shadowColor = this.color;
            trailCtx.beginPath();
            
            // Draw a cute sparkle shape
            trailCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            trailCtx.fill();
            trailCtx.restore();
        }
    }

    window.addEventListener('mousemove', (e) => {
        // Spawn 2 particles per mouse movement
        for (let i = 0; i < 2; i++) {
            trailParticles.push(new TrailParticle(e.clientX, e.clientY));
        }
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            for (let i = 0; i < 2; i++) {
                trailParticles.push(new TrailParticle(touch.clientX, touch.clientY));
            }
        }
    });

    function animateTrail() {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        
        trailParticles = trailParticles.filter(p => p.alpha > 0);
        trailParticles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateTrail);
    }
    animateTrail();


    // --- 4. THREE.JS HERO SCENE ---
    let heroScene, heroCamera, heroRenderer;
    let cakeGroup, balloons = [];
    let number24Group;
    let starParticles;

    function initHero3D() {
        const container = document.getElementById('hero-3d-container');
        if (!container) return;

        try {
            // Scene Setup
            heroScene = new THREE.Scene();

            // Camera Setup
            heroCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
            heroCamera.position.set(0, 2, 7.5);

            // Renderer Setup
            heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            heroRenderer.setSize(container.clientWidth, container.clientHeight);
            heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            heroRenderer.shadowMap.enabled = true;
            container.appendChild(heroRenderer.domElement);

            // Ambient Light (Soft Deep Purple)
            const ambient = new THREE.AmbientLight(0x5a3b8c, 0.7);
            heroScene.add(ambient);

            // Directional Light (Warm Golden Highlight)
            const dirLight = new THREE.DirectionalLight(0xf7e7ce, 1.2);
            dirLight.position.set(5, 10, 5);
            dirLight.castShadow = true;
            heroScene.add(dirLight);

            // Point Light for candles glow
            const candleLight = new THREE.PointLight(0xffaa44, 2.0, 15);
            candleLight.position.set(0, 1.2, 0);
            heroScene.add(candleLight);

            // Build Cake Group
            cakeGroup = new THREE.Group();
            build3DCake(cakeGroup);
            cakeGroup.position.set(0, -1.2, 0);
            heroScene.add(cakeGroup);

            // Build Floating Balloons Group
            buildBalloons();

            // Build "24" beaded gold sculpture
            number24Group = new THREE.Group();
            buildNumber24(number24Group);
            number24Group.position.set(0, 1.6, -4.0); // Floats behind the cake
            heroScene.add(number24Group);

            // Build 3D Sparkle particles
            buildSparkleField();

            // Start Render Loop
            const clock = new THREE.Clock();
            function render() {
                const elapsedTime = clock.getElapsedTime();

                // Rotate Cake
                if (cakeGroup) {
                    cakeGroup.rotation.y = elapsedTime * 0.2;
                }

                // Rotate & Float Number 24
                if (number24Group) {
                    number24Group.rotation.y = Math.sin(elapsedTime * 0.3) * 0.25;
                    number24Group.position.y = 1.6 + Math.sin(elapsedTime * 0.8) * 0.15;
                }

                // Animate Candle Flames
                const flames = cakeGroup.getObjectByName('flames');
                if (flames) {
                    flames.children.forEach((flame, index) => {
                        const wave = Math.sin(elapsedTime * 10 + index * 10) * 0.12;
                        flame.scale.set(1 + wave, 1.1 + wave * 1.5, 1 + wave);
                        flame.rotation.z = Math.sin(elapsedTime * 8 + index) * 0.05;
                    });
                }

                // Animate Balloons
                balloons.forEach(balloon => {
                    balloon.mesh.position.y += balloon.speed;
                    // Lateral swaying movement
                    balloon.mesh.position.x += Math.sin(elapsedTime * 1.5 + balloon.swayOffset) * 0.015;
                    
                    // Reset at top
                    if (balloon.mesh.position.y > 6.0) {
                        balloon.mesh.position.y = -6.0;
                        balloon.mesh.position.x = (Math.random() - 0.5) * 7;
                        balloon.mesh.position.z = (Math.random() - 0.5) * 5 - 2;
                    }
                });

                // Spin Sparkles
                if (starParticles) {
                    starParticles.rotation.y = elapsedTime * 0.05;
                    starParticles.rotation.x = elapsedTime * 0.03;
                }

                heroRenderer.render(heroScene, heroCamera);
                requestAnimationFrame(render);
            }
            render();

            // Window resize handler
            window.addEventListener('resize', () => {
                if (!heroCamera || !heroRenderer || !container) return;
                heroCamera.aspect = container.clientWidth / container.clientHeight;
                heroCamera.updateProjectionMatrix();
                heroRenderer.setSize(container.clientWidth, container.clientHeight);
            });

        } catch (error) {
            console.error("Three.js initialization error in Hero section:", error);
        }
    }

    // Helper functions for 3D creation
    function build3DCake(group) {
        // Materials
        const frostingGold = new THREE.MeshStandardMaterial({
            color: 0xf7e7ce,
            roughness: 0.18,
            metalness: 0.2,
            flatShading: false
        });

        const icingRose = new THREE.MeshStandardMaterial({
            color: 0xB76E79,
            roughness: 0.2,
            metalness: 0.35
        });

        const candleMat = new THREE.MeshStandardMaterial({
            color: 0x8D5B96,
            roughness: 0.4
        });

        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xffaa33,
            transparent: true,
            opacity: 0.9
        });

        const standMat = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.1,
            metalness: 0.8
        });

        // Stand / Plate
        const standGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.12, 32);
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.y = 0.06;
        stand.receiveShadow = true;
        group.add(stand);

        const baseGeo = new THREE.CylinderGeometry(1.2, 1.6, 0.4, 32);
        const baseStand = new THREE.Mesh(baseGeo, standMat);
        baseStand.position.y = -0.2;
        group.add(baseStand);

        // Lower Tier
        const tier1Geo = new THREE.CylinderGeometry(1.9, 1.9, 0.9, 32);
        const tier1 = new THREE.Mesh(tier1Geo, icingRose);
        tier1.position.y = 0.57;
        tier1.castShadow = true;
        tier1.receiveShadow = true;
        group.add(tier1);

        // Lower Tier Cream Drops (Decorative Spheres)
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const x = Math.cos(angle) * 1.95;
            const z = Math.sin(angle) * 1.95;
            const creamGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const cream = new THREE.Mesh(creamGeo, frostingGold);
            cream.position.set(x, 0.98, z);
            group.add(cream);
        }

        // Upper Tier
        const tier2Geo = new THREE.CylinderGeometry(1.3, 1.3, 0.8, 32);
        const tier2 = new THREE.Mesh(tier2Geo, frostingGold);
        tier2.position.y = 1.42;
        tier2.castShadow = true;
        tier2.receiveShadow = true;
        group.add(tier2);

        // Upper Tier Cream Drops
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 1.33;
            const z = Math.sin(angle) * 1.33;
            const creamGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const cream = new THREE.Mesh(creamGeo, icingRose);
            cream.position.set(x, 1.82, z);
            group.add(cream);
        }

        // 3 Candles
        const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12);
        const candlePositions = [
            { x: -0.4, y: 2.05, z: 0.1 },
            { x: 0.3, y: 2.05, z: -0.3 },
            { x: 0.1, y: 2.05, z: 0.4 }
        ];

        const flamesGroup = new THREE.Group();
        flamesGroup.name = 'flames';

        candlePositions.forEach((pos, idx) => {
            const candle = new THREE.Mesh(candleGeo, candleMat);
            candle.position.set(pos.x, pos.y, pos.z);
            candle.castShadow = true;
            group.add(candle);

            // Wick
            const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8);
            const wick = new THREE.Mesh(wickGeo, new THREE.MeshBasicMaterial({ color: 0x333333 }));
            wick.position.set(pos.x, pos.y + 0.28, pos.z);
            group.add(wick);

            // Flame Mesh
            const flameGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
            flameGeo.translate(0, 0.125, 0); // Offset origin to bottom for proper scaling
            const flame = new THREE.Mesh(flameGeo, flameMat);
            flame.position.set(pos.x, pos.y + 0.32, pos.z);
            flamesGroup.add(flame);
        });

        group.add(flamesGroup);
    }

    function buildBalloons() {
        const colors = [0xB76E79, 0x8D5B96, 0xD4AF37]; // Rose Gold, Soft Purple, Gold
        const balloonCount = 8;

        for (let i = 0; i < balloonCount; i++) {
            const color = colors[i % colors.length];
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.65,
                roughness: 0.18
            });

            // Balloon Geometry: stretched sphere + cone at bottom
            const balloonGeo = new THREE.SphereGeometry(0.48, 16, 16);
            balloonGeo.scale(1, 1.25, 1);
            const balloonMesh = new THREE.Mesh(balloonGeo, mat);
            balloonMesh.castShadow = true;

            const knotGeo = new THREE.ConeGeometry(0.08, 0.12, 8);
            const knot = new THREE.Mesh(knotGeo, mat);
            knot.position.y = -0.62;
            balloonMesh.add(knot);

            // Thin string line
            const points = [];
            points.push(new THREE.Vector3(0, -0.62, 0));
            points.push(new THREE.Vector3(0, -2.5, 0));
            const stringGeo = new THREE.BufferGeometry().setFromPoints(points);
            const stringMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4 });
            const string = new THREE.Line(stringGeo, stringMat);
            balloonMesh.add(string);

            // Position randomly in hero background space
            balloonMesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 5 - 2
            );

            heroScene.add(balloonMesh);

            balloons.push({
                mesh: balloonMesh,
                speed: Math.random() * 0.015 + 0.008,
                swayOffset: Math.random() * 10
            });
        }
    }

    function buildNumber24(group) {
        // Create 24 using glowing beaded gold spheres
        const sphereMat = new THREE.MeshStandardMaterial({
            color: 0xD4AF37, // Gold
            metalness: 0.9,
            roughness: 0.08,
            emissive: 0xD4AF37,
            emissiveIntensity: 0.15
        });

        const beadGeo = new THREE.SphereGeometry(0.17, 16, 16);

        // Coordinates lists for Bead Layout (X, Y)
        const number2Coords = [
            // Top Curve
            {x: -1.0, y: 1.0}, {x: -0.7, y: 1.3}, {x: -0.3, y: 1.5}, 
            {x: 0.1, y: 1.5}, {x: 0.5, y: 1.3}, {x: 0.8, y: 1.0},
            // Right Side
            {x: 0.85, y: 0.6}, {x: 0.7, y: 0.2},
            // Diagonal
            {x: 0.4, y: -0.2}, {x: 0.1, y: -0.6}, 
            {x: -0.2, y: -1.0}, {x: -0.5, y: -1.4},
            // Base line
            {x: -0.9, y: -1.7}, {x: -0.5, y: -1.7}, {x: -0.1, y: -1.7}, 
            {x: 0.3, y: -1.7}, {x: 0.7, y: -1.7}, {x: 1.0, y: -1.7}
        ];

        const number4Coords = [
            // Left stem
            {x: 2.1, y: 1.3}, {x: 1.8, y: 0.9}, {x: 1.5, y: 0.5}, 
            {x: 1.2, y: 0.1}, {x: 0.9, y: -0.3},
            // Cross Bar
            {x: 1.3, y: -0.3}, {x: 1.7, y: -0.3}, {x: 2.5, y: -0.3}, {x: 2.9, y: -0.3},
            // Right Tall bar
            {x: 2.1, y: 1.7}, {x: 2.1, y: 0.9}, {x: 2.1, y: 0.5}, {x: 2.1, y: 0.1},
            {x: 2.1, y: -0.7}, {x: 2.1, y: -1.1}, {x: 2.1, y: -1.5}, {x: 2.1, y: -1.7}
        ];

        // Draw '2'
        number2Coords.forEach(pos => {
            const bead = new THREE.Mesh(beadGeo, sphereMat);
            bead.position.set(pos.x - 0.75, pos.y, 0); // Offset left
            group.add(bead);
        });

        // Draw '4'
        number4Coords.forEach(pos => {
            const bead = new THREE.Mesh(beadGeo, sphereMat);
            bead.position.set(pos.x - 0.75, pos.y, 0); // Offset left
            group.add(bead);
        });

        // Scale and tilt group slightly
        group.scale.set(0.9, 0.9, 0.9);
    }

    function buildSparkleField() {
        const count = 70;
        const geom = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < count; i++) {
            positions.push(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
        }

        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xf7e7ce,
            size: 0.18,
            transparent: true,
            opacity: 0.8
        });

        starParticles = new THREE.Points(geom, mat);
        heroScene.add(starParticles);
    }


    // --- 5. THREE.JS INTERACTIVE GIFTS SCENE ---
    let giftScene, giftCamera, giftRenderer;
    let giftBoxes = [];
    const giftMessages = [
        {
            title: "Rose Gold Surprise! 🌸",
            text: "Muskan, you are literally the best sister in the world. Thank you for listening to my stories, guiding me, and filling our home with laughter. I'm so proud of the beautiful, strong woman you've become! 💖"
        },
        {
            title: "Magic & Adventure! ✨",
            text: "May your 24th year open doors to dream career moves, exotic travel destinations, and beautiful memories. Believe in yourself, because your sibling will always be here to support and cheer you on! ✈️"
        },
        {
            title: "A Heart full of Love! 💛",
            text: "On your birthday, I wish you endless happiness, good health, and an abundance of smiles. Never let your sparkle fade, Muskan Singla! You are an absolute treasure. Happy 24th Birthday! 👑"
        }
    ];

    function initGifts3D() {
        const card = document.querySelector('.message-card');
        if (!card) return;

        // Create canvas inside the Sibling Card
        const giftsContainer = document.createElement('div');
        giftsContainer.id = 'gifts-3d-container';
        giftsContainer.style.width = '100%';
        giftsContainer.style.height = '220px';
        giftsContainer.style.marginTop = '30px';
        giftsContainer.style.position = 'relative';
        card.appendChild(giftsContainer);

        // Subtitle instructions
        const instr = document.createElement('div');
        instr.className = 'wish-instruction';
        instr.innerText = "There are 3 birthday gifts for you! Click to open them 🎁";
        giftsContainer.appendChild(instr);

        try {
            // Setup scene
            giftScene = new THREE.Scene();

            giftCamera = new THREE.PerspectiveCamera(45, giftsContainer.clientWidth / giftsContainer.clientHeight, 0.1, 100);
            giftCamera.position.set(0, 0.5, 6);

            giftRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            giftRenderer.setSize(giftsContainer.clientWidth, giftsContainer.clientHeight);
            giftRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            giftsContainer.appendChild(giftRenderer.domElement);

            // Lighting
            const ambient = new THREE.AmbientLight(0x7a5b99, 0.8);
            giftScene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xfdfbf7, 1.2);
            dirLight.position.set(2, 4, 3);
            giftScene.add(dirLight);

            // Build 3 boxes side by side: Rose Gold, Purple, Gold
            const colors = [0xB76E79, 0x5a3b8c, 0xD4AF37];
            const positionsX = [-1.8, 0, 1.8];

            for (let i = 0; i < 3; i++) {
                const boxGroup = new THREE.Group();
                boxGroup.userData = { id: i, isOpen: false };

                // Material
                const mat = new THREE.MeshStandardMaterial({
                    color: colors[i],
                    roughness: 0.2,
                    metalness: 0.5
                });

                const ribbonMat = new THREE.MeshStandardMaterial({
                    color: i === 1 ? 0xD4AF37 : 0xfdfbf7, // Gold ribbon on purple box, white ribbon on others
                    roughness: 0.1,
                    metalness: 0.8
                });

                // 1. Box Base (Cube)
                const baseGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
                const base = new THREE.Mesh(baseGeo, mat);
                base.position.y = 0.425;
                boxGroup.add(base);

                // 2. Box Lid
                const lidGeo = new THREE.BoxGeometry(0.92, 0.22, 0.92);
                const lid = new THREE.Mesh(lidGeo, mat);
                lid.position.y = 0.9;
                lid.name = 'lid';
                boxGroup.add(lid);

                // 3. Ribbon band around box base
                const bandVGeo = new THREE.BoxGeometry(0.12, 0.86, 0.86);
                const bandV = new THREE.Mesh(bandVGeo, ribbonMat);
                bandV.position.y = 0.425;
                boxGroup.add(bandV);

                const bandHGeo = new THREE.BoxGeometry(0.86, 0.86, 0.12);
                const bandH = new THREE.Mesh(bandHGeo, ribbonMat);
                bandH.position.y = 0.425;
                boxGroup.add(bandH);

                // 4. Ribbon ribbon decoration on Lid
                const lidRibV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.94), ribbonMat);
                lidRibV.position.y = 0.9;
                lidRibV.name = 'lidRibV';
                boxGroup.add(lidRibV);

                const lidRibH = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.24, 0.14), ribbonMat);
                lidRibH.position.y = 0.9;
                lidRibH.name = 'lidRibH';
                boxGroup.add(lidRibH);

                // Bow knot (Sphere)
                const bowGeo = new THREE.SphereGeometry(0.08, 8, 8);
                const bow = new THREE.Mesh(bowGeo, ribbonMat);
                bow.position.y = 1.04;
                bow.name = 'bow';
                boxGroup.add(bow);

                boxGroup.position.set(positionsX[i], -0.6, 0);
                giftScene.add(boxGroup);
                giftBoxes.push(boxGroup);
            }

            // Raycasting for Box Clicks
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            function onGiftClick(event) {
                // Calculate mouse position relative to canvas container
                const rect = giftRenderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, giftCamera);
                
                // Inspect intersections
                const intersects = raycaster.intersectObjects(giftScene.children, true);

                if (intersects.length > 0) {
                    // Find parent group that holds userData
                    let obj = intersects[0].object;
                    while (obj.parent && !obj.userData.hasOwnProperty('id')) {
                        obj = obj.parent;
                    }

                    if (obj.userData.hasOwnProperty('id')) {
                        openGift(obj);
                    }
                }
            }

            // Touch support for mobiles
            function onGiftTouch(event) {
                if (event.touches.length > 0) {
                    onGiftClick(event.touches[0]);
                }
            }

            giftRenderer.domElement.addEventListener('click', onGiftClick);
            giftRenderer.domElement.addEventListener('touchstart', onGiftTouch);

            // Animate Loop
            const clock = new THREE.Clock();
            function renderGifts() {
                const elapsedTime = clock.getElapsedTime();
                
                giftBoxes.forEach((box, index) => {
                    // Slow hover rotation
                    if (!box.userData.isOpen) {
                        box.rotation.y = elapsedTime * 0.4 + index * 2.0;
                        box.position.y = -0.6 + Math.sin(elapsedTime * 2.5 + index * 1.5) * 0.08;
                    }
                });

                giftRenderer.render(giftScene, giftCamera);
                requestAnimationFrame(renderGifts);
            }
            renderGifts();

            // Resize
            window.addEventListener('resize', () => {
                if (!giftCamera || !giftRenderer || !giftsContainer) return;
                giftCamera.aspect = giftsContainer.clientWidth / giftsContainer.clientHeight;
                giftCamera.updateProjectionMatrix();
                giftRenderer.setSize(giftsContainer.clientWidth, giftsContainer.clientHeight);
            });

        } catch (e) {
            console.error("Three.js initialization failed in Sibling Message section:", e);
        }
    }

    function openGift(boxGroup) {
        if (boxGroup.userData.isOpen) return;
        boxGroup.userData.isOpen = true;

        // Audio chimes on open
        musicPlayer.playChimeNote(72, 0.15, 0, 1.5);
        musicPlayer.playPianoNote(64, 0.12, 0.1, 2.0);

        // Confetti burst
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
        });

        // 3D lid lift animation with GSAP
        const lid = boxGroup.getObjectByName('lid');
        const lidRibV = boxGroup.getObjectByName('lidRibV');
        const lidRibH = boxGroup.getObjectByName('lidRibH');
        const bow = boxGroup.getObjectByName('bow');

        const lidParts = [lid, lidRibV, lidRibH, bow];

        // Animate parts popping off
        lidParts.forEach(part => {
            if (!part) return;
            gsap.to(part.position, {
                y: part.position.y + 1.5,
                x: part.position.x + (Math.random() - 0.5) * 0.5,
                duration: 0.8,
                ease: "power2.out"
            });
            gsap.to(part.rotation, {
                z: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                duration: 0.8,
                ease: "power2.out"
            });
            gsap.to(part.scale, {
                x: 0, y: 0, z: 0,
                delay: 0.3,
                duration: 0.5,
                ease: "power2.in"
            });
        });

        // Animate entire box rotation & focus
        gsap.to(boxGroup.rotation, {
            y: boxGroup.rotation.y + Math.PI * 2,
            duration: 1.0,
            ease: "back.out(1.7)"
        });

        // Display popup modal letter after box opens
        setTimeout(() => {
            const data = giftMessages[boxGroup.userData.id];
            
            // Re-use gallery lightbox overlay for letter display
            const lightbox = document.getElementById('lightbox');
            const lImg = document.getElementById('lightbox-img');
            const lCap = document.getElementById('lightbox-caption');

            // Hide image node, setup formatted text block
            lImg.style.display = 'none';
            lCap.innerHTML = `<h3 style="font-family:var(--font-serif);font-size:1.8rem;color:var(--color-gold);margin-bottom:15px;">${data.title}</h3>
                              <p style="font-size:1.2rem;line-height:1.8;color:var(--color-ivory);font-weight:300;">${data.text}</p>`;
            
            lightbox.classList.add('active');
        }, 800);
    }


    // --- 6. POPULATE 24 WISHES FOR 24 YEARS ---
    const wishesContainer = document.getElementById('wishes-container');
    if (wishesContainer) {
        wishes.forEach((wishText, index) => {
            const wishNum = index + 1;
            
            const card = document.createElement('div');
            card.className = 'wish-card-flip';
            card.innerHTML = `
                <div class="wish-card-front">
                    <span class="wish-number">${String(wishNum).padStart(2, '0')}</span>
                    <span class="wish-sparkle">✦</span>
                    <h4>Wish #${wishNum}</h4>
                </div>
                <div class="wish-card-back">
                    <p>${wishText}</p>
                </div>
            `;
            
            wishesContainer.appendChild(card);
        });
    }


    // --- 7. AUTO-PLAYING QUOTES CAROUSEL ---
    const quotesWrapper = document.getElementById('quotes-wrapper');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (quotesWrapper && dotsContainer) {
        quotes.forEach((q, index) => {
            // Create slide element
            const slide = document.createElement('div');
            slide.className = 'quote-slide';
            slide.innerHTML = `
                <div class="glass-card quote-card">
                    <div class="quote-mark">“</div>
                    <p class="quote-text">${q.text}</p>
                    <p class="quote-author">${q.author}</p>
                </div>
            `;
            quotesWrapper.appendChild(slide);

            // Create carousel dot
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotsContainer.appendChild(dot);

            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });

        let currentSlide = 0;
        let carouselInterval = null;

        function goToSlide(idx) {
            currentSlide = idx;
            quotesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update active dot
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            resetCarouselTimer();
        }

        function nextSlide() {
            const nextIdx = (currentSlide + 1) % quotes.length;
            goToSlide(nextIdx);
        }

        function resetCarouselTimer() {
            if (carouselInterval) clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 5000);
        }

        resetCarouselTimer();
    }


    // --- 8. MEMORY GALLERY LIGHTBOX POPUP ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-src');
            const caption = item.getAttribute('data-caption');

            if (item.classList.contains('themed-card')) {
                // If it is a gradient text card, hide image and show formatted text block
                lightboxImg.style.display = 'none';
                const textContent = item.querySelector('.text-card-content').innerHTML;
                lightboxCap.innerHTML = `<div style="padding:20px;">${textContent}<br><br><em style="color:var(--color-rose-gold-light);font-size:0.95rem;">"${caption}"</em></div>`;
            } else {
                // Show real photo
                lightboxImg.style.display = 'block';
                lightboxImg.src = imgSrc;
                lightboxCap.innerText = caption;
            }

            lightbox.classList.add('active');
            
            // Play a soft bell ring on memory view
            musicPlayer.playChimeNote(67, 0.1, 0, 1.5);
        });
    });

    // Close Lightbox
    function closeLightboxModal() {
        lightbox.classList.remove('active');
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightboxModal);
    
    // Close on clicking overlay black background
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightboxModal();
            }
        });
    }

    // Cousins Photo Auto-Detection
    const cousinsImg = document.getElementById('cousins-img');
    const cousinsPlaceholder = document.getElementById('cousins-placeholder');
    const cousinsItem = document.getElementById('cousins-gallery-item');
    if (cousinsImg) {
        cousinsImg.onload = function() {
            cousinsImg.style.display = 'block';
            if (cousinsPlaceholder) cousinsPlaceholder.style.display = 'none';
            if (cousinsItem) cousinsItem.classList.remove('themed-card');
        };
        // Trigger load explicitly in case browser cached it or load fired before script
        if (cousinsImg.complete && cousinsImg.naturalWidth > 0) {
            cousinsImg.onload();
        }
    }

    // --- 9. MAKE A WISH INTERACTIVE 3D CAKE & BLOWOUT ---
    let wishScene, wishCamera, wishRenderer;
    let wishCakeGroup;
    let isWishBlown = false;

    function initWish3D() {
        const container = document.getElementById('wish-3d-container');
        if (!container) return;

        try {
            wishScene = new THREE.Scene();

            wishCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
            wishCamera.position.set(0, 2.5, 6);

            wishRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            wishRenderer.setSize(container.clientWidth, container.clientHeight);
            wishRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(wishRenderer.domElement);

            // Lighting
            const ambient = new THREE.AmbientLight(0x4a2e80, 0.8);
            wishScene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xfdfbf7, 1.2);
            dirLight.position.set(2, 6, 2);
            wishScene.add(dirLight);

            // Single burning candle light
            const flameLight = new THREE.PointLight(0xffaa44, 2.5, 12);
            flameLight.position.set(0, 1.3, 0);
            wishScene.add(flameLight);

            // Build Cake Group
            wishCakeGroup = new THREE.Group();
            buildWishCake(wishCakeGroup);
            wishCakeGroup.position.set(0, -1.0, 0);
            wishScene.add(wishCakeGroup);

            // Raycaster to blow candle by clicking directly on it
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            function onCandleClick(event) {
                if (isWishBlown) return;

                const rect = wishRenderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, wishCamera);
                const intersects = raycaster.intersectObjects(wishScene.children, true);

                if (intersects.length > 0) {
                    // Check if clicked the flame, candle, or wick
                    let hitCandle = false;
                    intersects.forEach(hit => {
                        if (hit.object.name === 'wish-flame' || hit.object.name === 'wish-candle') {
                            hitCandle = true;
                        }
                    });

                    if (hitCandle) {
                        blowOutCandles();
                    }
                }
            }

            wishRenderer.domElement.addEventListener('mousedown', onCandleClick);

            // Render loop
            const clock = new THREE.Clock();
            function renderWish() {
                const elapsedTime = clock.getElapsedTime();

                // Slowly rotate cake
                if (wishCakeGroup) {
                    wishCakeGroup.rotation.y = elapsedTime * 0.15;
                }

                // Animate Flame
                const flame = wishScene.getObjectByName('wish-flame');
                if (flame && !isWishBlown) {
                    const wave = Math.sin(elapsedTime * 12) * 0.15;
                    flame.scale.set(1 + wave, 1.2 + wave * 1.5, 1 + wave);
                    flame.rotation.z = Math.sin(elapsedTime * 10) * 0.08;
                    flameLight.intensity = 2.5 + Math.sin(elapsedTime * 15) * 0.5;
                } else if (flameLight && isWishBlown) {
                    // Dim light down
                    flameLight.intensity = Math.max(0, flameLight.intensity - 0.15);
                }

                wishRenderer.render(wishScene, wishCamera);
                requestAnimationFrame(renderWish);
            }
            renderWish();

            // Resize
            window.addEventListener('resize', () => {
                if (!wishCamera || !wishRenderer || !container) return;
                wishCamera.aspect = container.clientWidth / container.clientHeight;
                wishCamera.updateProjectionMatrix();
                wishRenderer.setSize(container.clientWidth, container.clientHeight);
            });

        } catch (e) {
            console.error("Three.js Wish scene init failed:", e);
        }
    }

    function buildWishCake(group) {
        // Soft purple tier, rose gold icing, and single gold candle
        const matPurple = new THREE.MeshStandardMaterial({
            color: 0x4a2e80,
            roughness: 0.2,
            metalness: 0.4
        });

        const matGold = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            roughness: 0.1,
            metalness: 0.8
        });

        const standMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.6
        });

        const flameMat = new THREE.MeshBasicMaterial({
            color: 0xff7700,
            transparent: true,
            opacity: 0.95
        });

        // Stand / Plate
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 32), standMat);
        stand.position.y = 0.04;
        group.add(stand);

        // Cake Tier
        const tier = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.8, 32), matPurple);
        tier.position.y = 0.44;
        group.add(tier);

        // Cream drops around edge
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 1.32;
            const z = Math.sin(angle) * 1.32;
            const cream = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matGold);
            cream.position.set(x, 0.84, z);
            group.add(cream);
        }

        // Single Giant Candle in the center
        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12), matGold);
        candle.position.set(0, 1.14, 0);
        candle.name = 'wish-candle';
        group.add(candle);

        // Wick
        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), new THREE.MeshBasicMaterial({ color: 0x222222 }));
        wick.position.set(0, 1.48, 0);
        group.add(wick);

        // Glowing Flame
        const flameGeo = new THREE.ConeGeometry(0.09, 0.32, 8);
        flameGeo.translate(0, 0.16, 0);
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.set(0, 1.52, 0);
        flame.name = 'wish-flame';
        group.add(flame);
    }

    function blowOutCandles() {
        if (isWishBlown) return;
        isWishBlown = true;

        // 1. Shrink flame mesh
        const flame = wishScene.getObjectByName('wish-flame');
        if (flame) {
            gsap.to(flame.scale, {
                x: 0, y: 0, z: 0,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    flame.visible = false;
                }
            });
        }

        // 2. Play soft chime note then sweeping sound
        musicPlayer.playChimeNote(60, 0.1, 0, 1);
        musicPlayer.playChimeNote(72, 0.15, 0.15, 1.5);
        musicPlayer.playPianoNote(67, 0.12, 0.3, 3);

        // 3. Fire massive confetti explosion from the center of the cake!
        const rect = document.getElementById('wish-3d-container').getBoundingClientRect();
        const originY = (rect.top + rect.height / 2) / window.innerHeight;
        
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { x: 0.5, y: originY }
        });

        // Triple confetti burst for extra wow factor
        setTimeout(() => {
            confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 300);

        // 4. Show success popup card after blowout
        setTimeout(() => {
            const success = document.getElementById('wish-success-msg');
            if (success) {
                success.classList.add('active');
            }
        }, 1200);
    }

    // Attach to Blow button
    const blowBtn = document.getElementById('blow-btn');
    if (blowBtn) {
        blowBtn.addEventListener('click', blowOutCandles);
    }


    // --- 10. COUNTDOWN TIMER LOGIC ---
    // Targets May 26, 2026 00:00:00 (local time)
    const targetDate = new Date('2026-05-26T00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        const countdownContainer = document.getElementById('countdown');
        if (!countdownContainer) return;

        // If it's already her birthday!
        if (diff <= 0) {
            countdownContainer.innerHTML = `
                <div class="birthday-now-glow" style="font-family:var(--font-serif);font-size:2.2rem;color:var(--color-gold-light);text-shadow:0 0 20px rgba(212,175,55,0.8);animation:pulseGlow 2s infinite alternate;">
                    You are NOW 24 years old! 🎉
                </div>
            `;
            return;
        }

        // Calculate time segments
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update elements
        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();


    // --- 11. GSAP ENTRANCE & SCROLL TRIGGERS ---
    // Register scroll plugin
    gsap.registerPlugin(ScrollTrigger);

    function setupScrollAnimations() {
        // Hero Content Fade-in
        gsap.from('.hero-text-content', {
            opacity: 0,
            y: 40,
            duration: 1.4,
            ease: "power3.out",
            delay: 0.5
        });

        // Sibling letter slide-in reveal
        gsap.from('.message-card', {
            scrollTrigger: {
                trigger: '#message',
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: "power2.out"
        });

        // Wishes Cards Reveal (Staggered scale in)
        gsap.from('#wishes-container .wish-card-flip', {
            scrollTrigger: {
                trigger: '#wishes',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            scale: 0.8,
            y: 30,
            duration: 0.8,
            stagger: 0.05,
            ease: "back.out(1.5)"
        });

        // Why You're Amazing (Staggered cards layout)
        gsap.from('.amazing-card', {
            scrollTrigger: {
                trigger: '#amazing',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 40,
            duration: 0.9,
            stagger: 0.12,
            ease: "power2.out"
        });

        // Memory Gallery (Slide up together)
        gsap.from('.gallery-item', {
            scrollTrigger: {
                trigger: '#gallery',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 1.0,
            stagger: 0.15,
            ease: "power3.out"
        });

        // Wish section scale-in
        gsap.from('.wish-cake-container', {
            scrollTrigger: {
                trigger: '#wish-section',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            scale: 0.9,
            duration: 1.2,
            ease: "back.out(1.2)"
        });
    }


    // --- 12. LOADING SCREEN CONTROL & CTA CELEBRATION ---
    const progressEl = document.getElementById('progress-bar');
    const percentEl = document.getElementById('loader-percent');
    let loadPercent = 0;

    // Simulate preloading of assets
    const loadInterval = setInterval(() => {
        loadPercent += Math.floor(Math.random() * 8) + 3;
        if (loadPercent >= 100) {
            loadPercent = 100;
            clearInterval(loadInterval);
            
            // Fade-out loading screen
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';

                // Fire initial double confetti burst when page fully loaded!
                confetti({
                    particleCount: 60,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 }
                });
                confetti({
                    particleCount: 60,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 }
                });

                // Initialize 3D elements after loader clears to prevent rendering hiccups
                initHero3D();
                initGifts3D();
                initWish3D();
                setupScrollAnimations();

                // Setup Typewriter subtitles in Hero
                new Typed('#typed-welcome', {
                    strings: [
                        "May 26, 2026 — A day the world got a little more magical ✨",
                        "Turn up the sound & let the magic begin... 🎵",
                        "Happy 24th Birthday to my favorite human in the universe! 💖"
                    ],
                    typeSpeed: 45,
                    backSpeed: 25,
                    loop: true,
                    backDelay: 2500
                });

            }, 500);
        }
        
        progressEl.style.width = `${loadPercent}%`;
        percentEl.innerText = `${loadPercent}%`;
    }, 80);


    // "Celebrate Now" CTA Button click
    document.getElementById('celebrate-btn').addEventListener('click', () => {
        // Start playing music
        musicPlayer.startAudio();

        // Fire interactive double side burst
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
        });

        // Smooth Scroll to Message section
        const msgSection = document.getElementById('message');
        if (msgSection) {
            msgSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Share Button Logic
    document.getElementById('share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: "Happy 24th Birthday Muskan! 🎂",
                text: "Check out this beautiful 3D birthday celebration site for Muskan Singla!",
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Birthday website link copied to clipboard! Share it with family & friends! 💖");
        }
    });

});
