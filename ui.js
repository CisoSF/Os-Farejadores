/**
 * Sistema de Interface — Os Farejadores
 * HUD, Diálogos, Minimapa e Log de Combate
 */

class UI {
    constructor() {
        this.healthBar = document.getElementById('health-bar');
        this.healthText = document.getElementById('health-text');
        
        this.dialogueBox = document.getElementById('dialogue-box');
        this.speakerName = document.getElementById('speaker-name');
        this.dialogueText = document.getElementById('dialogue-text');
        
        this.combatLog = document.getElementById('combat-log');
        
        this.currentDialogues = [];
        this.currentDialogueIndex = 0;
        this.typewriterInterval = null;
        this.typewriterDone = false;
    }
    
    updateHealth(current, max) {
        const pct = Math.max(0, (current / max) * 100);
        this.healthBar.style.width = `${pct}%`;
        this.healthText.textContent = `${Math.ceil(current)} / ${max}`;
        
        this.healthBar.style.backgroundColor =
            pct < 25 ? '#cc0000' :
            pct < 50 ? '#8a1c1c' : '#6a1010';
    }
    
    logCombat(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        
        this.combatLog.appendChild(entry);
        
        while (this.combatLog.children.length > 6) {
            this.combatLog.removeChild(this.combatLog.firstChild);
        }
        
        setTimeout(() => {
            if (entry.parentNode === this.combatLog) {
                this.combatLog.removeChild(entry);
            }
        }, 5000);
    }
    
    startDialogue(speaker, dialogues) {
        if (engine.state === 'DIALOGUE') return;
        
        this.currentDialogues = dialogues;
        this.currentDialogueIndex = 0;
        this.speakerName.textContent = speaker;
        
        this.dialogueBox.classList.remove('hidden');
        engine.setState('DIALOGUE');
        
        this.showCurrentDialogue();
    }
    
    advanceDialogue() {
        // Se o typewriter ainda está rodando, completar imediatamente
        if (!this.typewriterDone) {
            this.completeTypewriter();
            return;
        }
        
        this.currentDialogueIndex++;
        
        if (this.currentDialogueIndex >= this.currentDialogues.length) {
            this.endDialogue();
        } else {
            this.showCurrentDialogue();
        }
    }
    
    showCurrentDialogue() {
        const text = this.currentDialogues[this.currentDialogueIndex];
        this.dialogueText.textContent = '';
        this.typewriterDone = false;
        
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
        
        let i = 0;
        this.typewriterInterval = setInterval(() => {
            if (i < text.length) {
                this.dialogueText.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(this.typewriterInterval);
                this.typewriterDone = true;
            }
        }, 22);
    }
    
    completeTypewriter() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }
        this.dialogueText.textContent = this.currentDialogues[this.currentDialogueIndex];
        this.typewriterDone = true;
    }
    
    endDialogue() {
        this.dialogueBox.classList.add('hidden');
        engine.setState('PLAYING');
    }
    
    drawMinimap(ctx) {
        if (!engine.map || !engine.player) return;
        
        const mmX = engine.width - 130;
        const mmY = 15;
        const mmW = 115;
        const mmH = 85;
        const scaleX = mmW / engine.map.width;
        const scaleY = mmH / engine.map.height;
        
        // Fundo
        ctx.fillStyle = 'rgba(10, 15, 13, 0.8)';
        ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
        
        ctx.strokeStyle = '#3a4a3a';
        ctx.lineWidth = 1;
        ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
        
        // Tiles
        for (let y = 0; y < engine.map.height; y++) {
            for (let x = 0; x < engine.map.width; x++) {
                const tile = engine.map.grid[y][x];
                let color;
                
                switch (tile) {
                    case 0: color = '#1a241c'; break; // Chão
                    case 1: color = '#0f1410'; break; // Parede
                    case 2: color = '#0a1a24'; break; // Água
                    case 3: color = '#2d4a32'; break; // Arbusto
                    case 4: color = '#5a0808'; break; // Altar
                    case 5: color = '#2a2a28'; break; // Ruínas
                    case 6: color = '#352518'; break; // Caminho
                    default: color = '#1a241c';
                }
                
                ctx.fillStyle = color;
                ctx.fillRect(mmX + x * scaleX, mmY + y * scaleY, scaleX + 0.5, scaleY + 0.5);
            }
        }
        
        // Inimigos no minimapa
        for (const entity of engine.entities) {
            if (entity instanceof Enemy && !entity.isDead) {
                const ex = mmX + (entity.x / engine.map.tileSize) * scaleX;
                const ey = mmY + (entity.y / engine.map.tileSize) * scaleY;
                ctx.fillStyle = entity.type === 'SHAMAN' ? '#ff0000' : '#cc2222';
                ctx.fillRect(ex - 1, ey - 1, 3, 3);
            }
        }
        
        // Jogador no minimapa
        const px = mmX + (engine.player.x / engine.map.tileSize) * scaleX;
        const py = mmY + (engine.player.y / engine.map.tileSize) * scaleY;
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(px - 2, py - 2, 4, 4);
        
        // Label
        ctx.fillStyle = '#888';
        ctx.font = '10px VT323, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MAPA', mmX + mmW / 2, mmY + mmH + 12);
        ctx.textAlign = 'left';
    }
    
    drawQuestTracker(ctx) {
        const x = 20;
        const y = 55;
        
        ctx.fillStyle = 'rgba(10, 15, 13, 0.7)';
        ctx.fillRect(x - 5, y - 5, 220, 70);
        ctx.strokeStyle = '#3a4a3a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 5, y - 5, 220, 70);
        
        ctx.fillStyle = '#2d5a27';
        ctx.font = '16px VT323, monospace';
        ctx.fillText('MISSÃO ATIVA', x, y + 12);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px VT323, monospace';
        
        if (!questState.talkedToPaje) {
            ctx.fillText('› Fale com o Pajé Ancião', x, y + 30);
        } else if (!questState.bossDefeated) {
            const enemies = engine.entities.filter(e => e instanceof Enemy && !e.isDead).length;
            ctx.fillText(`› Inimigos restantes: ${enemies}`, x, y + 30);
            ctx.fillText('› Derrote o Xamã Corrompido', x, y + 46);
        } else if (!questState.completed) {
            ctx.fillText('› Retorne ao Pajé Ancião', x, y + 30);
        } else {
            ctx.fillStyle = '#2d5a27';
            ctx.fillText('✓ Fase 1 Concluída!', x, y + 30);
        }
    }
}

// Instância global
const ui = new UI();

// Injetar o minimapa e quest tracker no loop de desenho
// (chamados após o draw principal, em coordenadas de tela)
const originalDraw = Engine.prototype.draw;
Engine.prototype.draw = function() {
    originalDraw.call(this);
    
    if (this.state !== 'MENU') {
        ui.drawMinimap(this.ctx);
        ui.drawQuestTracker(this.ctx);
    }
};
