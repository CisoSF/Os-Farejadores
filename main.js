/**
 * Os Farejadores: Sombras de Manaus
 * Arquivo Principal — Inicialização, Narrativa e Controle de Missões
 */

const engine = new Engine();

// Estado da Missão
const questState = {
    started: false,
    enemiesDefeated: 0,
    bossDefeated: false,
    talkedToPaje: false,
    completed: false
};

window.onload = () => {
    engine.init();
    
    // Configurar botões
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', restartGame);
    
    // Carregar imagem de fundo do título
    const titleBg = new Image();
    titleBg.onload = () => {
        document.getElementById('main-menu').style.backgroundImage = `url('assets/title_bg.png')`;
        document.getElementById('main-menu').style.backgroundSize = 'cover';
        document.getElementById('main-menu').style.backgroundPosition = 'center';
    };
    titleBg.src = 'assets/title_bg.png';
};

function startGame() {
    document.getElementById('main-menu').classList.add('hidden');
    
    // Fade in
    engine.fadeIn(1.5);
    
    // Criar mapa (Seed fixa para a Fase 1)
    engine.map = new Map(42);
    
    // Criar jogador na área segura
    engine.player = new Player(200, 200);
    ui.updateHealth(engine.player.health, engine.player.maxHealth);
    
    // Criar entidades
    engine.entities = [];
    
    // Adicionar NPC (Pajé)
    const pajeDialogues = [
        "Farejador... As sombras da selva estão inquietas esta noite.",
        "O Culto do Sangue Antigo profanou as ruínas ao leste. Eles buscam despertar o que dorme sob Manaus.",
        "Sinto o cheiro de corrupção. Feras sombrias rondam as clareiras.",
        "Sua lâmina é necessária. Limpe a selva e destrua o Xamã Corrompido no altar."
    ];
    
    const paje = new NPC(280, 180, 'Pajé Ancião', pajeDialogues, 'paje');
    
    // Sobrescrever o método update do Pajé para progredir a missão
    const originalUpdate = paje.update.bind(paje);
    paje.update = function(dt, map, player) {
        originalUpdate(dt, map, player);
        
        if (this.hasInteracted && !questState.talkedToPaje) {
            questState.talkedToPaje = true;
            ui.logCombat('Missão Atualizada: Derrote o Xamã Corrompido no Altar a Leste.', 'info');
        }
        
        // Diálogo pós-missão
        if (questState.bossDefeated && !questState.completed) {
            this.dialogues = [
                "Você silenciou o Xamã... A selva respira aliviada.",
                "Mas as raízes da corrupção são profundas. O Culto ainda espreita nas sombras de Manaus.",
                "Descanse, Farejador. A verdadeira caçada apenas começou."
            ];
            this.hasInteracted = false; // Permitir nova interação
            questState.completed = true;
            
            setTimeout(() => {
                ui.logCombat('Fase 1 Concluída! Obrigado por jogar.', 'heal');
            }, 5000);
        }
    };
    
    engine.entities.push(paje);
    
    // Adicionar Inimigos
    // Patrulhas
    engine.entities.push(new Enemy(500, 300, 'CULTIST'));
    engine.entities.push(new Enemy(600, 600, 'CULTIST'));
    engine.entities.push(new Enemy(800, 200, 'BEAST'));
    engine.entities.push(new Enemy(900, 700, 'BEAST'));
    engine.entities.push(new Enemy(400, 800, 'BEAST'));
    
    // Guardas do Altar
    engine.entities.push(new Enemy(950, 600, 'CULTIST'));
    engine.entities.push(new Enemy(1050, 750, 'CULTIST'));
    
    // Chefe (Xamã Corrompido no Altar)
    const boss = new Enemy(1050, 650, 'SHAMAN');
    
    // Monitorar morte do chefe
    const originalDie = boss.die.bind(boss);
    boss.die = function() {
        originalDie();
        questState.bossDefeated = true;
        engine.shakeScreen(10, 1.0);
        ui.logCombat('O Xamã Corrompido foi derrotado! Retorne ao Pajé.', 'heal');
        
        // Efeito visual de purificação
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                engine.particles.emitSpirit(
                    this.x + (Math.random() - 0.5) * 100,
                    this.y + (Math.random() - 0.5) * 100
                );
            }, i * 100);
        }
    };
    
    engine.entities.push(boss);
    
    // Iniciar loop
    engine.start();
    
    ui.logCombat('A selva sussurra seu nome, Farejador...', 'info');
    ui.logCombat('Fale com o Pajé Ancião.', 'info');
}

function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    
    // Resetar estado da missão
    questState.started = false;
    questState.enemiesDefeated = 0;
    questState.bossDefeated = false;
    questState.talkedToPaje = false;
    questState.completed = false;
    
    startGame();
}
