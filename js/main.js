// ===== Configurações gerais de horário do minimercado =====
const MM_HORARIO = {
  semana: { abre: "09:00", fecha: "20:00" }, // seg-sáb
  domingo: { abre: "10:00", fecha: "16:00" }, // dom
  antecedenciaHoras: 2, // agendamento com pelo menos 2h
  passoMin: 15
};

// ===== Utilidades =====
const pad2 = n => String(n).padStart(2, "0");
const toMinutes = hhmm => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const minutesToHHMM = min => `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ===== 1) Status "Aberto agora" / "Fechado" =====
function initStatusLoja() {
  const elAberto = $("#statusAberto");
  const elFechado = $("#statusFechado");
  const elMsg = $("#horarioMsg");
  if (!elAberto || !elFechado || !elMsg) return; // só existe no index

  function atualizar() {
    const agora = new Date();
    const dia = agora.getDay(); // 0=domingo
    const conf = (dia === 0) ? MM_HORARIO.domingo : MM_HORARIO.semana;

    const atualMin = toMinutes(`${pad2(agora.getHours())}:${pad2(agora.getMinutes())}`);
    const abreMin = toMinutes(conf.abre);
    const fechaMin = toMinutes(conf.fecha);

    const aberto = atualMin >= abreMin && atualMin <= fechaMin;

    elAberto.classList.toggle("d-none", !aberto);
    elFechado.classList.toggle("d-none", aberto);
    elMsg.textContent = `Hoje: ${conf.abre}–${conf.fecha}`;
  }

  atualizar();
  setInterval(atualizar, 60 * 1000);
}

// ===== 2) Agendamento (min date + range de horário por dia) =====
function initAgendamento() {
  const inputData = $("#data");
  const inputHora = $("#hora");
  if (!inputData || !inputHora) return;

  const hoje = new Date();
  inputData.min = `${hoje.getFullYear()}-${pad2(hoje.getMonth() + 1)}-${pad2(hoje.getDate())}`;
  inputHora.step = String(MM_HORARIO.passoMin * 60);

  function recalcularHoraMinima() {
    const sel = inputData.value ? new Date(inputData.value + "T00:00") : hoje;
    const dia = sel.getDay();
    const conf = (dia === 0) ? MM_HORARIO.domingo : MM_HORARIO.semana;

    let minMin = toMinutes(conf.abre);
    const maxMin = toMinutes(conf.fecha);

    // se marcou hoje, exige antecedência mínima
    const isoHoje = `${hoje.getFullYear()}-${pad2(hoje.getMonth() + 1)}-${pad2(hoje.getDate())}`;
    if (inputData.value === isoHoje) {
      const agora = new Date( Date.now() + MM_HORARIO.antecedenciaHoras * 60 * 60 * 1000 );
      const minHoje = toMinutes(`${pad2(agora.getHours())}:${pad2(agora.getMinutes())}`);
      minMin = clamp(minHoje, minMin, maxMin);
    }

    inputHora.min = minutesToHHMM(minMin);
    inputHora.max = minutesToHHMM(maxMin);

    // Ajusta o valor atual
    if (!inputHora.value || inputHora.value < inputHora.min) inputHora.value = inputHora.min;
    if (inputHora.value > inputHora.max) inputHora.value = inputHora.max;
  }

  inputData.addEventListener("change", recalcularHoraMinima);
  recalcularHoraMinima();
}

// ===== 3) Exibir/ocultar endereço conforme serviço =====
function initServico() {
  const entrega = $("#entrega");
  const retirada = $("#retirada");
  if (!entrega || !retirada) return;

  const campos = ["endereco","numero","bairro","cidade","uf","cep"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const grupos = campos.map(el => el.closest(".col-12, .col-6, .col-md-6, .col-md-4, .col-md-2") || el.parentElement);

  function toggle() {
    const usarEntrega = entrega.checked;
    campos.forEach(el => { el.required = usarEntrega; });
    grupos.forEach(gr => { if (gr) gr.classList.toggle("d-none", !usarEntrega); });
  }

  entrega.addEventListener("change", toggle);
  retirada.addEventListener("change", toggle);
  toggle();
}

// ===== 4) Máscara simples para CPF =====
function initMascaraCPF() {
  const cpf = $("#cpf");
  if (!cpf) return;
  cpf.addEventListener("input", () => {
    let v = cpf.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    cpf.value = v;
  });
}

// ===== 5) Validação do formulário + Toast de sucesso =====
function initValidacao() {
  const form = $("#formCadastro");
  if (!form) return;

  const toastEl = $("#toastSucesso");
  const toast = toastEl ? new bootstrap.Toast(toastEl) : null;

  form.addEventListener("submit", (ev) => {
    if (!form.checkValidity()) {
      ev.preventDefault();
      ev.stopPropagation();
    } else {
      ev.preventDefault(); // simula envio
      if (toast) toast.show();
      form.reset();
      // Reaplicar lógicas dependentes do estado
      initServico();
      initAgendamento();
    }
    form.classList.add("was-validated");
  });
}

// ===== 6) Destacar link ativo da navbar (funciona em todas as páginas) =====
function initNavAtiva() {
  const path = location.pathname.split("/").pop() || "index.html";
  $$(".navbar a.nav-link").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;
    const alvo = href.split("/").pop();
    const ativo = (alvo === path) || (alvo.startsWith("#") && path === "index.html");
    a.classList.toggle("active", ativo);
    if (ativo) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

// ===== Inicialização global =====
document.addEventListener("DOMContentLoaded", () => {
  initStatusLoja();
  initAgendamento();
  initServico();
  initMascaraCPF();
  initValidacao();
  initNavAtiva();
});

