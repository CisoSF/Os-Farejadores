# Documentação Técnica — Os Farejadores

## Arquitetura do Motor

### Engine (engine.js)

A classe `Engine` é o coração do jogo, gerenciando o loop principal, sistemas e estado.

#### Principais Componentes

```javascript
class Engine {
    - canvas, ctx: Renderização 2D
    - state: 'MENU' | 'PLAYING' | 'DIALOGUE' | 'GAME_OVER'
    - input: InputHandler
    - camera: Camera
    - particles: ParticleSystem
    - assetLoader: AssetLoader
    - player: Player
    - entities: Entity[]
    - map: Map
}
```

#### Loop de Jogo

```
requestAnimationFrame(loop)
  ├─ update()
  │  ├─ Atualizar jogador
  │  ├─ Atualizar entidades
  │  ├─ Atualizar câmera
  │  └─ Atualizar partículas
  └─ draw()
     ├─ Limpar canvas
     ├─ Aplicar câmera
     ├─ Desenhar mapa base
     ├─ Desenhar entidades (ordenadas por Y)
     ├─ Desenhar partículas
     ├─ Desenhar overlay do mapa
     └─ Desenhar efeitos (vinheta, fade)
```

#### InputHandler

Gerencia entrada de teclado com suporte a múltiplas teclas simultâneas.

```javascript
keyMap: {
    'w', 'W', 'ArrowUp' → 'up'
    's', 'S', 'ArrowDown' → 'down'
    'a', 'A', 'ArrowLeft' → 'left'
    'd', 'D', 'ArrowRight' → 'right'
    ' ', 'Enter' → 'action'
}

isPressed(action): boolean
isJustPressed(action): boolean  // Apenas este frame
```

#### Camera

Câmera suave que segue o jogador com interpolação.

```javascript
follow(target, map) {
    // Interpolação suave: 15% por frame
    this.x += (targetX - this.x) * 0.15
    this.y += (targetY - this.y) * 0.15
    
    // Limitar aos limites do mapa
}
```

#### ParticleSystem

Sistema simples de partículas para efeitos visuais.

```javascript
emit(x, y, options)
  - count: número de partículas
  - speed: velocidade inicial
  - color: cor das partículas
  - life: duração em segundos
  - upward: aplicar gravidade inversa

emitBlood(x, y)  // Sangue ao tomar dano
emitSpirit(x, y) // Espíritos ao morrer
```

#### AssetLoader

Carregamento assíncrono de imagens com callback.

```javascript
load(assets, callback)
  - assets: [{id, src}, ...]
  - Carrega todas as imagens
  - Chama callback quando todas estão prontas
```

### Map (map.js)

Geração procedural de mapa com seed determinístico.

#### Grid de Tiles

```javascript
const TILE = {
    FLOOR: 0,      // Chão
    WALL: 1,       // Árvore/Parede
    WATER: 2,      // Água
    BUSH: 3,       // Arbusto
    ALTAR: 4,      // Altar (chefe)
    RUINS: 5,      // Ruínas
    PATH: 6        // Caminho
}
```

#### Geração

1. **Inicializar**: Preencher com chão
2. **Bordas**: Paredes ao redor
3. **Ruído**: Usar seed para gerar estrutura aleatória
4. **Caminhos**: Criar clareiras conectadas
5. **Decorações**: Adicionar detalhes visuais

#### Colisão

```javascript
isSolid(px, py): boolean
  - Verifica se um pixel é sólido
  - Tipos 1 (parede) e 2 (água) são sólidos

checkCollision(rect): boolean
  - Verifica os 4 cantos do retângulo
  - Retorna true se houver colisão
```

#### Renderização

- **drawBase()**: Tiles base, chão, água, decorações
- **drawOverlay()**: Copa de árvores, arbustos (desenhados por cima das entidades)

### Entities (entities.js)

Hierarquia de classes para entidades do jogo.

#### Entity (Base)

```javascript
class Entity {
    - x, y: posição
    - vx, vy: velocidade
    - width, height: dimensões
    - direction: 'up' | 'down' | 'left' | 'right'
    - health, maxHealth: vida
    - isDead: booleano
    - animFrame, animTimer: animação
    - hitFlash: efeito de dano
}

update(dt, map)
  - Movimento com colisão
  - Atualizar direção
  - Animação

draw(ctx, time)
  - Desenhar sombra
  - Desenhar sprite ou fallback
  - Efeitos visuais
```

#### Player

```javascript
class Player extends Entity {
    - attackCooldown: tempo até próximo ataque
    - attackRate: segundos entre ataques
    - attackRange: alcance do ataque
    - attackDamage: dano por ataque
    - isAttacking: em animação de ataque
    
    attack(entities)
      - Criar hitbox na direção do ataque
      - Verificar colisão com inimigos
      - Aplicar dano e knockback
      - Emitir partículas
}
```

#### Enemy

```javascript
class Enemy extends Entity {
    - type: 'CULTIST' | 'BEAST' | 'SHAMAN'
    - state: 'IDLE' | 'CHASE' | 'ATTACK'
    - detectionRange: distância de detecção
    - patrolDir, patrolTimer: patrulha
    
    update(dt, map, player)
      - Se jogador detectado: CHASE
      - Se próximo demais: ATTACK
      - Senão: IDLE com patrulha aleatória
}
```

#### NPC

```javascript
class NPC extends Entity {
    - name: nome do NPC
    - dialogues: array de diálogos
    - interactionRange: distância de interação
    - hasInteracted: booleano
    
    update(dt, map, player)
      - Verificar proximidade do jogador
      - Iniciar diálogo se ESPAÇO pressionado
}
```

### UI (ui.js)

Sistema de interface do usuário.

#### Elementos

- **Health Bar**: Barra de vida com cor dinâmica
- **Dialogue Box**: Caixa de diálogo com typewriter
- **Combat Log**: Log de ações com fade
- **Minimap**: Mapa em tempo real
- **Quest Tracker**: Rastreador de missões

#### Typewriter

```javascript
showCurrentDialogue()
  - Limpar texto
  - Adicionar caracteres um por um (22ms cada)
  - Permitir skip com ESPAÇO
```

#### Minimap

```javascript
drawMinimap(ctx)
  - Escala: 1 tile = ~3-4 pixels no mapa
  - Cores: Diferentes para cada tipo de tile
  - Entidades: Pontos vermelhos para inimigos, verde para jogador
```

### Main (main.js)

Inicialização do jogo e controle de missões.

#### Quest State

```javascript
questState = {
    started: boolean,
    enemiesDefeated: number,
    bossDefeated: boolean,
    talkedToPaje: boolean,
    completed: boolean
}
```

#### Fluxo

1. **Inicializar**: Criar mapa, jogador, inimigos, NPCs
2. **Missão**: Falar com Pajé
3. **Exploração**: Derrotar inimigos
4. **Chefe**: Derrotar Xamã
5. **Conclusão**: Retornar ao Pajé

## Performance

### Otimizações

- **Culling de Câmera**: Apenas renderizar tiles visíveis
- **Ordenação por Y**: Apenas uma vez por frame
- **Pooling de Partículas**: Reutilizar objetos
- **DeltaTime Limitado**: Máximo 0.1s para evitar saltos

### Benchmark

- **Mapa**: 30x24 tiles = 720 tiles
- **Entidades**: ~10-15 (jogador + inimigos + NPCs)
- **Partículas**: Até 100 simultâneas
- **FPS**: 60 (em navegadores modernos)

## Extensibilidade

### Adicionar Novo Tipo de Inimigo

```javascript
// Em entities.js
case 'NOVO_TIPO':
    this.name = 'Nome do Inimigo';
    this.color = '#rrggbb';
    this.speed = 100;
    this.maxHealth = 50;
    this.health = 50;
    this.attackDamage = 15;
    break;

// Em main.js
engine.entities.push(new Enemy(x, y, 'NOVO_TIPO'));
```

### Adicionar Nova Habilidade

```javascript
// Em entities.js (classe Player)
specialAbility() {
    // Lógica da habilidade
    engine.particles.emit(...);
    engine.shakeScreen(...);
}

// Chamar em update() quando condição atendida
```

### Adicionar Novo Tile

```javascript
// Em map.js
const TILE = {
    // ... existentes
    NOVO_TILE: 7
}

// Em drawTile()
case TILE.NOVO_TILE:
    // Renderização
    break;
```

## Debugging

### Console

```javascript
// Ver estado do jogo
console.log(engine.state);
console.log(engine.player);
console.log(engine.entities);

// Ver mapa
console.log(engine.map.grid);

// Ver input
console.log(engine.input.keys);
```

### Visualização

- **Minimapa**: Mostra posição de todas as entidades
- **Log de Combate**: Mostra todas as ações
- **Barra de Vida**: Indica saúde do jogador e inimigos

## Limitações Conhecidas

1. **Sprites Estáticos**: Atualmente usando fallback de desenho (sem sprites animados)
2. **Sem Áudio**: Sistema de áudio não implementado
3. **Sem Salvar**: Sem persistência de progresso
4. **Sem Pausa**: Sem menu de pausa durante o jogo
5. **IA Simples**: Inimigos não usam estratégias complexas

## Futuras Melhorias

- Implementar sprite animation completo
- Adicionar sistema de som
- Criar sistema de inventário
- Implementar mais tipos de inimigos
- Adicionar chefes únicos com padrões de ataque
- Criar mais fases/áreas
- Adicionar efeitos de magia/habilidades especiais
