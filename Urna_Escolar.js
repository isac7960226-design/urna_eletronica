const CHAVE_DADOS_URNA = "urnaEscolar.dados.v1";
const formIdentificacao = document.getElementById("form-identificacao");
const campoNome = document.getElementById("nome");
const campoCodigo = document.getElementById("codigoAluno");
const mensagemIdentificacao = document.getElementById("mensagem-identificacao");
const erroNome = document.getElementById("erro-nome");
const erroCodigo = document.getElementById("erro-codigo");
const mensagemPersistencia = document.getElementById("mensagem-persistencia");
const etapaIdentificacao = document.getElementById("etapa-identificacao");
const etapaVotacao = document.getElementById("etapa-votacao");
const etapaRevisao = document.getElementById("etapa-revisao");
const etapaConcluida = document.getElementById("etapa-concluida");
const formVotacao = document.getElementById("form-votacao");
const campoChapa = document.getElementById("chapa");
const mensagemVoto = document.getElementById("mensagem-voto");
const erroChapa = document.getElementById("erro-chapa");
const resumoVoto = document.getElementById("resumo-voto");
const mensagemConclusao = document.getElementById("mensagem-conclusao");
const botaoConfirmarVoto = document.getElementById("confirmar-voto");

let chapaSelecionada = null;
let votoConfirmado = false;
let dadosUrna = carregarDadosUrna();

function criarDadosVazios() {
    const votosPorChapa = {};
    for (let numero = 1; numero <= 8; numero += 1) {
        votosPorChapa[numero] = 0;
    }

    return { participantes: [], votosPorChapa };
}

function carregarDadosUrna() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_DADOS_URNA);
        if (dadosSalvos === null) return criarDadosVazios();

        const dados = JSON.parse(dadosSalvos);
        const estruturaValida = dados
            && Array.isArray(dados.participantes)
            && dados.participantes.every((participante) =>
                participante
                && typeof participante.nome === "string"
                && typeof participante.codigo === "string"
            )
            && dados.votosPorChapa
            && Array.from({ length: 8 }, (_, index) => String(index + 1)).every((numero) =>
                Number.isInteger(dados.votosPorChapa[numero])
                && dados.votosPorChapa[numero] >= 0
            );

        if (!estruturaValida) {
            mensagemPersistencia.textContent = "Os dados salvos da urna estão inválidos. Não será possível registrar votos neste navegador.";
            return null;
        }

        return dados;
    } catch (erro) {
        console.error("Não foi possível carregar os dados locais da urna.", erro);
        mensagemPersistencia.textContent = "Não foi possível acessar os dados salvos da urna. Verifique as configurações de armazenamento do navegador.";
        return null;
    }
}

function mostrarEtapa(etapaAtual) {
    [etapaIdentificacao, etapaVotacao, etapaRevisao, etapaConcluida].forEach((etapa) => {
        etapa.hidden = etapa !== etapaAtual;
    });
}

function limparErro(campo, mensagemErro) {
    campo.removeAttribute("aria-invalid");
    mensagemErro.textContent = "";
}

function mostrarErro(campo, mensagemErro, texto) {
    campo.setAttribute("aria-invalid", "true");
    mensagemErro.textContent = texto;
}

campoNome.addEventListener("input", () => limparErro(campoNome, erroNome));
campoCodigo.addEventListener("input", () => limparErro(campoCodigo, erroCodigo));
campoChapa.addEventListener("change", () => {
    limparErro(campoChapa, erroChapa);
    mensagemVoto.textContent = "";
});

formIdentificacao.addEventListener("submit", (event) => {
    event.preventDefault();

    if (dadosUrna === null) return;

    const nome = campoNome.value.trim();
    const codigo = campoCodigo.value.trim();
    const nomeValido = Boolean(nome);
    const codigoValido = Boolean(codigo);

    if (!nomeValido || !codigoValido) {
        if (!nomeValido) {
            mostrarErro(campoNome, erroNome, "Informe seu nome. Esse campo não pode ficar vazio.");
        } else {
            limparErro(campoNome, erroNome);
        }

        if (!codigoValido) {
            mostrarErro(campoCodigo, erroCodigo, "Informe seu código de aluno. Esse campo não pode ficar vazio.");
        } else {
            limparErro(campoCodigo, erroCodigo);
        }

        mensagemIdentificacao.textContent = "Revise os campos indicados para continuar.";
        (!nomeValido ? campoNome : campoCodigo).focus();
        return;
    }

    const codigoJaVotou = dadosUrna.participantes.some((participante) =>
        participante.codigo === codigo
    );
    if (codigoJaVotou) {
        mensagemIdentificacao.textContent = "Este código já foi registrado como participante nesta urna.";
        campoCodigo.focus();
        return;
    }

    limparErro(campoNome, erroNome);
    limparErro(campoCodigo, erroCodigo);
    mensagemIdentificacao.textContent = "";
    mostrarEtapa(etapaVotacao);
    campoChapa.focus();
});

formVotacao.addEventListener("submit", (event) => {
    event.preventDefault();

    const numeroChapa = Number(campoChapa.value);
    if (!Number.isInteger(numeroChapa) || numeroChapa < 1 || numeroChapa > 8) {
        mostrarErro(campoChapa, erroChapa, "Selecione uma chapa da lista antes de continuar.");
        campoChapa.focus();
        return;
    }

    limparErro(campoChapa, erroChapa);
    chapaSelecionada = numeroChapa;
    resumoVoto.textContent = `Você escolheu a Chapa ${chapaSelecionada}. Confira sua escolha antes de confirmar.`;
    mensagemVoto.textContent = "";
    mostrarEtapa(etapaRevisao);
});

document.getElementById("voltar-identificacao").addEventListener("click", () => {
    mensagemIdentificacao.textContent = "Você pode revisar ou alterar seus dados antes de votar.";
    mostrarEtapa(etapaIdentificacao);
    campoNome.focus();
});

document.getElementById("corrigir-voto").addEventListener("click", () => {
    mostrarEtapa(etapaVotacao);
    campoChapa.focus();
});

document.getElementById("cancelar-votacao").addEventListener("click", () => {
    chapaSelecionada = null;
    campoChapa.value = "";
    mensagemVoto.textContent = "";
    mensagemIdentificacao.textContent = "Votação cancelada. Seus dados de identificação foram preservados.";
    mostrarEtapa(etapaIdentificacao);
    campoNome.focus();
});

botaoConfirmarVoto.addEventListener("click", () => {
    if (votoConfirmado || dadosUrna === null) return;

    if (chapaSelecionada === null) {
        mostrarEtapa(etapaVotacao);
        mostrarErro(campoChapa, erroChapa, "Não foi possível identificar a chapa. Selecione uma opção para continuar.");
        campoChapa.focus();
        return;
    }

    const nome = campoNome.value.trim();
    const codigo = campoCodigo.value.trim();
    const codigoJaVotou = dadosUrna.participantes.some((participante) =>
        participante.codigo === codigo
    );
    if (!nome || !codigo || codigoJaVotou) {
        mensagemIdentificacao.textContent = codigoJaVotou
            ? "Este código já foi registrado como participante nesta urna."
            : "Não foi possível validar a identificação. Informe novamente seu nome e código.";
        mostrarEtapa(etapaIdentificacao);
        campoCodigo.focus();
        return;
    }

    const novosDados = {
        participantes: [...dadosUrna.participantes, { nome, codigo }],
        votosPorChapa: {
            ...dadosUrna.votosPorChapa,
            [chapaSelecionada]: dadosUrna.votosPorChapa[chapaSelecionada] + 1
        }
    };

    try {
        localStorage.setItem(CHAVE_DADOS_URNA, JSON.stringify(novosDados));
    } catch (erro) {
        console.error("Não foi possível salvar o voto e a participação.", erro);
        mensagemPersistencia.textContent = "Não foi possível salvar os dados. Seu voto não foi confirmado; tente novamente ou avise o responsável.";
        return;
    }

    dadosUrna = novosDados;
    votoConfirmado = true;
    botaoConfirmarVoto.disabled = true;
    mensagemConclusao.textContent = `Voto confirmado para a Chapa ${chapaSelecionada}. Seu nome foi registrado separadamente da contagem dos votos.`;
    mostrarEtapa(etapaConcluida);
});
