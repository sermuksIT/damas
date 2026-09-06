const LINHAS = 8;
const COLUNAS = 8;

const VAZIO = 0;
const PRETA = 1;
const BRANCA = 2;

let tabuleiro = [];

let pecaSelecionada = null; // vai guardar {linha, coluna} da peça clicada

let turnoAtual = BRANCA; // branca começa jogando

const tabuleiroElemento = document.getElementById("tabuleiro");

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
            if (valor === PRETA || valor === BRANCA) {
                const peca = document.createElement("div");
                peca.classList.add("peca");
                peca.classList.add(valor === PRETA ? "peca-preta" : "peca-branca");
                casa.appendChild(peca);
            }
            const estaSelecionada = pecaSelecionada && pecaSelecionada.linha === linha && pecaSelecionada.coluna === coluna;
            if (estaSelecionada) {
                 casa.classList.add("casa-selecionada");
}

            tabuleiroElemento.appendChild(casa);
        }
    }
}

function aoClicarNaCasa(linha, coluna) {
    const valor = tabuleiro[linha][coluna];

    if (valor === turnoAtual) {
        pecaSelecionada = { linha, coluna };
    } else {
        pecaSelecionada = null;
    }

    desenharTabuleiro();
}

tabuleiro = criarEstadoInicial();
desenharTabuleiro();
