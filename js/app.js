/**
 * Muskan Singla's 24th Birthday Website Logic
 * Features Three.js WebGL rendering, GSAP ScrollTriggers, Swiper.js, Web Audio API,
 * Confetti bursts, Canvas Fireworks, and custom interactive components.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. PROCEDURAL SOUND ENGINE (WEB AUDIO API)
    // ==========================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
            this.synthInterval = null;
            this.chordIndex = 0;
            this.isMuted = true;
            this.audioEl = null;

            // Warm luxury chords (Ebm7 - Ab7 - Dbmaj7 - Gbmaj7)
            this.chords = [
                [51, 55, 58, 61, 65], // Ebm9
                [56, 60, 63, 66, 70], // Ab9
                [49, 53, 56, 60, 63], // Dbmaj9
                [54, 58, 61, 65, 68]  // Gbmaj9
            ];
        }

        init() {
            if (this.ctx) return;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            // Master gain node
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Default volume 30%
            this.masterGain.connect(this.ctx.destination);

            // Initialize Audio element for Mixkit/Pixabay MP3 Birthday Track
            this.audioEl = new Audio();
            this.audioEl.src = 'https://archive.org/download/glass-animals-heat-waves_202601/Glass_Animals_-_Heat_Waves.mp3'; // Glass Animals - Heat Waves

            this.audioEl.loop = true;
            this.audioEl.crossOrigin = "anonymous";
            
            // Connect HTML5 audio to Web Audio API for volume control
            const source = this.ctx.createMediaElementSource(this.audioEl);
            source.connect(this.masterGain);
        }

        setVolume(percent) {
            if (!this.ctx) return;
            const vol = percent / 100;
            this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        }

        startBGM() {
            this.init();
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.isMuted = false;
            
            // Play MP3
            this.audioEl.play().catch(err => {
                console.warn("Audio element autoplay failed, falling back to Web Audio Synth loop:", err);
                this.startSynthBGM();
            });
        }

        startSynthBGM() {
            // Loop backing ambient sequence in case MP3 fails
            const playChords = () => {
                if (this.isMuted) return;
                const notes = this.chords[this.chordIndex];
                
                notes.forEach((midi, i) => {
                    this.triggerAmbientNote(midi, 0.05, i * 0.15, 4.5);
                });

                setTimeout(() => {
                    if (this.isMuted) return;
                    const melodyNotes = [notes[2] + 12, notes[3] + 12, notes[4] + 12];
                    melodyNotes.forEach((midi, i) => {
                        this.triggerChime(midi, 0.04, i * 0.5, 2.5);
                    });
                }, 1500);

                this.chordIndex = (this.chordIndex + 1) % this.chords.length;
            };

            playChords();
            this.synthInterval = setInterval(playChords, 5500);
        }

        stopBGM() {
            this.isMuted = true;
            if (this.audioEl) {
                this.audioEl.pause();
            }
            if (this.synthInterval) {
                clearInterval(this.synthInterval);
                this.synthInterval = null;
            }
        }

        midiToFreq(midi) {
            return 440 * Math.pow(2, (midi - 69) / 12);
        }

        triggerAmbientNote(midi, vol, delay, duration) {
            const time = this.ctx.currentTime + delay;
            const freq = this.midiToFreq(midi);

            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, time);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(time);
            osc.stop(time + duration);
        }

        triggerChime(midi, vol, delay, duration) {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const time = this.ctx.currentTime + delay;
            const freq = this.midiToFreq(midi);

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(freq, time);
            bandpass.Q.setValueAtTime(3.0, time);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.00001, time + duration);

            osc.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(this.masterGain);

            osc.start(time);
            osc.stop(time + duration);
        }

        // Sweeping noise for candle blow whoosh + retro celebratory upward arpeggio for cheer
        triggerBlowoutEffects() {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const now = this.ctx.currentTime;

            // 1. Whoosh: White Noise Sweep
            const bufferSize = this.ctx.sampleRate * 0.6; // 0.6 seconds
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(1000, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            noiseNode.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            noiseNode.start(now);

            // 2. Retro Cheer arpeggio: Rapid happy notes ascending
            const cheerNotes = [60, 64, 67, 72, 76, 79, 84]; // C4, E4, G4, C5, E5, G5, C6
            cheerNotes.forEach((midi, idx) => {
                this.triggerChime(midi, 0.15, 0.3 + (idx * 0.08), 1.2);
            });
        }
    }

    const sound = new SoundEngine();

    // Attach control widget handlers
    const audioBtn = document.getElementById('audio-toggle');
    const volSlider = document.getElementById('volume-slider');

    audioBtn.addEventListener('click', () => {
        if (sound.isMuted) {
            audioBtn.classList.remove('muted');
            audioBtn.classList.add('playing'); // Add pulse ring class
            sound.startBGM();
        } else {
            audioBtn.classList.remove('playing');
            audioBtn.classList.add('muted');
            sound.stopBGM();
        }
    });

    volSlider.addEventListener('input', (e) => {
        sound.setVolume(e.target.value);
    });

    // ==========================================
    // 2. GLOBAL THREE.JS CANVAS (Background Stars, Balloons, Petals)
    // ==========================================
    let glScene, glCamera, glRenderer;
    let glBalloons = [];
    let glPetals = [];
    let glStars;
    let mouseX = 0, mouseY = 0;
    let balloonsActive = false;

    function initGlobalBg3D() {
        const canvas = document.getElementById('global-bg-canvas');
        if (!canvas) return;

        glScene = new THREE.Scene();

        glCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        glCamera.position.z = 15;

        glRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        glRenderer.setSize(window.innerWidth, window.innerHeight);
        glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Ambient glow
        const ambient = new THREE.AmbientLight(0xffffff, 0.45);
        glScene.add(ambient);

        const pointLight = new THREE.PointLight(0xffd5e5, 1.0, 50);
        pointLight.position.set(5, 5, 10);
        glScene.add(pointLight);

        // A. 3D Particle Star Field
        const starGeom = new THREE.BufferGeometry();
        const starCount = 300;
        const starCoords = [];

        for (let i = 0; i < starCount; i++) {
            starCoords.push(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30
            );
        }
        starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
        
        const starMat = new THREE.PointsMaterial({
            color: 0xF7E7CE, // Champagne Gold
            size: 0.12,
            transparent: true,
            opacity: 0.75
        });
        
        glStars = new THREE.Points(starGeom, starMat);
        glScene.add(glStars);

        // B. 3D Balloons (Stretching spheres in rose golds & pinks)
        const balloonColors = [0xB76E79, 0xFFC0CB, 0xE0A899, 0xFF69B4, 0xFFB6C1];
        const balloonCount = 18;

        for (let i = 0; i < balloonCount; i++) {
            const color = balloonColors[i % balloonColors.length];
            const mat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.08,
                metalness: 0.9,
                transparent: true,
                opacity: 0.85
            });

            const balloonGeo = new THREE.SphereGeometry(0.55, 16, 16);
            balloonGeo.scale(1, 1.28, 1);
            
            const mesh = new THREE.Mesh(balloonGeo, mat);

            // Small knot at base of balloon
            const knotGeo = new THREE.ConeGeometry(0.08, 0.14, 8);
            const knot = new THREE.Mesh(knotGeo, mat);
            knot.position.y = -0.7;
            mesh.add(knot);

            // Curved ribbon string
            const points = [];
            points.push(new THREE.Vector3(0, -0.7, 0));
            points.push(new THREE.Vector3(-0.05, -1.5, 0));
            points.push(new THREE.Vector3(0.05, -2.5, 0));
            
            const stringGeo = new THREE.BufferGeometry().setFromPoints(points);
            const stringMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.35 });
            const string = new THREE.Line(stringGeo, stringMat);
            mesh.add(string);

            // Random positions spread in space, starting off-screen bottom
            mesh.position.set(
                (Math.random() - 0.5) * 35,
                -25 - Math.random() * 15,
                (Math.random() - 0.5) * 15 - 5
            );

            glScene.add(mesh);
            glBalloons.push({
                mesh: mesh,
                speed: Math.random() * 0.02 + 0.015,
                sway: Math.random() * 12,
                amplitude: Math.random() * 0.015 + 0.005
            });
        }

        // C. 3D Floating Rose Petals
        const petalMat = new THREE.MeshStandardMaterial({
            color: 0xB76E79, // Rose gold petals
            roughness: 0.35,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        // Curved petal plane
        const petalGeo = new THREE.PlaneGeometry(0.38, 0.38, 3, 3);
        const posAttr = petalGeo.attributes.position;
        // Curve vertices slightly to look like a petal
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, (x * x + y * y) * 0.15); // curved depth
        }
        petalGeo.computeVertexNormals();

        const petalCount = 25;
        for (let i = 0; i < petalCount; i++) {
            const mesh = new THREE.Mesh(petalGeo, petalMat);
            
            mesh.position.set(
                (Math.random() - 0.5) * 35,
                (Math.random() * 15) + 10,
                (Math.random() - 0.5) * 10
            );

            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            glScene.add(mesh);
            glPetals.push({
                mesh: mesh,
                speedY: Math.random() * 0.015 + 0.012,
                rotSpeedX: Math.random() * 0.01 + 0.005,
                rotSpeedY: Math.random() * 0.015 + 0.005,
                sway: Math.random() * 8
            });
        }

        // Render loop
        const clock = new THREE.Clock();
        
        function renderGlobal() {
            const t = clock.getElapsedTime();

            // React stars to mouse
            if (glStars) {
                glStars.rotation.x = t * 0.015 + (mouseY * 0.1);
                glStars.rotation.y = t * 0.01 + (mouseX * 0.1);
            }

            // Animate Balloons rising
            glBalloons.forEach(b => {
                if (balloonsActive) {
                    b.mesh.position.y += b.speed;
                }
                b.mesh.position.x += Math.sin(t * 1.2 + b.sway) * b.amplitude;
                b.mesh.rotation.z = Math.sin(t * 0.5 + b.sway) * 0.08;

                // Reset at top
                if (b.mesh.position.y > 22.0) {
                    b.mesh.position.y = -22.0;
                    b.mesh.position.x = (Math.random() - 0.5) * 35;
                }
            });

            // Animate Petals falling
            glPetals.forEach(p => {
                p.mesh.position.y -= p.speedY;
                p.mesh.position.x += Math.sin(t * 0.8 + p.sway) * 0.008;
                
                p.mesh.rotation.x += p.rotSpeedX;
                p.mesh.rotation.y += p.rotSpeedY;

                // Reset at bottom
                if (p.mesh.position.y < -20.0) {
                    p.mesh.position.y = 20.0;
                    p.mesh.position.x = (Math.random() - 0.5) * 35;
                }
            });

            glRenderer.render(glScene, glCamera);
            requestAnimationFrame(renderGlobal);
        }

        renderGlobal();

        // Listen for mousemove to update offsets
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Resize handler
        window.addEventListener('resize', () => {
            if (!glCamera || !glRenderer) return;
            glCamera.aspect = window.innerWidth / window.innerHeight;
            glCamera.updateProjectionMatrix();
            glRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ==========================================
    // 3. HERO CANVAS (3D cake + spin metallic "24")
    // ==========================================
    let heroScene, heroCamera, heroRenderer;
    let heroCake, heroNumber24;

    function initHeroScene() {
        const container = document.getElementById('hero-3d-container');
        if (!container) return;

        heroScene = new THREE.Scene();

        heroCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
        // Adjust camera positions based on responsive screen
        if (window.innerWidth < 768) {
            heroCamera.position.set(0, 1.8, 8.5);
        } else {
            // Cake sits on the right side of hero section
            heroCamera.position.set(1.5, 1.5, 6.8);
        }

        heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        heroRenderer.setSize(container.clientWidth, container.clientHeight);
        heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        heroRenderer.shadowMap.enabled = true;
        container.appendChild(heroRenderer.domElement);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffe6e6, 0.6);
        heroScene.add(ambient);

        const pointLight = new THREE.PointLight(0xffa3c4, 1.5, 20);
        pointLight.position.set(2, 3, 4);
        heroScene.add(pointLight);

        // Build 3D cake
        heroCake = new THREE.Group();
        buildCakeModel(heroCake);
        heroCake.position.set(1.8, -1.1, 0); // Position on the right side
        if (window.innerWidth < 768) {
            heroCake.position.set(0, -1.3, 0);
        }
        heroScene.add(heroCake);

        // Build spin metallic 24
        heroNumber24 = new THREE.Group();
        buildNumber24Model(heroNumber24);
        heroNumber24.position.set(1.8, 1.4, -2.5); // behind cake
        if (window.innerWidth < 768) {
            heroNumber24.position.set(0, 1.1, -2.5);
        }
        heroScene.add(heroNumber24);

        // Render loop
        const clock = new THREE.Clock();
        
        function renderHero() {
            const elapsed = clock.getElapsedTime();

            // Slowly rotate cake
            if (heroCake) {
                heroCake.rotation.y = elapsed * 0.15;
            }

            // Slowly rotate golden 24
            if (heroNumber24) {
                heroNumber24.rotation.y = elapsed * 0.25;
                heroNumber24.position.y = (window.innerWidth < 768 ? 1.1 : 1.4) + Math.sin(elapsed * 1.5) * 0.1;
            }

            // Animate flames with organic random flicker
            const flames = heroScene.getObjectByName('hero-flames');
            if (flames) {
                flames.children.forEach((flame, idx) => {
                    const randomNoise = (Math.random() - 0.5) * 0.08;
                    const wave = Math.sin(elapsed * 12 + idx * 8) * 0.15 + randomNoise;
                    flame.scale.set(1 + wave, 1.2 + wave * 1.8, 1 + wave);
                    flame.rotation.z = Math.sin(elapsed * 10 + idx) * 0.04 + (Math.random() - 0.5) * 0.02;
                    flame.rotation.x = (Math.random() - 0.5) * 0.02;
                });
            }

            heroRenderer.render(heroScene, heroCamera);
            requestAnimationFrame(renderHero);
        }

        renderHero();

        // Responsive Resize
        window.addEventListener('resize', () => {
            if (!heroCamera || !heroRenderer || !container) return;
            heroCamera.aspect = container.clientWidth / container.clientHeight;
            if (window.innerWidth < 768) {
                heroCamera.position.set(0, 1.8, 8.5);
                heroCake.position.set(0, -1.3, 0);
                heroNumber24.position.set(0, 1.1, -2.5);
            } else {
                heroCamera.position.set(1.5, 1.5, 6.8);
                heroCake.position.set(1.8, -1.1, 0);
                heroNumber24.position.set(1.8, 1.4, -2.5);
            }
            heroCamera.updateProjectionMatrix();
            heroRenderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    function buildCakeModel(group) {
        // Materials
        const cakeMat = new THREE.MeshStandardMaterial({ color: 0xF7E7CE, roughness: 0.2, metalness: 0.15 }); // Champagne
        const frostingMat = new THREE.MeshStandardMaterial({ color: 0xB76E79, roughness: 0.2, metalness: 0.35 }); // Rose gold
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.1, metalness: 0.9 });
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa31a });

        // Stand
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 32), goldMat);
        stand.position.y = 0.04;
        group.add(stand);

        // Lower tier
        const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.7, 32), frostingMat);
        tier1.position.y = 0.43;
        group.add(tier1);

        // Upper tier
        const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 32), cakeMat);
        tier2.position.y = 1.08;
        group.add(tier2);

        // Creams
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const cream = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), frostingMat);
            cream.position.set(Math.cos(angle) * 0.92, 1.38, Math.sin(angle) * 0.92);
            group.add(cream);
        }

        // Candles (3 small candles)
        const candleMat = new THREE.MeshStandardMaterial({ color: 0xC3B1E1 });
        const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
        const candlePos = [
            { x: -0.3, y: 1.55, z: 0.1 },
            { x: 0.2, y: 1.55, z: -0.3 },
            { x: 0.1, y: 1.55, z: 0.3 }
        ];

        const flamesGroup = new THREE.Group();
        flamesGroup.name = 'hero-flames';


        candlePos.forEach(pos => {
            const candle = new THREE.Mesh(candleGeo, candleMat);
            candle.position.set(pos.x, pos.y, pos.z);
            group.add(candle);

            // flame
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 8), flameMat);
            cone.position.set(pos.x, pos.y + 0.24, pos.z);
            flamesGroup.add(cone);
        });

        group.add(flamesGroup);
    }

    function buildNumber24Model(group) {
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xD4AF37, // Golden Metallic
            roughness: 0.08,
            metalness: 0.95,
            emissive: 0xD4AF37,
            emissiveIntensity: 0.12
        });

        const radius = 0.16; // Thicker tubes for solid 3D font look
        const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);

        // Helper to draw a joint sphere
        function addJoint(x, y) {
            const joint = new THREE.Mesh(sphereGeo, goldMat);
            joint.position.set(x, y, 0);
            group.add(joint);
        }

        // Helper to draw a connecting cylinder segment
        function addSegment(x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.hypot(dx, dy);
            const cylGeo = new THREE.CylinderGeometry(radius, radius, distance, 24);
            const segment = new THREE.Mesh(cylGeo, goldMat);
            segment.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);

            // Rotate cylinder to point from (x1, y1) to (x2, y2)
            const angle = Math.atan2(dy, dx);
            segment.rotation.z = angle - Math.PI / 2;
            group.add(segment);
        }

        // Define joint points for "2" (shifted left, offset X by -0.8)
        const p2 = [
            { x: -1.3, y: 1.2 },  // top-left
            { x: -0.3, y: 1.2 },  // top-right
            { x: -0.3, y: 0.3 },  // middle-right
            { x: -1.2, y: -0.4 }, // diagonal-left
            { x: -1.2, y: -1.2 }, // bottom-left
            { x: -0.2, y: -1.2 }  // bottom-right
        ];

        // Define joint points for "4" (shifted right, offset X by 0.7)
        const p4 = [
            { x: 0.3, y: 1.2 },   // top-left
            { x: 0.3, y: 0.0 },   // mid-left
            { x: 1.1, y: 0.0 },   // mid-right
            { x: 1.1, y: 1.5 },   // spine-top
            { x: 1.1, y: -1.2 }   // spine-bottom
        ];

        // Draw joints & segments for "2"
        p2.forEach(pt => addJoint(pt.x, pt.y));
        for (let i = 0; i < p2.length - 1; i++) {
            addSegment(p2[i].x, p2[i].y, p2[i + 1].x, p2[i + 1].y);
        }

        // Draw joints & segments for "4"
        p4.forEach(pt => addJoint(pt.x, pt.y));
        addSegment(p4[0].x, p4[0].y, p4[1].x, p4[1].y); // left vert
        addSegment(p4[1].x, p4[1].y, p4[2].x, p4[2].y); // crossbar
        addSegment(p4[3].x, p4[3].y, p4[4].x, p4[4].y); // spine

        // Set average scale
        group.scale.set(0.85, 0.85, 0.85);
    }

    // ==========================================
    // 4. ENVELOPE NOTE INTERACTION
    // ==========================================
    const envelopeElement = document.getElementById('letter-envelope');
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const closeBtn = document.getElementById('close-letter');

    envelopeElement.addEventListener('click', (e) => {
        if (envelopeWrapper.classList.contains('expanded')) return;
        
        if (!envelopeWrapper.classList.contains('open')) {
            envelopeWrapper.classList.add('open');
            sound.triggerChime(76, 0.15, 0, 1.2);
            
            // Auto-play music when envelope is opened
            const audioToggle = document.getElementById('audio-toggle');
            if (audioToggle && !audioToggle.classList.contains('playing')) {
                audioToggle.click();
            }

            // Expand card overlay after sliding open
            setTimeout(() => {
                envelopeWrapper.classList.add('expanded');
                sound.triggerChime(79, 0.12, 0.1, 1.5);
            }, 950);
        }
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from immediately re-expanding envelope
        envelopeWrapper.classList.remove('expanded');
        
        setTimeout(() => {
            envelopeWrapper.classList.remove('open');
        }, 650);
    });

    // ==========================================
    // 5. 24 WISHES CARD TRIGGERS (Mobile Flips + Sound Chimes)
    // ==========================================
    const wishCards = document.querySelectorAll('.wish-card-flip');
    wishCards.forEach((card, index) => {
        // Hover synthesised chimes
        card.addEventListener('mouseenter', () => {
            sound.triggerChime(60 + (index % 12), 0.06, 0, 1.0);
        });
        card.addEventListener('focus', () => {
            sound.triggerChime(60 + (index % 12), 0.06, 0, 1.0);
        });
        
        // Tap/click toggling for mobile layout
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            sound.triggerChime(65 + (index % 12), 0.08, 0, 1.0);
        });
    });

    // ==========================================
    // ==========================================
    // 6. PARENTS' PRIDE SECTIONS & PARTICLES
    // ==========================================
    const parentsLetter = document.getElementById('parents-letter');
    if (parentsLetter) {
        const text = parentsLetter.innerText;
        const words = text.split(/\s+/);
        parentsLetter.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
    }

    function spawnParentsPetals() {
        const container = document.getElementById('parents-pride');
        if (!container) return;
        
        const petalCount = 15;
        const colors = ['#e69a3b', '#d45d6c', '#B76E79', '#D4AF37']; // marigold & rose hues
        for (let i = 0; i < petalCount; i++) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "parents-petal");
            svg.setAttribute("viewBox", "0 0 30 30");
            
            const pathD = i % 2 === 0 
                ? "M15 0 C25 10, 25 25, 15 30 C5 25, 5 10, 15 0" 
                : "M15 5 C22 5, 27 12, 27 20 C27 27, 20 27, 15 22 C10 27, 3 27, 3 20 C3 12, 8 5, 15 5";
                
            svg.innerHTML = `<path d="${pathD}" fill="${colors[i % colors.length]}" />`;
            svg.style.left = `${Math.random() * 100}%`;
            svg.style.top = `-${Math.random() * 50 + 20}px`;
            svg.style.animationDuration = `${Math.random() * 8 + 6}s`;
            svg.style.animationDelay = `${Math.random() * 5}s`;
            
            const size = Math.random() * 16 + 12;
            svg.style.width = `${size}px`;
            svg.style.height = `${size}px`;
            container.appendChild(svg);
        }
    }

    function spawnHeartParticles() {
        const container = document.getElementById('parents-pride');
        if (!container) return;
        
        setInterval(() => {
            if (document.visibilityState === 'hidden') return;
            const heart = document.createElement('div');
            heart.className = 'parents-heart';
            heart.innerHTML = '❤️';
            heart.style.left = `${Math.random() * 80 + 10}%`;
            heart.style.bottom = '10%';
            heart.style.animationDuration = `${Math.random() * 4 + 4}s`;
            heart.style.fontSize = `${Math.random() * 1.2 + 0.8}rem`;
            container.appendChild(heart);
            setTimeout(() => { heart.remove(); }, 6000);
        }, 1200);
    }

    // ==========================================
    // 7. GSAP SCROLL TRIGGERS REVEAL (Timeline & Parents)
    // ==========================================
    gsap.registerPlugin(ScrollTrigger);

    function setupScrollReveals() {
        // Sibling envelop trigger fade-in
        gsap.from('.envelope-wrapper', {
            scrollTrigger: {
                trigger: '#message',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 1.3,
            ease: "power3.out"
        });

        // 24 Wishes grid cards entry (improved staggered fly-in)
        gsap.from('#wishes-container .wish-card-flip', {
            scrollTrigger: {
                trigger: '#wishes',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            scale: 0.8,
            y: 60,
            duration: 0.95,
            stagger: 0.1,
            ease: "back.out(1.4)",
            onComplete: () => {
                gsap.set('#wishes-container .wish-card-flip', { clearProps: "transform,scale,y" });
            }
        });

        // Parents' Pride Section fade-in
        gsap.from('.parents-flex-wrapper', {
            scrollTrigger: {
                trigger: '#parents-pride',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: "power2.out"
        });

        // Word-by-word reveal scrub for parents' message
        if (document.querySelectorAll('#parents-letter .word').length > 0) {
            gsap.to('#parents-letter .word', {
                scrollTrigger: {
                    trigger: '#parents-pride',
                    start: "top 55%",
                    end: "bottom 75%",
                    scrub: 0.5,
                },
                opacity: 1,
                y: 0,
                stagger: 0.02,
                className: "word revealed"
            });
        }

        // Alternating Vertical Timeline elements slide/fade reveals
        gsap.utils.toArray('.timeline-vertical-item').forEach(item => {
            const isLeft = item.classList.contains('left');
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                x: isLeft ? -80 : 80,
                duration: 1.0,
                ease: "power2.out"
            });
        });

        // Cousins Squad:posed image slides in from left
        gsap.from('.pos-posed', {
            scrollTrigger: {
                trigger: '#cousins-squad',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            x: -120,
            duration: 1.2,
            ease: "power3.out"
        });

        // Cousins Squad: candid image slides in from right
        gsap.from('.pos-candid', {
            scrollTrigger: {
                trigger: '#cousins-squad',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            x: 120,
            duration: 1.2,
            ease: "power3.out"
        });

        // Cousins Squad text caption reveal
        gsap.from('.cousins-caption-card', {
            scrollTrigger: {
                trigger: '#cousins-squad',
                start: "top 55%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            scale: 0.94,
            duration: 1.0,
            ease: "power2.out"
        });

        // Amazing cards Grid stagger entry
        gsap.from('.amazing-card', {
            scrollTrigger: {
                trigger: '#amazing',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 45,
            duration: 0.85,
            stagger: 0.08,
            ease: "power2.out"
        });

        // Wish Cake container entry
        gsap.from('.wish-cake-container', {
            scrollTrigger: {
                trigger: '#wish-section',
                start: "top 75%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            scale: 0.88,
            duration: 1.1,
            ease: "back.out(1.2)"
        });

        // Initialize 3D Coverflow Swiper for Gallery
        if (document.querySelector('.gallery-swiper')) {
            new Swiper('.gallery-swiper', {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                loop: true,
                coverflowEffect: {
                    rotate: 15,
                    stretch: 0,
                    depth: 250,
                    modifier: 1,
                    slideShadows: true,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                }
            });
        }
    }

    // ==========================================
    // 8. COUSINS SQUAD: SVG petals spawn
    // ==========================================
    function spawnCousinsPetals() {
        const container = document.getElementById('cousins-squad');
        if (!container) return;
        
        const petalCount = 12;
        for (let i = 0; i < petalCount; i++) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "cousins-petal");
            svg.setAttribute("viewBox", "0 0 30 30");
            svg.innerHTML = `<path d="M15 0 C25 10, 25 25, 15 30 C5 25, 5 10, 15 0" fill="#B76E79" />`;
            
            // Random styling spreads
            svg.style.left = `${Math.random() * 100}%`;
            svg.style.animationDuration = `${Math.random() * 6 + 6}s`;
            svg.style.animationDelay = `${Math.random() * 5}s`;
            
            const size = Math.random() * 14 + 14;
            svg.style.width = `${size}px`;
            svg.style.height = `${size}px`;
            
            container.appendChild(svg);
        }
    }

    // ==========================================
    // 9. THREE.JS WISH SCENE (Interactive Candle Blowout)
    // ==========================================
    let wishScene, wishCamera, wishRenderer;
    let wishCandleModel, wishFlameModel, wishSmokeParticles = [];
    let isCandleLit = true;

    function initWishScene() {
        const container = document.getElementById('wish-3d-container');
        if (!container) return;

        wishScene = new THREE.Scene();

        wishCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
        wishCamera.position.set(0, 1.6, 5.0);

        wishRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        wishRenderer.setSize(container.clientWidth, container.clientHeight);
        wishRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(wishRenderer.domElement);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffebf0, 0.7);
        wishScene.add(ambient);

        const dLight = new THREE.DirectionalLight(0xfdfbf7, 1.0);
        dLight.position.set(1, 4, 2);
        wishScene.add(dLight);

        // Burning flame candle pointlight
        const flameLight = new THREE.PointLight(0xff7c24, 2.5, 12);
        flameLight.position.set(0, 0.6, 0);
        wishScene.add(flameLight);

        // Base Plate
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.5 });
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32), plateMat);
        plate.position.y = -0.7;
        wishScene.add(plate);

        // Golden candle
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.12, metalness: 0.85 });
        wishCandleModel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16), goldMat);
        wishCandleModel.position.y = -0.225;
        wishCandleModel.name = "wish-candle";
        wishScene.add(wishCandleModel);

        // Wick
        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
        wick.position.set(0, 0.275, 0);
        wishScene.add(wick);

        // Flame Mesh
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa11, transparent: true, opacity: 0.95 });
        const flameGeo = new THREE.ConeGeometry(0.12, 0.38, 8);
        flameGeo.translate(0, 0.19, 0); // shift origin to bottom for scaling
        wishFlameModel = new THREE.Mesh(flameGeo, flameMat);
        wishFlameModel.position.set(0, 0.32, 0);
        wishFlameModel.name = "wish-flame";
        wishScene.add(wishFlameModel);

        // Smoke particles container setup
        const smokeCount = 15;
        const smokeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const smokeMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4 });
        
        for (let i = 0; i < smokeCount; i++) {
            const smoke = new THREE.Mesh(smokeGeo, smokeMat);
            smoke.visible = false;
            wishScene.add(smoke);
            wishSmokeParticles.push({
                mesh: smoke,
                speedY: Math.random() * 0.015 + 0.01,
                speedX: (Math.random() - 0.5) * 0.005,
                growth: Math.random() * 0.008 + 0.005
            });
        }

        // Raycasting click to blow out candle
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function handleCandleTouch(e) {
            if (!isCandleLit) return;
            const rect = wishRenderer.domElement.getBoundingClientRect();
            
            // Handle both touch & mouse Client positions
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, wishCamera);
            const intersects = raycaster.intersectObjects(wishScene.children, true);

            let hitCandle = false;
            intersects.forEach(h => {
                if (h.object.name === "wish-candle" || h.object.name === "wish-flame") {
                    hitCandle = true;
                }
            });

            if (hitCandle) {
                blowOutCandleAction();
            }
        }

        wishRenderer.domElement.addEventListener('mousedown', handleCandleTouch);
        wishRenderer.domElement.addEventListener('touchstart', handleCandleTouch);

        // Render Loop
        const clock = new THREE.Clock();

        function renderWish() {
            const elapsed = clock.getElapsedTime();

            // Animate flame flicker with organic random noise
            if (isCandleLit && wishFlameModel) {
                const randomNoise = (Math.random() - 0.5) * 0.06;
                const s = Math.sin(elapsed * 15) * 0.12 + randomNoise;
                wishFlameModel.scale.set(1 + s, 1.2 + s * 1.5, 1 + s);
                wishFlameModel.rotation.z = Math.sin(elapsed * 10) * 0.06 + (Math.random() - 0.5) * 0.03;
                wishFlameModel.rotation.x = (Math.random() - 0.5) * 0.03;
                flameLight.intensity = 2.5 + Math.sin(elapsed * 20) * 0.4 + (Math.random() - 0.5) * 0.35;
            } else if (!isCandleLit) {
                flameLight.intensity = Math.max(0, flameLight.intensity - 0.15);
            }

            // Animate rising smoke if blown out
            wishSmokeParticles.forEach(p => {
                if (p.mesh.visible) {
                    p.mesh.position.y += p.speedY;
                    p.mesh.position.x += p.speedX;
                    p.mesh.scale.x += p.growth;
                    p.mesh.scale.y += p.growth;
                    p.mesh.scale.z += p.growth;
                    p.mesh.material.opacity = Math.max(0, p.mesh.material.opacity - 0.01);
                    
                    if (p.mesh.material.opacity <= 0) {
                        p.mesh.visible = false;
                    }
                }
            });

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
    }

    // Trigger blowout sequence
    function blowOutCandleAction() {
        if (!isCandleLit) return;
        isCandleLit = false;

        // 1. Shrink and hide flame
        gsap.to(wishFlameModel.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                wishFlameModel.visible = false;
            }
        });

        // 2. Spawn rising smoke particles
        wishSmokeParticles.forEach((p, i) => {
            setTimeout(() => {
                p.mesh.position.set(0, 0.35, 0);
                p.mesh.scale.set(1, 1, 1);
                p.mesh.material.opacity = 0.4;
                p.mesh.visible = true;
            }, i * 110);
        });

        // 3. Play blowout procedural sound whoosh + cheer
        sound.triggerBlowoutEffects();

        // 4. Multi-directional massive Confetti Cannon burst
        const canvasRect = document.getElementById('wish-3d-container').getBoundingClientRect();
        const originY = (canvasRect.top + canvasRect.height / 2) / window.innerHeight;
        
        confetti({
            particleCount: 160,
            spread: 95,
            origin: { x: 0.5, y: originY }
        });

        setTimeout(() => {
            confetti({
                particleCount: 90,
                angle: 60,
                spread: 60,
                origin: { x: 0, y: 0.8 }
            });
            confetti({
                particleCount: 90,
                angle: 120,
                spread: 60,
                origin: { x: 1, y: 0.8 }
            });
        }, 350);

        // 5. Trigger Canvas Fireworks backdrop loop
        startFireworksBackdrop();

        // 6. Reveal success overlay card
        setTimeout(() => {
            const overlay = document.getElementById('wish-success-msg');
            if (overlay) {
                overlay.classList.add('active');
            }
        }, 1200);
    }

    // Attach to Blow candles button
    const blowBtn = document.getElementById('blow-btn');
    if (blowBtn) {
        blowBtn.addEventListener('click', blowOutCandleAction);
    }

    // ==========================================
    // 10. FIREWORKS CANVAS SIMULATION (Blowout overlay)
    // ==========================================
    const fireCanvas = document.getElementById('fireworks-canvas');
    const fireCtx = fireCanvas.getContext('2d');
    let fireworksArray = [];
    let fireParticles = [];
    let fireworksLoopId = null;

    function resizeFireworksCanvas() {
        fireCanvas.width = window.innerWidth;
        fireCanvas.height = window.innerHeight;
    }

    class Firework {
        constructor() {
            this.x = Math.random() * fireCanvas.width;
            this.y = fireCanvas.height;
            this.targetY = Math.random() * (fireCanvas.height * 0.6) + fireCanvas.height * 0.1;
            this.speed = Math.random() * 5 + 7;
            this.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
            this.reached = false;
        }

        update() {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.reached = true;
                explodeFirework(this.x, this.y, this.color);
            }
        }

        draw() {
            fireCtx.save();
            fireCtx.fillStyle = this.color;
            fireCtx.beginPath();
            fireCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            fireCtx.fill();
            fireCtx.restore();
        }
    }

    class FireParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.012;
            this.gravity = 0.06;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.alpha -= this.decay;
        }

        draw() {
            fireCtx.save();
            fireCtx.globalAlpha = this.alpha;
            fireCtx.fillStyle = this.color;
            fireCtx.shadowBlur = 8;
            fireCtx.shadowColor = this.color;
            fireCtx.beginPath();
            fireCtx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            fireCtx.fill();
            fireCtx.restore();
        }
    }

    function explodeFirework(x, y, color) {
        for (let i = 0; i < 60; i++) {
            fireParticles.push(new FireParticle(x, y, color));
        }
        // Play sweet blowout chimes procedurally with random pitches
        sound.triggerChime(68 + Math.floor(Math.random() * 12), 0.06, 0, 1.2);
    }

    function startFireworksBackdrop() {
        fireCanvas.style.display = 'block';
        resizeFireworksCanvas();
        window.addEventListener('resize', resizeFireworksCanvas);

        function loop() {
            fireCtx.fillStyle = 'rgba(5, 4, 10, 0.25)'; // slight trail tail
            fireCtx.fillRect(0, 0, fireCanvas.width, fireCanvas.height);

            // Spawn fireworks
            if (Math.random() < 0.04 && fireworksArray.length < 5) {
                fireworksArray.push(new Firework());
            }

            fireworksArray = fireworksArray.filter(f => !f.reached);
            fireworksArray.forEach(f => {
                f.update();
                f.draw();
            });

            fireParticles = fireParticles.filter(p => p.alpha > 0);
            fireParticles.forEach(p => {
                p.update();
                p.draw();
            });

            fireworksLoopId = requestAnimationFrame(loop);
        }

        loop();

        // End loop after 10 seconds to conserve GPU
        setTimeout(() => {
            if (fireworksLoopId) {
                cancelAnimationFrame(fireworksLoopId);
                fireworksLoopId = null;
                fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
                fireCanvas.style.display = 'none';
            }
        }, 10000);
    }

    // ==========================================
    // 11. PRELOADER & SIMULATED LOADING COUNT
    // ==========================================
    const progressEl = document.getElementById('progress-bar');
    const percentEl = document.getElementById('loader-percent');
    let loadedPercent = 0;

    const loaderInterval = setInterval(() => {
        // Increment loading percentage
        loadedPercent += Math.floor(Math.random() * 9) + 4;
        if (loadedPercent >= 100) {
            loadedPercent = 100;
            clearInterval(loaderInterval);

            // Fade preloader away
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';

                // Initial page load Double Side Confetti Cannon burst! (rose gold + purple + gold colors)
                confetti({
                    particleCount: 85,
                    angle: 60,
                    spread: 60,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#B76E79', '#C3B1E1', '#D4AF37']
                });
                confetti({
                    particleCount: 85,
                    angle: 120,
                    spread: 60,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#B76E79', '#C3B1E1', '#D4AF37']
                });

                // Auto-trigger confetti explosion on load if birthday has arrived (IST check)
                const now = new Date().getTime();
                const birthdayTarget = new Date('2026-05-26T00:00:00+05:30').getTime();
                if (birthdayTarget - now <= 0) {
                    setTimeout(() => {
                        confetti({
                            particleCount: 160,
                            spread: 90,
                            origin: { y: 0.6 },
                            colors: ['#B76E79', '#C3B1E1', '#D4AF37']
                        });
                    }, 500);
                }

                // Initialize heavy Three.js environments after loader closes
                initGlobalBg3D();
                initHeroScene();
                initWishScene();
                setupScrollReveals();
                spawnCousinsPetals(); // Spawn petals inside Cousins Squad
                spawnParentsPetals(); // Spawn petals inside Parents' Pride
                spawnHeartParticles(); // Spawn rising hearts inside Parents' Pride

                // Delayed start for balloons: float up 1.5s after load
                setTimeout(() => {
                    balloonsActive = true;
                }, 1500);

                // Setup Typewriter subtitles in Hero (Upgraded loop)
                new Typed('#typed-welcome', {
                    strings: [
                        "You are 24 & absolutely magical ✨",
                        "You are loved beyond words 💖",
                        "Your best chapter starts today 🦋"
                    ],
                    typeSpeed: 45,
                    backSpeed: 25,
                    loop: true,
                    backDelay: 2500
                });

                // Staggered hero elements reveal entrance animation using GSAP
                const heroTL = gsap.timeline({ delay: 0.2 });
                // Make sure elements start from hidden/shifted state
                gsap.set('.shimmer-letter', { opacity: 0, y: 15 });
                gsap.set('.hero-title .title-bottom', { opacity: 0, scale: 0.82 });
                gsap.set('.hero-tagline', { opacity: 0, y: 15 });
                gsap.set('.hero-subtext', { opacity: 0, y: 15 });
                gsap.set('#countdown', { opacity: 0, scale: 0.9, y: 20 });
                gsap.set('#celebrate-btn', { opacity: 0, y: 15 });
                gsap.set('.hero-polaroid-frame', { opacity: 0, rotation: -12, y: 60 });
                gsap.set('.hero-extra-portrait', { opacity: 0, scale: 0 });

                heroTL.to('.shimmer-letter', {
                    opacity: 1,
                    y: 0,
                    stagger: 0.04,
                    duration: 0.55,
                    ease: "power2.out"
                })
                .to('.hero-title .title-bottom', {
                    opacity: 1,
                    scale: 1,
                    duration: 0.75,
                    ease: "back.out(1.7)"
                }, "-=0.25")
                .to('.hero-tagline', {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                }, "-=0.2")
                .to('.hero-subtext', {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                }, "-=0.25")
                .to('#countdown', {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.75,
                    ease: "back.out(1.5)"
                }, "-=0.25")
                .to('#celebrate-btn', {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                }, "-=0.25")
                .to('.hero-extra-portrait', {
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    ease: "back.out(1.7)"
                }, "-=0.35")
                .to('.hero-polaroid-frame', {
                    opacity: 1,
                    rotation: 4, // end rotation matches floating styling
                    y: 0,
                    duration: 1.1,
                    ease: "power3.out"
                }, "-=0.9");

            }, 550);
        }

        if (progressEl) progressEl.style.width = `${loadedPercent}%`;
        if (percentEl) percentEl.innerText = `${loadedPercent}%`;
    }, 95);

    // "Celebrate Now" action
    const celebrateBtn = document.getElementById('celebrate-btn');
    if (celebrateBtn) {
        celebrateBtn.addEventListener('click', () => {
            // Trigger music play (or toggle state indicator)
            if (sound.isMuted) {
                audioBtn.classList.remove('muted');
                audioBtn.classList.add('playing');
                sound.startBGM();
            }

            // Confetti Cannon explosion
            confetti({
                particleCount: 110,
                spread: 75,
                origin: { y: 0.6 }
            });

            // Smooth scroll down to letter note
            const messageSec = document.getElementById('message');
            if (messageSec) {
                messageSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ==========================================
    // 12. LIGHTBOX CAPTION MODAL OVERLAYS (Fixes & Keyboard Navigation)
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    let currentGalleryIndex = 0;
    const galleryData = [];

    // Query and store gallery images
    const galleryCards = document.querySelectorAll('.gallery-item');
    galleryCards.forEach((card, index) => {
        galleryData.push({
            src: card.getAttribute('data-src'),
            caption: card.getAttribute('data-caption')
        });
        
        card.addEventListener('click', () => {
            currentGalleryIndex = index;
            openLightbox(index);
        });
    });

    function openLightbox(index) {
        if (index < 0 || index >= galleryData.length) return;
        const item = galleryData[index];
        if (lightboxImg && lightboxCap && lightbox) {
            lightboxImg.src = item.src;
            lightboxCap.innerText = item.caption;
            lightbox.classList.add('active');
            sound.triggerChime(69, 0.08, 0, 1.5); // soft bell sound
        }
    }

    // Lightbox arrows click
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
            openLightbox(currentGalleryIndex);
        });
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
            openLightbox(currentGalleryIndex);
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                lightbox.classList.remove('active');
            }
        });
    }

    // Keyboard support: Escape closes, Arrows navigate prev/next
    window.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
        } else if (e.key === 'ArrowRight') {
            currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
            openLightbox(currentGalleryIndex);
        } else if (e.key === 'ArrowLeft') {
            currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
            openLightbox(currentGalleryIndex);
        }
    });

    // ==========================================
    // 13. COUNTDOWN TO MAY 26, 2026 (Birthday Arrived Banner)
    // ==========================================
    const birthdayTarget = new Date('2026-05-26T00:00:00+05:30').getTime();

    function tickCountdown() {
        const now = new Date().getTime();
        const diff = birthdayTarget - now;

        const countdownWrapper = document.getElementById('countdown');
        if (!countdownWrapper) return;

        // If birthday has already arrived or passed!
        if (diff <= 0) {
            countdownWrapper.innerHTML = `
                <div class="birthday-now-glow">
                    🎉 IT'S YOUR DAY, MUSKAN! 🎂
                </div>
            `;
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const updateNumber = (id, newVal) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.innerText !== newVal) {
                el.classList.remove('flip');
                void el.offsetWidth; // trigger reflow
                el.innerText = newVal;
                el.classList.add('flip');
            }
        };

        updateNumber('days', String(d).padStart(2, '0'));
        updateNumber('hours', String(h).padStart(2, '0'));
        updateNumber('minutes', String(m).padStart(2, '0'));
        updateNumber('seconds', String(s).padStart(2, '0'));
    }

    setInterval(tickCountdown, 1000);
    tickCountdown();

    // ==========================================
    // 14. RELIGHT CANDLE & BACK TO TOP BUTTON LOGIC
    // ==========================================
    const relightBtn = document.getElementById('relight-btn');
    if (relightBtn) {
        relightBtn.addEventListener('click', () => {
            isCandleLit = true;
            if (wishFlameModel) {
                wishFlameModel.visible = true;
                wishFlameModel.scale.set(1, 1, 1);
            }
            const overlay = document.getElementById('wish-success-msg');
            if (overlay) {
                overlay.classList.remove('active');
            }
            if (fireworksLoopId) {
                cancelAnimationFrame(fireworksLoopId);
                fireworksLoopId = null;
            }
            if (fireCtx) {
                fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
            }
            fireCanvas.style.display = 'none';
            sound.triggerChime(72, 0.12, 0, 1.5);
        });
    }

    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            sound.triggerChime(76, 0.1, 0, 1.2);
        });
    }

    // Custom Toast Notification displayer
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // ==========================================
    // 15. SHARE LINKS & WHATSAPP INTEGRATION
    // ==========================================
    const copyLinkBtn = document.getElementById('share-btn');
    const waShareBtn = document.getElementById('whatsapp-share-btn');
    const wishShareBtn = document.getElementById('social-wish-btn');

    const shareText = "Check out this beautiful interactive 3D birthday celebration site built for Muskan Singla's 24th birthday! 🌸";

    function copyToClipboard() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast("Birthday page link successfully copied to clipboard! Share it with family & friends! 💖");
        }).catch(err => {
            console.error("Clipboard copy failed: ", err);
            showToast("Could not copy link automatically. Please copy the URL from your address bar!");
        });
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: "Happy 24th Birthday, Muskan! 🎂✨",
                    text: shareText,
                    url: window.location.href
                }).catch(err => {
                    console.log("Web Share failed, copying link:", err);
                    copyToClipboard();
                });
            } else {
                copyToClipboard();
            }
        });
    }

    if (waShareBtn) {
        waShareBtn.addEventListener('click', () => {
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + window.location.href)}`;
            window.open(waUrl, '_blank');
        });
    }

    if (wishShareBtn) {
        wishShareBtn.addEventListener('click', () => {
            const text = "Muskan blew out her 24th birthday candle and sent a wish to the stars! Check out her website: ";
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + window.location.href)}`;
            window.open(waUrl, '_blank');
        });
    }

    // ==========================================
    // 16. DESKTOP CURSOR SPARKLE TRAIL
    // ==========================================
    const trailCanvas = document.getElementById('trail-canvas');
    const trailCtx = trailCanvas.getContext('2d');
    let particles = [];

    function resizeTrailCanvas() {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    }
    resizeTrailCanvas();
    window.addEventListener('resize', resizeTrailCanvas);

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color, alpha) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius)
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y)
            rot += step

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y)
            rot += step
        }
        ctx.lineTo(cx, cy - outerRadius)
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    class Sparkle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2.5 + 1.2;
            const colors = ['#D4AF37', '#F7E7CE', '#B76E79', '#FFB6C1', '#FFC0CB'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vx = (Math.random() - 0.5) * 2.0;
            this.vy = (Math.random() - 0.5) * 2.0 - 0.4; // slight upward drift
            this.alpha = 1.0;
            this.decay = Math.random() * 0.03 + 0.02; // fades out in ~0.5s
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw() {
            drawStar(trailCtx, this.x, this.y, 5, this.size * 2.2, this.size * 1.1, this.color, this.alpha);
        }
    }

    window.addEventListener('mousemove', (e) => {
        // Spawn 6 star sparkles (range 5-8) per frame mouse moves
        for (let i = 0; i < 6; i++) {
            particles.push(new Sparkle(e.clientX, e.clientY));
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            for (let i = 0; i < 6; i++) {
                particles.push(new Sparkle(e.touches[0].clientX, e.touches[0].clientY));
            }
        }
    });

    function animateSparkles() {
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        
        particles = particles.filter(p => p.alpha > 0);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateSparkles);
    }
    animateSparkles();
});
