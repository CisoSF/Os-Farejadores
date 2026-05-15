# Os Farejadores: Sombras de Manaus

## Um RPG 2D de Fantasia Sombria Amazônica

**Os Farejadores: Sombras de Manaus** é um RPG 2D em tempo real construído em HTML5/JavaScript puro, ambientado nas profundezas da Amazônia corrompida. Você é um Farejador — um caçador de mistérios — chamado para investigar as sombras que despertam nas ruínas de Manaus.

### Visão Geral do Jogo

O jogo apresenta uma experiência completa de RPG 2D com:

- **Mapa Procedural**: Geração de mapa com seed determinístico, criando uma floresta amazônica única com árvores, água, ruínas e altares
- **Combate em Tempo Real**: Sistema de combate dinâmico com colisão, knockback e efeitos visuais
- **IA de Inimigos**: Patrulha, perseguição e combate com diferentes tipos de inimigos (Cultistas, Feras, Xamã)
- **Sistema de Missões**: Narrativa progressiva com objetivos claros e recompensas
- **Diálogos Interativos**: NPCs com diálogos em máquina de escrever
- **HUD Completo**: Barra de vida, minimapa, log de combate, rastreador de missões
- **Efeitos Visuais**: Partículas, screen shake, vinheta dinâmica, fade in/out

### Estrutura do Projeto

```
os_farejadores/
├── index.html              # Arquivo HTML principal
├── css/
│   └── style.css          # Estilos e UI
├── js/
│   ├── engine.js          # Motor principal, câmera, input, partículas
│   ├── map.js             # Geração de mapa e colisão
│   ├── entities.js        # Jogador, inimigos, NPCs
│   ├── ui.js              # Interface, diálogos, HUD
│   └── main.js            # Inicialização e controle de missões
└── assets/
    ├── player_sprite.png  # Sprite do jogador (16x16 frames)
    ├── enemy_cultist.png  # Sprite do cultista
    ├── enemy_beast.png    # Sprite da fera
    ├── npc_pajé.png       # Sprite do NPC
    ├── tileset_jungle.png # Tileset da selva
    └── title_bg.png       # Fundo do menu
```

### Controles

| Ação | Tecla |
|------|-------|
| Mover Cima | W / ↑ |
| Mover Baixo | S / ↓ |
| Mover Esquerda | A / ← |
| Mover Direita | D / → |
| Atacar / Interagir | ESPAÇO / ENTER |

### Gameplay

#### Fase 1: A Jornada Começa

1. **Encontro com o Pajé**: Comece falando com o Pajé Ancião para receber sua missão
2. **Exploração**: Navegue pela floresta amazônica, evitando ou enfrentando inimigos
3. **Combate**: Use seu machete para derrotar Cultistas Sombrios e Feras Corrompidas
4. **Chefe Final**: Localize e derrote o Xamã Corrompido no Altar a Leste
5. **Conclusão**: Retorne ao Pajé para completar a Fase 1

#### Tipos de Inimigos

| Inimigo | Vida | Dano | Velocidade | Descrição |
|---------|------|------|-----------|-----------|
| Cultista Sombrio | 60 | 15 | Média | Adorador do Culto do Sangue Antigo |
| Fera Corrompida | 40 | 10 | Rápida | Pantera selvagem corrompida por magia sombria |
| Xamã Corrompido | 80 | 20 | Lenta | Chefe da Fase 1, guardião do Altar |

### Sistemas de Jogo

#### Motor (Engine)

O motor Mournwood implementa:

- **Loop de Jogo**: 60 FPS com deltaTime adaptativo
- **Câmera Suave**: Segue o jogador com interpolação
- **Sistema de Partículas**: Sangue, espíritos, efeitos de corte
- **Efeitos de Tela**: Screen shake, fade in/out, vinheta dinâmica

#### Mapa

- **Geração Procedural**: Algoritmo de ruído com seed para mapas consistentes
- **Colisão Pixel-Perfect**: Verificação de colisão em 4 cantos
- **Tiles Animados**: Água com ondulação, árvores com balanço
- **Decorações**: Ossos, pedras, raízes espalhadas pelo mapa

#### Entidades

- **Jogador**: Movimento 8-direcional, ataque com alcance, animação
- **Inimigos**: IA com patrulha, perseguição e combate
- **NPCs**: Interação com diálogos, indicadores visuais

#### UI

- **HUD**: Barra de vida com cor dinâmica
- **Minimapa**: Visualização em tempo real do mapa e entidades
- **Rastreador de Missões**: Objetivos atualizados dinamicamente
- **Log de Combate**: Mensagens de ação com animação de fade

### Estética

**Os Farejadores** utiliza uma paleta de cores sombria e atmosférica:

- **Tons Primários**: Verde musgo escuro (#1a241c), Preto profundo (#0a0f0d)
- **Acentos**: Verde floresta (#2d5a27), Vermelho sangue (#8a1c1c)
- **Efeitos**: Vinheta radial, brilho pulsante no altar, animações de água

A estética combina pixel art 16-bit com uma atmosfera de fantasia sombria amazônica, criando um mundo imersivo e hostil.

### Tecnologias

- **HTML5 Canvas**: Renderização 2D
- **JavaScript Vanilla**: Sem dependências externas
- **Web Fonts**: Cinzel (títulos), VT323 (UI)
- **Responsive Design**: Adapta-se a diferentes tamanhos de tela

### Como Jogar

1. **Abra o arquivo `index.html`** em um navegador moderno (Chrome, Firefox, Edge)
2. **Clique em "Iniciar Jornada"** para começar o jogo
3. **Use WASD ou Setas** para se mover
4. **Pressione ESPAÇO** para atacar ou interagir
5. **Siga a missão** exibida no canto superior esquerdo

### Planos Futuros

- **Fase 2**: Exploração das ruínas subterrâneas
- **Sistema de Inventário**: Coleta de itens e equipamento
- **Habilidades Especiais**: Faro (detecção de inimigos), Defesa
- **Boss Battles**: Combates épicos contra chefes únicos
- **Áudio**: Música ambiente e efeitos sonoros
- **Salvar/Carregar**: Progresso persistente
- **Dificuldades**: Modo Normal, Hardcore, Lendário

### Créditos

**Desenvolvido por**: Manus AI  
**Framework**: Mournwood Engine (Adaptado)  
**Inspiração**: Os Farejadores (Universo Ficcional)  
**Estética**: Fantasia Sombria Amazônica  
**Data de Lançamento**: Maio 2026

### Licença

Este projeto é fornecido como exemplo de desenvolvimento de RPG 2D em JavaScript puro. Sinta-se livre para modificar, expandir e aprender com o código.

---

**"A selva guarda segredos que os homens esqueceram. Você foi chamado para farejar a verdade nas sombras."**
