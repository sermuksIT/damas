const LINHAS = 8;
const COLUNAS = 8;

const VAZIO = 0;
const PRETA = 1;
const BRANCA = 2;
const PRETA_DAMA = 3;
const BRANCA_DAMA = 4;

let tabuleiro = [];

let pecaSelecionada = null; // vai guardar {linha, coluna} da peça clicada

let movimentosPossiveis = [];

let turnoAtual = BRANCA; // branca começa jogando

const tabuleiroElemento = document.getElementById("tabuleiro");

function ehPreta(valor) {
    return valor === PRETA || valor === PRETA_DAMA;
}

function ehBranca(valor) {
    return valor === BRANCA || valor === BRANCA_DAMA;
}

function ehDama(valor) {
    return valor === PRETA_DAMA || valor === BRANCA_DAMA;
}

function criarEstadoInicial() {
    const novoTabuleiro = [];
    for (let linha = 0; linha < LINHAS; linha++) {
        const novaLinha = [];
        for (let coluna = 0; coluna < COLUNAS; coluna++) {
            const casaEscura = (linha + coluna) % 2 === 1;
            if (casaEscura && linha < 3) {
                novaLinha.push(PRETA);
            } else if (casaEscura && linha > 4) {
                novaLinha.push(BRANCA);
            } else {
                novaLinha.push(VAZIO);
            }
        }
        novoTabuleiro.push(novaLinha);
    }
    return novoTabuleiro;
}

function calcularMovimentosSimples(linha, coluna) {
    const valor = tabuleiro[linha][coluna];
    const movimentos = [];

    // Peças normais só andam numa direção; damas andam nas duas
    const direcoes = ehDama(valor) ? [1, -1] : [valor === PRETA ? 1 : -1];

    for (const direcao of direcoes) {
        const novasColunas = [coluna - 1, coluna + 1];

        for (const novaColuna of novasColunas) {
            const novaLinha = linha + direcao;

            const dentroDoTabuleiro =
                novaLinha >= 0 && novaLinha < LINHAS && novaColuna >= 0 && novaColuna < COLUNAS;

            if (dentroDoTabuleiro && tabuleiro[novaLinha][novaColuna] === VAZIO) {
                movimentos.push({ linha: novaLinha, coluna: novaColuna });
            }
        }
    }

    return movimentos;
}

function calcularMovimentosCaptura(linha, coluna) {
    const valor = tabuleiro[linha][coluna];
    const capturas = [];

    const direcoes = ehDama(valor) ? [1, -1] : [valor === PRETA ? 1 : -1];
    const corAdversariaEhPreta = ehBranca(valor);

    for (const direcao of direcoes) {
        const novasColunas = [coluna - 1, coluna + 1];

        for (const colunaAdjacente of novasColunas) {
            const linhaAdjacente = linha + direcao;

            const linhaSalto = linha + direcao * 2;
            const colunaSalto = colunaAdjacente + (colunaAdjacente - coluna);

            const adjacenteDentroDoTabuleiro =
                linhaAdjacente >= 0 && linhaAdjacente < LINHAS &&
                colunaAdjacente >= 0 && colunaAdjacente < COLUNAS;

            const saltoDentroDoTabuleiro =
                linhaSalto >= 0 && linhaSalto < LINHAS &&
                colunaSalto >= 0 && colunaSalto < COLUNAS;

            if (!adjacenteDentroDoTabuleiro || !saltoDentroDoTabuleiro) {
                continue;
            }

            const valorAdjacente = tabuleiro[linhaAdjacente][colunaAdjacente];
            const temAdversariaNoMeio = corAdversariaEhPreta
                ? ehPreta(valorAdjacente)
                : ehBranca(valorAdjacente);

            const destinoVazio = tabuleiro[linhaSalto][colunaSalto] === VAZIO;

            if (temAdversariaNoMeio && destinoVazio) {
                capturas.push({
                    linha: linhaSalto,
                    coluna: colunaSalto,
                    capturada: { linha: linhaAdjacente, coluna: colunaAdjacente },
                });
            }
        }
    }

    return capturas;
}




function desenharTabuleiro() {
    tabuleiroElemento.innerHTML = "";

    for (let linha = 0; linha < LINHAS; linha++) {
        for (let coluna = 0; coluna < COLUNAS; coluna++) {
            const casa = document.createElement("div");
            casa.classList.add("casa");

            const corEscura = (linha + coluna) % 2 === 1;
            casa.classList.add(corEscura ? "casa-escura" : "casa-clara");

            casa.dataset.linha = linha;
            casa.dataset.coluna = coluna;

            casa.addEventListener("click", () => aoClicarNaCasa(linha, coluna));

            const valor = tabuleiro[linha][coluna];
            if (valor !== VAZIO) {
                const peca = document.createElement("div");
                peca.classList.add("peca");
                peca.classList.add(ehPreta(valor) ? "peca-preta" : "peca-branca");
                if (ehDama(valor)) {
                    peca.classList.add("peca-dama");
                }
                casa.appendChild(peca);
            }

            const estaSelecionada = pecaSelecionada && pecaSelecionada.linha === linha && pecaSelecionada.coluna === coluna;
            if (estaSelecionada) {
                casa.classList.add("casa-selecionada");
            }

            const ehMovimentoPossivel = movimentosPossiveis.some(
                (m) => m.linha === linha && m.coluna === coluna
            );
            if (ehMovimentoPossivel) {
                const marcador = document.createElement("div");
                marcador.classList.add("marcador-movimento");
                casa.appendChild(marcador);
            }

            tabuleiroElemento.appendChild(casa);
        }
    }
}

function aoClicarNaCasa(linha, coluna) {
    const valor = tabuleiro[linha][coluna];

    // Caso 1: clicou numa peça do jogador da vez -> seleciona ela
    if (valor === turnoAtual) {
        pecaSelecionada = { linha, coluna };
        const capturas = calcularMovimentosCaptura(linha, coluna);
movimentosPossiveis = capturas.length > 0 ? capturas : calcularMovimentosSimples(linha, coluna);
        desenharTabuleiro();
        return;
    }

    // Caso 2: já tem uma peça selecionada e clicou num destino válido -> move
    const destinoValido = movimentosPossiveis.some(
        (m) => m.linha === linha && m.coluna === coluna
    );

    if (pecaSelecionada && destinoValido) {
        moverPeca(pecaSelecionada, { linha, coluna });
    }

    // Caso 3: clicou em qualquer outro lugar -> limpa seleção
    pecaSelecionada = null;
    movimentosPossiveis = [];
    desenharTabuleiro();
}


function moverPeca(origem, destino) {
    const valor = tabuleiro[origem.linha][origem.coluna];

    tabuleiro[origem.linha][origem.coluna] = VAZIO;
    tabuleiro[destino.linha][destino.coluna] = valor;

    const movimentoEscolhido = movimentosPossiveis.find(
        (m) => m.linha === destino.linha && m.coluna === destino.coluna
    );

    if (movimentoEscolhido && movimentoEscolhido.capturada) {
        const { linha, coluna } = movimentoEscolhido.capturada;
        tabuleiro[linha][coluna] = VAZIO;
    }

    // Promoção: peça preta chegando na última linha (7), branca chegando na primeira (0)
    if (valor === PRETA && destino.linha === LINHAS - 1) {
        tabuleiro[destino.linha][destino.coluna] = PRETA_DAMA;
    } else if (valor === BRANCA && destino.linha === 0) {
        tabuleiro[destino.linha][destino.coluna] = BRANCA_DAMA;
    }

    turnoAtual = turnoAtual === BRANCA ? PRETA : BRANCA;

    pecaSelecionada = null;
    movimentosPossiveis = [];

    desenharTabuleiro();
}

tabuleiro = criarEstadoInicial();
desenharTabuleiro();
