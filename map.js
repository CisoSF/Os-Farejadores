/**
 * Sistema de Mapa — Os Farejadores
 * Geração procedural com biomas da selva amazônica sombria
 */

// Constantes de tiles
const TILE = {
    FLOOR: 0,
    WALL: 1,
    WATER: 2,
    BUSH: 3,
    ALTAR: 4,
    RUINS: 5,
    PATH: 6
};

class Map {
    constructor(seed) {
        this.tileSize = 40;
        this.width = 32;
        this.height = 24;
        this.seed = seed || Math.random();
        
        this.grid = [];
        this.decorations = []; // Detalhes visuais extras
        
        this.generateMap();
        this.placeDecorations();
    }
    
    // Gerador de números pseudo-aleatórios com seed
    seededRandom(s) {
        const x = Math.sin(s + this.seed * 9301) * 43758.5453;
        return x - Math.floor(x);
    }
    
    generateMap() {
        // Inicializar com chão
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = TILE.FLOOR;
            }
        }
        
        // Bordas são paredes
        for (let x = 0; x < this.width; x++) {
            this.grid[0][x] = TILE.WALL;
            this.grid[this.height - 1][x] = TILE.WALL;
        }
        for (let y = 0; y < this.height; y++) {
            this.grid[y][0] = TILE.WALL;
            this.grid[y][this.width - 1] = TILE.WALL;
        }
        
        // Gerar estrutura com ruído
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const r = this.seededRandom(x * 100 + y * 1000);
                
                if (r < 0.08) this.grid[y][x] = TILE.WALL;
                else if (r < 0.12) this.grid[y][x] = TILE.WATER;
                else if (r < 0.16) this.grid[y][x] = TILE.BUSH;
                else if (r < 0.17) this.grid[y][x] = TILE.RUINS;
                else this.grid[y][x] = TILE.FLOOR;
            }
        }
        
        // Criar caminhos (clareiras)
        this.createPath(5, 5, 20, 5);   // Caminho horizontal superior
        this.createPath(5, 5, 5, 18);   // Caminho vertical esquerdo
        this.createPath(5, 18, 20, 18); // Caminho horizontal inferior
        this.createPath(20, 5, 20, 18); // Caminho vertical direito
        
        // Área inicial do jogador (sempre limpa)
        this.clearArea(4, 4, 7, 7);
        
        // Altar do chefe no canto oposto
        this.grid[16][26] = TILE.ALTAR;
        this.clearArea(24, 14, 29, 20);
    }
    
    createPath(x1, y1, x2, y2) {
        let x = x1, y = y1;
        
        while (x !== x2 || y !== y2) {
            this.grid[y][x] = TILE.PATH;
            
            if (x < x2) x++;
            else if (x > x2) x--;
            else if (y < y2) y++;
            else if (y > y2) y--;
        }
        this.grid[y][x] = TILE.PATH;
    }
    
    clearArea(x1, y1, x2, y2) {
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    this.grid[y][x] = TILE.FLOOR;
                }
            }
        }
    }
    
    placeDecorations() {
        // Pedras, raízes, ossos — detalhes visuais que não bloqueiam
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const r = this.seededRandom(x * 7 + y * 13 + 500);
                if (this.grid[y][x] === TILE.FLOOR && r < 0.12) {
                    this.decorations.push({
                        x: x * this.tileSize + this.seededRandom(x * y) * 20,
                        y: y * this.tileSize + this.seededRandom(x + y * 3) * 20,
                        type: r < 0.04 ? 'bone' : r < 0.08 ? 'stone' : 'root'
                    });
                }
            }
        }
    }
    
    isSolid(px, py) {
        const gx = Math.floor(px / this.tileSize);
        const gy = Math.floor(py / this.tileSize);
        
        if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return true;
        
        const t = this.grid[gy][gx];
        return t === TILE.WALL || t === TILE.WATER;
    }
    
    checkCollision(rect) {
        const margin = 2;
        return this.isSolid(rect.x + margin, rect.y + margin) ||
               this.isSolid(rect.x + rect.width - margin, rect.y + margin) ||
               this.isSolid(rect.x + margin, rect.y + rect.height - margin) ||
               this.isSolid(rect.x + rect.width - margin, rect.y + rect.height - margin);
    }
    
    getTileAt(px, py) {
        const gx = Math.floor(px / this.tileSize);
        const gy = Math.floor(py / this.tileSize);
        if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return -1;
        return this.grid[gy][gx];
    }
    
    drawBase(ctx, camera, time) {
        const startCol = Math.max(0, Math.floor(camera.x / this.tileSize) - 1);
        const endCol = Math.min(this.width - 1, startCol + Math.ceil(camera.width / this.tileSize) + 2);
        const startRow = Math.max(0, Math.floor(camera.y / this.tileSize) - 1);
        const endRow = Math.min(this.height - 1, startRow + Math.ceil(camera.height / this.tileSize) + 2);
        
        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                const tile = this.grid[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                const ts = this.tileSize;
                
                this.drawTile(ctx, tile, px, py, ts, x, y, time);
            }
        }
        
        // Decorações
        for (const dec of this.decorations) {
            if (dec.x >= camera.x - 40 && dec.x <= camera.x + camera.width + 40 &&
                dec.y >= camera.y - 40 && dec.y <= camera.y + camera.height + 40) {
                this.drawDecoration(ctx, dec);
            }
        }
    }
    
    drawTile(ctx, tile, px, py, ts, gx, gy, time) {
        const checker = (gx + gy) % 2 === 0;
        
        switch (tile) {
            case TILE.FLOOR:
                ctx.fillStyle = checker ? '#1a241c' : '#1c271e';
                ctx.fillRect(px, py, ts, ts);
                // Musgo/grama
                if ((gx * 3 + gy * 7) % 11 === 0) {
                    ctx.fillStyle = '#223025';
                    ctx.fillRect(px + 8, py + 6, 4, 4);
                    ctx.fillRect(px + 20, py + 22, 3, 3);
                }
                break;
                
            case TILE.PATH:
                ctx.fillStyle = '#2a1e12';
                ctx.fillRect(px, py, ts, ts);
                // Pedras do caminho
                ctx.fillStyle = '#352518';
                ctx.fillRect(px + 5, py + 5, 12, 8);
                ctx.fillRect(px + 22, py + 18, 10, 7);
                break;
                
            case TILE.WALL:
                // Árvore escura
                ctx.fillStyle = '#0f1410';
                ctx.fillRect(px, py, ts, ts);
                // Raízes
                ctx.fillStyle = '#1a1208';
                ctx.fillRect(px + 12, py + 20, 16, ts - 20);
                ctx.fillRect(px + 5, py + 28, 8, 8);
                ctx.fillRect(px + 27, py + 28, 8, 8);
                break;
                
            case TILE.WATER:
                // Água escura com animação
                const wave = Math.sin(time * 2 + gx * 0.5 + gy * 0.3) * 0.1;
                ctx.fillStyle = `rgba(10, 26, 36, ${0.9 + wave})`;
                ctx.fillRect(px, py, ts, ts);
                // Reflexo
                ctx.fillStyle = 'rgba(20, 50, 70, 0.4)';
                ctx.fillRect(px + 5, py + 10 + Math.sin(time + gx) * 3, ts - 10, 4);
                ctx.fillRect(px + 15, py + 25 + Math.sin(time * 1.5 + gy) * 2, ts - 25, 3);
                break;
                
            case TILE.BUSH:
                ctx.fillStyle = '#1a241c';
                ctx.fillRect(px, py, ts, ts);
                break;
                
            case TILE.RUINS:
                ctx.fillStyle = '#1a1a18';
                ctx.fillRect(px, py, ts, ts);
                // Pedras
                ctx.fillStyle = '#2a2a28';
                ctx.fillRect(px + 3, py + 3, 15, 12);
                ctx.fillRect(px + 22, py + 20, 12, 14);
                // Marcas tribais
                ctx.fillStyle = '#4a1a1a';
                ctx.fillRect(px + 6, py + 6, 2, 6);
                ctx.fillRect(px + 4, py + 9, 6, 2);
                break;
                
            case TILE.ALTAR:
                ctx.fillStyle = '#120808';
                ctx.fillRect(px, py, ts, ts);
                // Altar com brilho pulsante
                const pulse = 0.5 + Math.sin(time * 3) * 0.3;
                ctx.fillStyle = `rgba(138, 28, 28, ${pulse})`;
                ctx.fillRect(px + 8, py + 8, ts - 16, ts - 16);
                ctx.fillStyle = '#5a0808';
                ctx.fillRect(px + 12, py + 12, ts - 24, ts - 24);
                break;
        }
    }
    
    drawDecoration(ctx, dec) {
        switch (dec.type) {
            case 'bone':
                ctx.fillStyle = '#8a8070';
                ctx.fillRect(dec.x, dec.y, 8, 2);
                ctx.fillRect(dec.x + 3, dec.y - 2, 2, 6);
                break;
            case 'stone':
                ctx.fillStyle = '#2a2a28';
                ctx.fillRect(dec.x, dec.y, 10, 6);
                break;
            case 'root':
                ctx.strokeStyle = '#2a1e12';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dec.x, dec.y);
                ctx.quadraticCurveTo(dec.x + 8, dec.y - 5, dec.x + 15, dec.y + 3);
                ctx.stroke();
                break;
        }
    }
    
    drawOverlay(ctx, camera, time) {
        const startCol = Math.max(0, Math.floor(camera.x / this.tileSize) - 1);
        const endCol = Math.min(this.width - 1, startCol + Math.ceil(camera.width / this.tileSize) + 2);
        const startRow = Math.max(0, Math.floor(camera.y / this.tileSize) - 1);
        const endRow = Math.min(this.height - 1, startRow + Math.ceil(camera.height / this.tileSize) + 2);
        
        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                const tile = this.grid[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                
                if (tile === TILE.WALL) {
                    // Copa da árvore (desenhada por cima das entidades)
                    const sway = Math.sin(time * 0.8 + x * 0.5) * 2;
                    ctx.fillStyle = '#1e3322';
                    ctx.beginPath();
                    ctx.ellipse(px + 20 + sway, py + 12, 22, 18, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#162a1a';
                    ctx.beginPath();
                    ctx.ellipse(px + 14 + sway * 0.7, py + 8, 14, 12, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#243d2a';
                    ctx.beginPath();
                    ctx.ellipse(px + 26 + sway * 1.2, py + 6, 12, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === TILE.BUSH) {
                    const sway = Math.sin(time * 1.2 + x * 0.7) * 1.5;
                    ctx.fillStyle = '#2d4a32';
                    ctx.beginPath();
                    ctx.ellipse(px + 20 + sway, py + 22, 16, 12, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#3a5c3f';
                    ctx.beginPath();
                    ctx.ellipse(px + 12 + sway * 0.5, py + 26, 10, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}
