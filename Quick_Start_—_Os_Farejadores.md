# Quick Start — Os Farejadores

## Instalação Rápida

### Opção 1: Abrir Localmente

1. **Baixe o arquivo `index.html`** (ou toda a pasta)
2. **Abra em um navegador**: Clique duas vezes em `index.html`
3. **Pronto!** O jogo carregará automaticamente

### Opção 2: Servidor Local (Recomendado)

Se as imagens não carregarem, use um servidor local:

**Python 3:**
```bash
cd os_farejadores
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8080
```

**Node.js:**
```bash
npx http-server
```

**Live Server (VS Code):**
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html`
- Selecione "Open with Live Server"

## Primeiros Passos

### 1. Comece o Jogo
- Clique em **"⚔ Iniciar Jornada"**
- Você aparecerá na floresta amazônica

### 2. Encontre o Pajé
- Use **WASD** ou **Setas** para se mover
- Procure pelo **Pajé Ancião** (figura com cocar de penas)
- Pressione **ESPAÇO** para falar com ele

### 3. Receba a Missão
- O Pajé dirá para derrotar o **Xamã Corrompido**
- Ele está no **Altar a Leste** (veja o minimapa no canto superior direito)

### 4. Explore e Combata
- Procure por **Cultistas Sombrios** (roupa vermelha) e **Feras Corrompidas** (criaturas pretas)
- Pressione **ESPAÇO** para atacar quando próximo
- Evite ser cercado!

### 5. Encontre o Chefe
- Siga para o **Altar** (ponto vermelho no minimapa)
- O **Xamã Corrompido** estará lá, rodeado de guardas
- Derrote-o!

### 6. Retorne ao Pajé
- Volte ao Pajé para completar a missão
- Parabéns! Você completou a Fase 1!

## Dicas de Gameplay

### Combate
- **Ataque Rápido**: Pressione ESPAÇO repetidamente para atacar múltiplas vezes
- **Movimento**: Não fique parado! Mova-se enquanto ataca
- **Knockback**: Seus ataques afastam inimigos — use isso a seu favor
- **Foco**: Derrote um inimigo de cada vez, não tente enfrentar todos

### Exploração
- **Minimapa**: Verifique frequentemente o minimapa para localizar inimigos
- **Evitar**: Você pode evitar combates se preferir
- **Recursos**: Não há itens para coletar nesta fase
- **Morte**: Se morrer, clique em "Tentar Novamente"

### Dicas Avançadas
- **Patrulha**: Inimigos patrulham quando não o veem — use isso para passar
- **Alcance**: Seu ataque tem alcance limitado — fique perto dos inimigos
- **Direção**: Você ataca na direção que está olhando
- **Stamina**: Não há limite de stamina — você pode correr indefinidamente

## Problemas Comuns

### "As imagens não estão carregando"
**Solução**: Use um servidor local (veja Opção 2 acima)

### "O jogo está muito lento"
**Solução**: 
- Feche outras abas do navegador
- Atualize seu navegador
- Tente em outro navegador (Chrome é mais rápido)

### "Não consigo atacar"
**Solução**:
- Verifique se está perto do inimigo (alcance ~40 pixels)
- Pressione ESPAÇO, não clique com o mouse
- Aguarde o cooldown de ataque (0.45 segundos)

### "O NPC não responde"
**Solução**:
- Fique mais perto (alcance ~55 pixels)
- Pressione ESPAÇO para interagir
- Leia o diálogo inteiro antes de avançar

### "Estou preso em uma árvore"
**Solução**:
- Tente se mover em outra direção
- As árvores têm colisão — você não pode passar por elas
- Procure um caminho alternativo

## Controles Completos

| Ação | Tecla | Alternativa |
|------|-------|------------|
| Mover Cima | W | Seta Cima ↑ |
| Mover Baixo | S | Seta Baixo ↓ |
| Mover Esquerda | A | Seta Esquerda ← |
| Mover Direita | D | Seta Direita → |
| Atacar | ESPAÇO | ENTER |
| Interagir | ESPAÇO | ENTER |
| Avançar Diálogo | ESPAÇO | ENTER |

## Interface

### HUD (Cabeça Acima)

| Elemento | Localização | Função |
|----------|------------|--------|
| Barra de Vida | Canto Superior Esquerdo | Mostra sua vida atual |
| Minimapa | Canto Superior Direito | Mostra o mapa em tempo real |
| Log de Combate | Canto Inferior Esquerdo | Mostra ações e danos |
| Rastreador de Missão | Canto Superior Esquerdo | Mostra objetivos |
| Controles | Canto Inferior Direito | Lembrete de controles |

### Cores do Minimapa

- **Verde Musgo**: Chão
- **Preto**: Árvores/Paredes
- **Azul Escuro**: Água
- **Verde Claro**: Arbustos
- **Vermelho Escuro**: Altar
- **Cinza**: Ruínas
- **Marrom**: Caminhos
- **Ponto Verde**: Você
- **Ponto Vermelho**: Inimigos

## Próximas Fases

Após completar a Fase 1, fique atento para:

- **Fase 2**: Exploração das ruínas subterrâneas
- **Novos Inimigos**: Tipos mais desafiadores
- **Sistema de Inventário**: Coletar e equipar itens
- **Habilidades Especiais**: Faro, Defesa, Magia
- **Chefes Únicos**: Combates épicos com padrões especiais

## Feedback e Sugestões

Se encontrar bugs ou tiver sugestões, considere:

- Documentar o que aconteceu
- Anotar os passos para reproduzir
- Mencionar seu navegador e sistema operacional
- Descrever o comportamento esperado vs. real

## Aproveite!

**"A selva guarda segredos que os homens esqueceram. Você foi chamado para farejar a verdade nas sombras."**

Boa sorte, Farejador!
