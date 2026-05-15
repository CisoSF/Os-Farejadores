/**
 * Mobile Controls — Os Farejadores
 * Suporte a touch para Android/iOS
 */

class MobileControls {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.isTouching = false;
        this.joystickRadius = 60;
        this.joystickDeadzone = 20;
        
        this.canvas = document.getElementById('game-canvas');
        this.init();
    }
    
    init() {
        // Detectar se é mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!this.isMobile) return;
        
        // Eventos de touch
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Criar UI de controles
        this.createMobileUI();
        
        // Desabilitar scroll
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
    }
    
    onTouchStart(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        this.touchStartX = touch.clientX - rect.left;
        this.touchStartY = touch.clientY - rect.top;
        this.touchCurrentX = this.touchStartX;
        this.touchCurrentY = this.touchStartY;
        this.isTouching = true;
        
        // Se tocar na metade direita, é ataque
        if (this.touchStartX > this.canvas.width / 2) {
            engine.input.keys['action'] = true;
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        
        if (!this.isTouching) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        this.touchCurrentX = touch.clientX - rect.left;
        this.touchCurrentY = touch.clientY - rect.top;
        
        // Se tocar na metade esquerda, é movimento
        if (this.touchStartX < this.canvas.width / 2) {
            this.updateMovement();
        }
    }
    
    onTouchEnd(e) {
        e.preventDefault();
        
        this.isTouching = false;
        engine.input.keys['up'] = false;
        engine.input.keys['down'] = false;
        engine.input.keys['left'] = false;
        engine.input.keys['right'] = false;
        engine.input.keys['action'] = false;
    }
    
    updateMovement() {
        const dx = this.touchCurrentX - this.touchStartX;
        const dy = this.touchCurrentY - this.touchStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Resetar movimento
        engine.input.keys['up'] = false;
        engine.input.keys['down'] = false;
        engine.input.keys['left'] = false;
        engine.input.keys['right'] = false;
        
        // Aplicar deadzone
        if (distance < this.joystickDeadzone) return;
        
        // Determinar direção
        const angle = Math.atan2(dy, dx);
        const angleDeg = (angle * 180 / Math.PI + 360) % 360;
        
        // 8 direções
        if ((angleDeg > 337.5 || angleDeg < 22.5)) {
            engine.input.keys['right'] = true;
        } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
            engine.input.keys['right'] = true;
            engine.input.keys['down'] = true;
        } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
            engine.input.keys['down'] = true;
        } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
            engine.input.keys['down'] = true;
            engine.input.keys['left'] = true;
        } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
            engine.input.keys['left'] = true;
        } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
            engine.input.keys['left'] = true;
            engine.input.keys['up'] = true;
        } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
            engine.input.keys['up'] = true;
        } else if (angleDeg >= 292.5 && angleDeg < 337.5) {
            engine.input.keys['right'] = true;
            engine.input.keys['up'] = true;
        }
    }
    
    createMobileUI() {
        // Criar overlay de controles
        const controlsOverlay = document.createElement('div');
        controlsOverlay.id = 'mobile-controls';
        controlsOverlay.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 150px;
            background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 20px;
            pointer-events: none;
            font-family: 'VT323', monospace;
            font-size: 12px;
            color: #666;
        `;
        
        controlsOverlay.innerHTML = `
            <div style="text-align: left;">
                <div>← Movimento →</div>
                <div>↑ Toque Esquerdo ↓</div>
            </div>
            <div style="text-align: right;">
                <div>Toque Direito</div>
                <div>ATACAR</div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(controlsOverlay);
    }
    
    draw(ctx) {
        if (!this.isMobile || !this.isTouching) return;
        
        // Desenhar joystick visual
        const rect = this.canvas.getBoundingClientRect();
        
        // Se tocar na metade esquerda, desenhar joystick
        if (this.touchStartX < this.canvas.width / 2) {
            // Círculo externo
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.touchStartX, this.touchStartY, this.joystickRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Círculo interno
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(this.touchCurrentX, this.touchCurrentY, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Linha de conexão
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.touchStartX, this.touchStartY);
            ctx.lineTo(this.touchCurrentX, this.touchCurrentY);
            ctx.stroke();
        } else {
            // Botão de ataque
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(this.touchCurrentX, this.touchCurrentY, 40, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.touchCurrentX, this.touchCurrentY, 40, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 24px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚔', this.touchCurrentX, this.touchCurrentY);
        }
    }
}

// Instância global
const mobileControls = new MobileControls();

// Injetar draw dos controles
const originalEngineDraw = Engine.prototype.draw;
Engine.prototype.draw = function() {
    originalEngineDraw.call(this);
    
    if (mobileControls.isMobile) {
        this.ctx.save();
        mobileControls.draw(this.ctx);
        this.ctx.restore();
    }
};
