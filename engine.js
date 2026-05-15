/**
 * Mournwood Engine — Os Farejadores: Sombras de Manaus
 * Motor principal do jogo com suporte a sprites, câmera e partículas
 */

class Engine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Estado do jogo
        this.state = 'MENU'; // MENU, PLAYING, DIALOGUE, GAME_OVER, CUTSCENE
        this.lastTime = 0;
        this.deltaTime = 0;
        this.totalTime = 0;
        
        // Sistemas
        this.input = new InputHandler();
        this.camera = new Camera(this.width, this.height);
        this.particles = new ParticleSystem();
        this.assetLoader = new AssetLoader();
        
        // Entidades
        this.player = null;
        this.entities = [];
        this.map = null;
        
        // Efeitos de tela
        this.screenShake = { x: 0, y: 0, duration: 0, intensity: 0 };
        this.fadeAlpha = 0;
        this.fadeTarget = 0;
        this.fadeSpeed = 2;
        
        this.loop = this.loop.bind(this);
    }
    
    init() {
        this.input.init();
        
        // Carregar assets
        this.assetLoader.load([
            { id: 'player', src: 'assets/player_sprite.png' },
            { id: 'cultist', src: 'assets/enemy_cultist.png' },
            { id: 'beast', src: 'assets/enemy_beast.png' },
            { id: 'paje', src: 'assets/npc_pajé.png' },
            { id: 'title_bg', src: 'assets/title_bg.png' },
            { id: 'tileset', src: 'assets/tileset_jungle.png' }
        ], () => {
            console.log('Assets carregados com sucesso!');
        });
    }
    
    start() {
        this.state = 'PLAYING';
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }
    
    loop(timestamp) {
        this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;
        this.totalTime += this.deltaTime;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(this.loop);
    }
    
    update() {
        if (this.state === 'PLAYING') {
            if (this.player) {
                this.player.update(this.deltaTime, this.input, this.map, this.entities);
                this.camera.follow(this.player, this.map);
            }
            
            for (let i = this.entities.length - 1; i >= 0; i--) {
                const entity = this.entities[i];
                entity.update(this.deltaTime, this.map, this.player);
                if (entity.isDead && entity.deathTimer <= 0) {
                    this.entities.splice(i, 1);
                }
            }
            
            this.particles.update(this.deltaTime);
        } else if (this.state === 'DIALOGUE') {
            if (this.input.isJustPressed('action')) {
                ui.advanceDialogue();
            }
        }
        
        // Screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= this.deltaTime;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
        
        // Fade
        if (this.fadeAlpha !== this.fadeTarget) {
            const diff = this.fadeTarget - this.fadeAlpha;
            this.fadeAlpha += Math.sign(diff) * this.fadeSpeed * this.deltaTime;
            if (Math.abs(diff) < 0.01) this.fadeAlpha = this.fadeTarget;
        }
        
        this.input.update();
    }
    
    draw() {
        this.ctx.fillStyle = '#0a0f0d';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        if (this.map) {
            this.map.drawBase(this.ctx, this.camera, this.totalTime);
        }
        
        // Ordenar por Y (profundidade)
        const renderList = [...this.entities];
        if (this.player) renderList.push(this.player);
        renderList.sort((a, b) => (a.y + a.height) - (b.y + b.height));
        
        for (const entity of renderList) {
            entity.draw(this.ctx, this.totalTime);
        }
        
        this.particles.draw(this.ctx);
        
        if (this.map) {
            this.map.drawOverlay(this.ctx, this.camera, this.totalTime);
        }
        
        this.ctx.restore();
        
        // Vinheta (em coordenadas de tela)
        this.drawVignette();
        
        // Fade overlay
        if (this.fadeAlpha > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    drawVignette() {
        if (!this.player) return;
        
        const screenCenterX = this.width / 2;
        const screenCenterY = this.height / 2;
        
        const gradient = this.ctx.createRadialGradient(
            screenCenterX, screenCenterY, 80,
            screenCenterX, screenCenterY, 420
        );
        
        gradient.addColorStop(0, 'rgba(10, 15, 13, 0)');
        gradient.addColorStop(0.7, 'rgba(10, 15, 13, 0.3)');
        gradient.addColorStop(1, 'rgba(10, 15, 13, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    shakeScreen(intensity = 5, duration = 0.3) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    fadeIn(speed = 2) {
        this.fadeAlpha = 1;
        this.fadeTarget = 0;
        this.fadeSpeed = speed;
    }
    
    fadeOut(speed = 2) {
        this.fadeAlpha = 0;
        this.fadeTarget = 1;
        this.fadeSpeed = speed;
    }
    
    setState(newState) {
        this.state = newState;
    }
}

// ============================================================
// Input Handler
// ============================================================
class InputHandler {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        
        this.keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right',
            ' ': 'action', 'Enter': 'action',
            'Escape': 'menu'
        };
    }
    
    init() {
        window.addEventListener('keydown', (e) => {
            const action = this.keyMap[e.key];
            if (action) {
                this.keys[action] = true;
                if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const action = this.keyMap[e.key];
            if (action) this.keys[action] = false;
        });
    }
    
    update() {
        this.previousKeys = { ...this.keys };
    }
    
    isPressed(action) { return !!this.keys[action]; }
    isJustPressed(action) { return !!this.keys[action] && !this.previousKeys[action]; }
}

// ============================================================
// Camera
// ============================================================
class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.smoothing = 0.1; // Suavização da câmera
    }
    
    follow(target, map) {
        if (!target || !map) return;
        
        const targetX = target.x + target.width / 2 - this.width / 2;
        const targetY = target.y + target.height / 2 - this.height / 2;
        
        // Interpolação suave
        this.x += (targetX - this.x) * 0.15;
        this.y += (targetY - this.y) * 0.15;
        
        // Limitar aos limites do mapa
        const mapPixelW = map.width * map.tileSize;
        const mapPixelH = map.height * map.tileSize;
        
        this.x = Math.max(0, Math.min(this.x, mapPixelW - this.width));
        this.y = Math.max(0, Math.min(this.y, mapPixelH - this.height));
    }
}

// ============================================================
// Asset Loader
// ============================================================
class AssetLoader {
    constructor() {
        this.images = {};
        this.loaded = 0;
        this.total = 0;
    }
    
    load(assets, callback) {
        this.total = assets.length;
        
        if (this.total === 0) {
            callback && callback();
            return;
        }
        
        for (const asset of assets) {
            const img = new Image();
            img.onload = () => {
                this.loaded++;
                if (this.loaded >= this.total) {
                    callback && callback();
                }
            };
            img.onerror = () => {
                console.warn(`Falha ao carregar: ${asset.src}`);
                this.loaded++;
                if (this.loaded >= this.total) {
                    callback && callback();
                }
            };
            img.src = asset.src;
            this.images[asset.id] = img;
        }
    }
    
    get(id) {
        return this.images[id] || null;
    }
}

// ============================================================
// Particle System
// ============================================================
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, options = {}) {
        const count = options.count || 5;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * (options.speed || 60),
                vy: (Math.random() - 0.5) * (options.speed || 60) - (options.upward ? 30 : 0),
                life: 1,
                maxLife: options.life || 0.5,
                color: options.color || '#ff5555',
                size: options.size || 3
            });
        }
    }
    
    emitBlood(x, y) {
        this.emit(x, y, { count: 8, speed: 80, color: '#8a1c1c', life: 0.4, upward: true });
    }
    
    emitSpirit(x, y) {
        this.emit(x, y, { count: 5, speed: 30, color: '#2d5a27', life: 1.0, upward: true, size: 4 });
    }
    
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 50 * dt; // Gravidade
            p.life -= dt / p.maxLife;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }
}
