const cidadeInput = document.getElementById("cidadeInput");
const buscarBtn = document.getElementById("buscarBtn");

const clima = document.getElementById("clima");
const mensagem = document.getElementById("mensagem");

const cidadeNome = document.getElementById("cidadeNome");
const dataAtual = document.getElementById("dataAtual");

const temperaturaAtual = document.getElementById("temperaturaAtual");
const condicao = document.getElementById("condicao");
const iconeClima = document.getElementById("iconeClima");

const maxima = document.getElementById("maxima");
const minima = document.getElementById("minima");
const umidade = document.getElementById("umidade");
const vento = document.getElementById("vento");

const previsao = document.getElementById("previsao");


// --------------------------------------------------
// BUSCAR CLIMA
// --------------------------------------------------

async function buscarClima() {

    const cidade = cidadeInput.value.trim();

    if (cidade === "") {
        mostrarMensagem("Digite o nome de uma cidade.");
        return;
    }

    try {

        mostrarMensagem("Buscando informações...");
        clima.classList.add("hidden");

        // Busca a localização da cidade
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            mostrarMensagem("Cidade não encontrada.");
            return;
        }

        const local = geoData.results[0];

        // Busca a previsão
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        mostrarClima(local, weatherData);

    } catch (error) {

        console.error(error);

        mostrarMensagem(
            "Não foi possível buscar os dados. Tente novamente."
        );
    }
}


// --------------------------------------------------
// MOSTRAR CLIMA
// --------------------------------------------------

function mostrarClima(local, dados) {

    mensagem.textContent = "";
    clima.classList.remove("hidden");

    cidadeNome.textContent = `${local.name}, ${local.country}`;

    const hoje = new Date();

    dataAtual.textContent = hoje.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

    const atual = dados.current;

    temperaturaAtual.textContent =
        `${Math.round(atual.temperature_2m)}°C`;

    condicao.textContent =
        obterDescricao(atual.weather_code);

    iconeClima.textContent =
        obterIcone(atual.weather_code);

    maxima.textContent =
        `${Math.round(dados.daily.temperature_2m_max[0])}°C`;

    minima.textContent =
        `${Math.round(dados.daily.temperature_2m_min[0])}°C`;

    umidade.textContent =
        `${atual.relative_humidity_2m}%`;

    vento.textContent =
        `${Math.round(atual.wind_speed_10m)} km/h`;

    mostrarPrevisao(dados.daily);
}


// --------------------------------------------------
// PREVISÃO DOS PRÓXIMOS DIAS
// --------------------------------------------------

function mostrarPrevisao(dados) {

    previsao.innerHTML = "";

    for (let i = 1; i < dados.time.length && i <= 5; i++) {

        const data = new Date(`${dados.time[i]}T12:00:00`);

        const nomeDia = data.toLocaleDateString(
            "pt-BR",
            {
                weekday: "short"
            }
        );

        const temperaturaMax =
            Math.round(dados.temperature_2m_max[i]);

        const temperaturaMin =
            Math.round(dados.temperature_2m_min[i]);

        const icone =
            obterIcone(dados.weather_code[i]);

        const descricao =
            obterDescricao(dados.weather_code[i]);

        const elemento = document.createElement("div");

        elemento.classList.add("dia");

        elemento.innerHTML = `
            <strong>${nomeDia}</strong>

            <div class="icone">
                ${icone}
            </div>

            <p>${descricao}</p>

            <p>
                <strong>${temperaturaMax}°C</strong>
                / ${temperaturaMin}°C
            </p>
        `;

        previsao.appendChild(elemento);
    }
}


// --------------------------------------------------
// CÓDIGOS DO TEMPO
// --------------------------------------------------

function obterDescricao(codigo) {

    const descricoes = {

        0: "Céu limpo",

        1: "Principalmente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",

        45: "Neblina",
        48: "Neblina",

        51: "Garoa leve",
        53: "Garoa",
        55: "Garoa intensa",

        61: "Chuva leve",
        63: "Chuva",
        65: "Chuva intensa",

        71: "Neve leve",
        73: "Neve",
        75: "Neve intensa",

        80: "Pancadas leves",
        81: "Pancadas de chuva",
        82: "Pancadas fortes",

        95: "Tempestade",

        96: "Tempestade com granizo",
        99: "Tempestade com granizo"
    };

    return descricoes[codigo] || "Condição desconhecida";
}


function obterIcone(codigo) {

    if (codigo === 0) {
        return "☀️";
    }

    if (codigo === 1 || codigo === 2) {
        return "🌤️";
    }

    if (codigo === 3) {
        return "☁️";
    }

    if (
        codigo === 45 ||
        codigo === 48
    ) {
        return "🌫️";
    }

    if (
        codigo >= 51 &&
        codigo <= 67
    ) {
        return "🌧️";
    }

    if (
        codigo >= 71 &&
        codigo <= 77
    ) {
        return "❄️";
    }

    if (
        codigo >= 80 &&
        codigo <= 82
    ) {
        return "🌦️";
    }

    if (codigo >= 95) {
        return "⛈️";
    }

    return "🌤️";
}


// --------------------------------------------------
// MENSAGEM
// --------------------------------------------------

function mostrarMensagem(texto) {
    mensagem.textContent = texto;
}


// --------------------------------------------------
// EVENTOS
// --------------------------------------------------

buscarBtn.addEventListener("click", buscarClima);

cidadeInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        buscarClima();
    }

});
