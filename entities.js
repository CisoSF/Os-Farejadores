/**
 * Entidades — Os Farejadores
 * Jogador, inimigos e NPCs com sprites animados e IA
 */

// ============================================================
// Classe Base
// ============================================================
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.vx = 0;
        this.vy = 0;
        this.speed = 100;
        
        this.direction = 'down';
        this.isMoving = false;
        
        this.maxHealth = 100;
        this.health = 100;
        this.isDead = false;
        this.deathTimer = 0.6; // Tempo de animação de morte
        
        // Animação
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 0.15; // Segundos por frame
        this.animFrameCount = 4;
        
        // Efeito de dano
        this.hitFlash = 0;
    }
    
    update(dt, map) {
        if (this.isDead) {
            this.deathTimer -= dt;
            return;
        }
        
        // Movimento com colisão
        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;
        
        if (!map.checkCollision({ x: nextX, y: this.y, width: this.width, height: this.height })) {
            this.x = nextX;
        } else {
            this.vx = 0;
        }
        
        if (!map.checkCollision({ x: this.x, y: nextY, width: this.width, height: this.height })) {
            this.y = nextY;
        } else {
            this.vy = 0;
        }
        
        // Atualizar direção
        if (Math.abs(this.vx) > Math.abs(this.vy)) {
            this.direction = this.vx > 0 ? 'right' : 'left';
        } else if (Math.abs(this.vy) > 0) {
            this.direction = this.vy > 0 ? 'down' : 'up';
        }
        
        this.isMoving = this.vx !== 0 || this.vy !== 0;
        
        // Animação
        if (this.isMoving) {
            this.animTimer += dt;
            if (this.animTimer >= this.animSpeed) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % this.animFrameCount;
            }
        } else {
            this.animFrame = 0;
        }
        
        // Hit flash
        if (this.hitFlash > 0) this.hitFlash -= dt;
    }
    
    drawSprite(ctx, image, frameW, frameH, row, col) {
        if (!image) return false;
        
        try {
            ctx.drawImage(
                image,
                col * frameW, row * frameH, frameW, frameH,
                this.x, this.y, this.width, this.height
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    
    drawFallback(ctx, color, time) {
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2, this.y + this.height,
            this.width / 2 - 2, 5, 0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Corpo com hit flash
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#ffffff';
        } else if (this.isDead) {
            ctx.fillStyle = '#333333';
        } else {
            ctx.fillStyle = color;
        }
        
        // Forma do corpo
        ctx.fillRect(this.x + 2, this.y + this.height * 0.35, this.width - 4, this.height * 0.65);
        
        // Cabeça
        ctx.fillRect(this.x + 4, this.y, this.width - 8, this.height * 0.4);
        
        // Olhos baseados na direção
        ctx.fillStyle = '#000';
        if (this.direction === 'down') {
            ctx.fillRect(this.x + 7, this.y + 8, 4, 4);
            ctx.fillRect(this.x + this.width - 11, this.y + 8, 4, 4);
        } else if (this.direction === 'right') {
            ctx.fillRect(this.x + this.width - 9, this.y + 8, 4, 4);
        } else if (this.direction === 'left') {
            ctx.fillRect(this.x + 5, this.y + 8, 4, 4);
        }
        
        // Animação de caminhada
        if (this.isMoving && !this.isDead) {
            const legOffset = Math.sin(time * 8) * 3;
            ctx.fillStyle = color;
            ctx.fillRect(this.x + 4, this.y + this.height * 0.75 + legOffset, 8, 8);
            ctx.fillRect(this.x + this.width - 12, this.y + this.height * 0.75 - legOffset, 8, 8);
        }
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.hitFlash = 0.15;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        engine.particles.emitBlood(this.x + this.width / 2, this.y + this.height / 2);
    }
    
    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    get centerX() { return this.x + this.width / 2; }
    get centerY() { return this.y + this.height / 2; }
    
    get bounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    overlaps(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// ============================================================
// Jogador — O Farejador
// ============================================================
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 28, 36);
        this.speed = 160;
        this.name = 'O Farejador';
        
        // Combate
        this.attackCooldown = 0;
        this.attackRate = 0.45;
        this.attackRange = 45;
        this.attackDamage = 25;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDir = { x: 0, y: 1 };
        
        // Stamina (para corrida futura)
        this.maxStamina = 100;
        this.stamina = 100;
        
        // Habilidade especial: Faro (detecta inimigos próximos)
        this.faroActive = false;
        this.faroCooldown = 0;
        this.faroRate = 8;
        this.faroDuration = 0;
        
        // Sprite: 4 linhas (down, left, right, up), 4 colunas
        this.spriteRowMap = { down: 0, left: 1, right: 2, up: 3 };
    }
    
    update(dt, input, map, entities) {
        if (this.isDead) return;
        
        this.vx = 0;
        this.vy = 0;
        
        if (!this.isAttacking) {
            if (input.isPressed('left'))  this.vx = -this.speed;
            if (input.isPressed('right')) this.vx =  this.speed;
            if (input.isPressed('up'))    this.vy = -this.speed;
            if (input.isPressed('down'))  this.vy =  this.speed;
            
            // Normalizar diagonal
            if (this.vx !== 0 && this.vy !== 0) {
                const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx = (this.vx / len) * this.speed;
                this.vy = (this.vy / len) * this.speed;
            }
        }
        
        super.update(dt, map);
        
        // Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.faroCooldown > 0) this.faroCooldown -= dt;
        
        // Ataque
        if (this.isAttacking) {
            this.attackTimer -= dt;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }
        
        // Faro
        if (this.faroActive) {
            this.faroDuration -= dt;
            if (this.faroDuration <= 0) this.faroActive = false;
        }
        
        // Ação
        if (input.isJustPressed('action') && this.attackCooldown <= 0 && !this.isAttacking) {
            this.attack(entities);
        }
    }
    
    attack(entities) {
        this.isAttacking = true;
        this.attackTimer = 0.25;
        this.attackCooldown = this.attackRate;
        
        // Direção do ataque
        const dirMap = {
            up:    { x: 0, y: -1 },
            down:  { x: 0, y:  1 },
            left:  { x: -1, y: 0 },
            right: { x:  1, y: 0 }
        };
        this.attackDir = dirMap[this.direction];
        
        // Hitbox do ataque
        const ar = this.attackRange;
        const aw = 30, ah = 30;
        let ax = this.centerX - aw / 2 + this.attackDir.x * ar;
        let ay = this.centerY - ah / 2 + this.attackDir.y * ar;
        
        const attackRect = { x: ax, y: ay, width: aw, height: ah };
        
        let hitCount = 0;
        for (const entity of entities) {
            if (entity instanceof Enemy && !entity.isDead) {
                if (this.rectsOverlap(attackRect, entity.bounds)) {
                    entity.takeDamage(this.attackDamage);
                    hitCount++;
                    
                    // Knockback
                    entity.x += this.attackDir.x * 15;
                    entity.y += this.attackDir.y * 15;
                    
                    engine.shakeScreen(4, 0.15);
                }
            }
        }
        
        if (hitCount === 0) {
            // Partículas de corte no ar
            engine.particles.emit(
                this.centerX + this.attackDir.x * 30,
                this.centerY + this.attackDir.y * 30,
                { count: 3, speed: 40, color: '#888888', life: 0.2 }
            );
        }
    }
    
    rectsOverlap(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }
    
    draw(ctx, time) {
        if (this.isDead) {
            ctx.globalAlpha = Math.max(0, this.deathTimer / 0.6);
        }
        
        const img = engine.assetLoader.get('player');
        const row = this.spriteRowMap[this.direction] || 0;
        
        // Tentar desenhar sprite
        const spriteW = img ? img.naturalWidth / 4 : 0;
        const spriteH = img ? img.naturalHeight / 4 : 0;
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(this.centerX, this.y + this.height, this.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        }
        
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, this.animFrame * spriteW, row * spriteH, spriteW, spriteH,
                this.x, this.y, this.width, this.height);
        } else {
            this.drawFallback(ctx, '#4a5c4a', time);
        }
        
        // Efeito de ataque
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(220, 220, 200, 0.8)';
            const ar = this.attackRange;
            const ad = this.attackDir;
            
            ctx.save();
            ctx.translate(this.centerX + ad.x * ar * 0.5, this.centerY + ad.y * ar * 0.5);
            ctx.rotate(Math.atan2(ad.y, ad.x));
            ctx.fillRect(-ar * 0.5, -4, ar, 8);
            ctx.restore();
        }
        
        // Indicador de interação com NPC
        const nearNPC = engine.entities.find(e => e instanceof NPC && this.distanceTo(e) < 55);
        if (nearNPC) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('[ESPAÇO]', this.centerX, this.y - 10);
            ctx.textAlign = 'left';
        }
        
        ctx.globalAlpha = 1;
    }
    
    takeDamage(amount) {
        super.takeDamage(amount);
        ui.updateHealth(this.health, this.maxHealth);
        engine.shakeScreen(6, 0.2);
        
        if (this.isDead) {
            setTimeout(() => {
                engine.setState('GAME_OVER');
                document.getElementById('game-over').classList.remove('hidden');
            }, 700);
        }
    }
}

// ============================================================
// Inimigos
// ============================================================
class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, 28, 28);
        this.type = type;
        
        this.state = 'IDLE';
        this.detectionRange = 220;
        this.attackCooldown = 0;
        this.attackRate = 1.5;
        this.attackRange = 32;
        this.attackDamage = 12;
        
        // Patrulha
        this.patrolTimer = 0;
        this.patrolDir = { x: 0, y: 0 };
        this.patrolDuration = 0;
        
        this.configure(type);
    }
    
    configure(type) {
        switch (type) {
            case 'CULTIST':
                this.name = 'Cultista Sombrio';
                this.color = '#5a2a2a';
                this.speed = 75;
                this.maxHealth = this.health = 60;
                this.attackDamage = 15;
                this.attackRate = 1.8;
                this.detectionRange = 200;
                this.spriteKey = 'cultist';
                this.width = 26;
                this.height = 34;
                break;
                
            case 'BEAST':
                this.name = 'Fera Corrompida';
                this.color = '#1a0a2a';
                this.speed = 130;
                this.maxHealth = this.health = 40;
                this.attackDamage = 10;
                this.attackRate = 0.9;
                this.detectionRange = 250;
                this.spriteKey = 'beast';
                this.width = 34;
                this.height = 24;
                break;
                
            case 'SHAMAN':
                this.name = 'Xamã Corrompido';
                this.color = '#3a1a4a';
                this.speed = 55;
                this.maxHealth = this.health = 80;
                this.attackDamage = 20;
                this.attackRate = 2.5;
                this.detectionRange = 280;
                this.spriteKey = 'cultist';
                this.width = 26;
                this.height = 34;
                break;
        }
    }
    
    update(dt, map, player) {
        if (this.isDead) {
            this.deathTimer -= dt;
            return;
        }
        
        this.vx = 0;
        this.vy = 0;
        
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        
        if (player && !player.isDead) {
            const dist = this.distanceTo(player);
            
            if (dist < this.detectionRange) {
                this.state = 'CHASE';
                
                if (dist < this.attackRange) {
                    this.state = 'ATTACK';
                    if (this.attackCooldown <= 0) {
                        this.attackPlayer(player);
                    }
                } else {
                    // Perseguir jogador
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    this.vx = (dx / len) * this.speed;
                    this.vy = (dy / len) * this.speed;
                }
            } else {
                this.state = 'IDLE';
                this.patrol(dt);
            }
        }
        
        super.update(dt, map);
    }
    
    patrol(dt) {
        this.patrolTimer -= dt;
        if (this.patrolTimer <= 0) {
            // Nova direção aleatória de patrulha
            const angle = Math.random() * Math.PI * 2;
            this.patrolDir = { x: Math.cos(angle), y: Math.sin(angle) };
            this.patrolTimer = 1 + Math.random() * 2;
            this.patrolDuration = 0.5 + Math.random() * 1;
        }
        
        if (this.patrolDuration > 0) {
            this.vx = this.patrolDir.x * this.speed * 0.4;
            this.vy = this.patrolDir.y * this.speed * 0.4;
            this.patrolDuration -= 0.016; // Aproximação
        }
    }
    
    attackPlayer(player) {
        this.attackCooldown = this.attackRate;
        player.takeDamage(this.attackDamage);
        
        // Partículas de impacto
        engine.particles.emitBlood(player.centerX, player.centerY);
    }
    
    draw(ctx, time) {
        if (this.deathTimer <= 0) return;
        
        // Opacidade na morte
        if (this.isDead) {
            ctx.globalAlpha = Math.max(0, this.deathTimer / 0.6);
        }
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(this.centerX, this.y + this.height, this.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const img = engine.assetLoader.get(this.spriteKey);
        
        if (img && img.complete && img.naturalWidth > 0) {
            if (this.hitFlash > 0) {
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.globalAlpha = this.isDead ? Math.max(0, this.deathTimer / 0.6) : 1;
            }
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            this.drawFallback(ctx, this.color, time);
        }
        
        // Barra de vida (apenas quando perseguindo)
        if (this.state === 'CHASE' || this.state === 'ATTACK') {
            this.drawHealthBar(ctx);
        }
        
        // Indicador de estado
        if (this.state === 'CHASE' || this.state === 'ATTACK') {
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(this.centerX - 3, this.y - 14, 6, 6);
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawHealthBar(ctx) {
        const barW = this.width + 10;
        const barH = 5;
        const barX = this.x - 5;
        const barY = this.y - 10;
        const pct = this.health / this.maxHealth;
        
        ctx.fillStyle = '#1a0a0a';
        ctx.fillRect(barX, barY, barW, barH);
        
        ctx.fillStyle = pct > 0.5 ? '#8a1c1c' : '#cc2222';
        ctx.fillRect(barX, barY, barW * pct, barH);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
    }
    
    die() {
        super.die();
        ui.logCombat(`${this.name} foi abatido!`, 'info');
        engine.particles.emitSpirit(this.centerX, this.centerY);
    }
}

// ============================================================
// NPC
// ============================================================
class NPC extends Entity {
    constructor(x, y, name, dialogues, spriteKey) {
        super(x, y, 28, 36);
        this.name = name;
        this.dialogues = dialogues;
        this.spriteKey = spriteKey || 'paje';
        this.interactionRange = 55;
        this.hasInteracted = false;
        
        // Animação idle (balanço suave)
        this.idleTimer = 0;
    }
    
    update(dt, map, player) {
        this.idleTimer += dt;
        
        if (player && !player.isDead && engine.state === 'PLAYING') {
            const dist = this.distanceTo(player);
            
            if (dist < this.interactionRange && engine.input.isJustPressed('action')) {
                ui.startDialogue(this.name, this.dialogues);
                this.hasInteracted = true;
            }
        }
    }
    
    draw(ctx, time) {
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(this.centerX, this.y + this.height, this.width / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const img = engine.assetLoader.get(this.spriteKey);
        
        if (img && img.complete && img.naturalWidth > 0) {
            // Balanço suave idle
            const sway = Math.sin(this.idleTimer * 1.5) * 1;
            ctx.save();
            ctx.translate(this.centerX, this.y + this.height);
            ctx.rotate(sway * 0.02);
            ctx.drawImage(img, -this.width / 2, -this.height, this.width, this.height);
            ctx.restore();
        } else {
            this.drawFallback(ctx, '#4a4a6c', time);
        }
        
        // Nome do NPC
        ctx.fillStyle = '#aaaaff';
        ctx.font = '14px VT323, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.centerX, this.y - 12);
        ctx.textAlign = 'left';
        
        // Indicador de exclamação (antes de interagir)
        if (!this.hasInteracted) {
            const bounce = Math.sin(time * 3) * 3;
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 18px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.centerX, this.y - 25 + bounce);
            ctx.textAlign = 'left';
        }
    }
}
