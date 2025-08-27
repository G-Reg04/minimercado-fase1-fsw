/* =================== Config =================== */
const MM_HORARIO = {
  semana: { abre: "09:00", fecha: "20:00" },   // seg–sáb
  domingo: { abre: "10:00", fecha: "16:00" },  // dom
  antecedenciaHoras: 2,
  passoMin: 15
};
const STORAGE_KEY = "mm_agendamentos";

/* =================== Utils ==================== */
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const pad2 = (n) => String(n).padStart(2, "0");
const toMinutes = (hhmm) => { const [h,m]=hhmm.split(":").map(Number); return h*60+m; };
const minutesToHHMM = (min) => `${pad2(Math.floor(min/60))}:${pad2(min%60)}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtDate = (iso) => {
  // aceita "YYYY-MM-DD" ou ISO completo
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  try{ return iso.slice(0,10); }catch{ return ""; }
};

/* ============ Persistência localStorage ========= */
function loadAll(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); }catch{ return []; } }
function saveAll(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function addOne(item){
  const list = loadAll();
  // garante um id; não quebra dados antigos
  item.id = item.id || `ag_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  list.push(item); saveAll(list);
}
function removeByIndex(idx){
  const list = loadAll(); if (idx<0 || idx>=list.length) return;
  list.splice(idx,1); saveAll(list);
}

/* ============== Index: status & formulário ============== */
function initStatusLoja(){
  const elA = $("#statusAberto"), elF = $("#statusFechado"), msg = $("#horarioMsg");
  if(!elA || !elF || !msg) return;
  function tick(){
    const now = new Date();
    const day = now.getDay();
    const conf = (day===0) ? MM_HORARIO.domingo : MM_HORARIO.semana;
    const cur = toMinutes(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
    const aberto = cur >= toMinutes(conf.abre) && cur <= toMinutes(conf.fecha);
    elA.classList.toggle("d-none", !aberto);
    elF.classList.toggle("d-none", aberto);
    msg.textContent = `Hoje: ${conf.abre}–${conf.fecha}`;
  }
  tick(); setInterval(tick, 60_000);
}

function initAgendamento(){
  const inputData = $("#data"), inputHora = $("#hora");
  if(!inputData || !inputHora) return;
  const hoje = new Date();
  inputData.min = `${hoje.getFullYear()}-${pad2(hoje.getMonth()+1)}-${pad2(hoje.getDate())}`;
  inputHora.step = String(MM_HORARIO.passoMin * 60);
  function recalcular(){
    const sel = inputData.value ? new Date(inputData.value + "T00:00") : hoje;
    const conf = (sel.getDay()===0) ? MM_HORARIO.domingo : MM_HORARIO.semana;
    let minMin = toMinutes(conf.abre);
    const maxMin = toMinutes(conf.fecha);
    const isoHoje = inputData.min;
    if(inputData.value === isoHoje){
      const agoraMais = new Date(Date.now()+MM_HORARIO.antecedenciaHoras*3600*1000);
      minMin = clamp(toMinutes(`${pad2(agoraMais.getHours())}:${pad2(agoraMais.getMinutes())}`), minMin, maxMin);
    }
    inputHora.min = minutesToHHMM(minMin);
    inputHora.max = minutesToHHMM(maxMin);
    if(!inputHora.value || inputHora.value < inputHora.min) inputHora.value = inputHora.min;
    if(inputHora.value > inputHora.max) inputHora.value = inputHora.max;
  }
  inputData.addEventListener("change", recalcular);
  recalcular();
}

function initServico(){
  const entrega = $("#entrega"), retirada = $("#retirada");
  if(!entrega || !retirada) return;
  const campos = ["endereco","numero","bairro","cidade","uf","cep"]
    .map(id => document.getElementById(id)).filter(Boolean);
  const grupos = campos.map(el => el.closest(".col-12, .col-6, .col-md-6, .col-md-4, .col-md-2") || el.parentElement);
  function toggle(){
    const usarEntrega = entrega.checked;
    campos.forEach(el => el.required = usarEntrega);
    grupos.forEach(gr => gr && gr.classList.toggle("d-none", !usarEntrega));
  }
  entrega.addEventListener("change", toggle);
  retirada.addEventListener("change", toggle);
  toggle();
}

function initMascaraCPF(){
  const cpf = $("#cpf"); if(!cpf) return;
  cpf.addEventListener("input", () => {
    let v = cpf.value.replace(/\D/g,"").slice(0,11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    cpf.value = v;
  });
}

function serializeForm(form){
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  obj.newsletter = fd.has("newsletter");
  obj.criadoEm = new Date().toISOString();
  obj.id = `ag_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  return obj;
}

/* ====== Mini-lista no index (abaixo do formulário) ====== */
function renderAgendamentosIndex(){
  const box = $("#listaAgendamentos"); if(!box) return;
  const ag = loadAll();
  if(ag.length === 0){
    box.innerHTML = `<div class="alert alert-info" role="status">Nenhum agendamento ainda. Preencha o formulário acima.</div>`;
    return;
  }
  const linhas = ag.slice(-10).reverse().map((a) => {
    const serv = a.servico === "entrega" ? "Entrega" : "Retirada";
    const end = a.servico === "entrega"
      ? [a.endereco, a.numero && `, ${a.numero}`, a.bairro && ` — ${a.bairro}`, a.cidade && ` / ${a.uf}`].filter(Boolean).join("")
      : "Balcão";
    return `<tr>
      <td>${a.nomeCompleto || "-"}</td>
      <td>${serv}</td>
      <td>${a.data || "-"}</td>
      <td>${a.hora || "-"}</td>
      <td>${end || "—"}</td>
    </tr>`;
  }).join("");

  box.innerHTML = `
  <div class="card">
    <div class="card-body">
      <h3 class="h6 mb-3">Agendamentos recentes</h3>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-3">
          <thead><tr><th>Cliente</th><th>Serviço</th><th>Data</th><th>Hora</th><th>Endereço / Retirada</th></tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
      <div class="d-flex gap-2">
        <button id="btnExportarIndex" class="btn btn-outline-secondary btn-sm">Exportar JSON</button>
        <a class="btn btn-outline-primary btn-sm" href="agendamentos.html">Gerenciar tudo</a>
      </div>
    </div>
  </div>`;
  $("#btnExportarIndex")?.addEventListener("click", () => exportJSON(loadAll()));
}

/* ============== Gestão completa (nova página) ============== */
function appAgendamentosRender(){
  const root = $("#appAgendamentos");
  if(!root) return;

  // Toolbar + tabela (render inicial)
  root.innerHTML = `
  <div class="card">
    <div class="card-body">
      <form id="filtros" class="row g-2 align-items-end">
        <div class="col-12 col-md-4">
          <label for="fBusca" class="form-label">Buscar</label>
          <input id="fBusca" class="form-control" type="search" placeholder="Nome, CPF, e-mail, telefone, bairro..." />
        </div>
        <div class="col-6 col-md-2">
          <label for="fServico" class="form-label">Serviço</label>
          <select id="fServico" class="form-select">
            <option value="">Todos</option>
            <option value="retirada">Retirada</option>
            <option value="entrega">Tele-entrega</option>
          </select>
        </div>
        <div class="col-6 col-md-2">
          <label for="fDataMin" class="form-label">De</label>
          <input id="fDataMin" type="date" class="form-control"/>
        </div>
        <div class="col-6 col-md-2">
          <label for="fDataMax" class="form-label">Até</label>
          <input id="fDataMax" type="date" class="form-control"/>
        </div>
        <div class="col-12 col-md-2 d-flex gap-2">
          <button id="btnReset" type="button" class="btn btn-outline-secondary flex-grow-1">Limpar filtros</button>
        </div>
      </form>

      <div class="d-flex flex-wrap gap-2 mt-3">
        <a class="btn btn-primary" href="index.html#cadastro">Novo agendamento</a>
        <button id="btnExportar" class="btn btn-outline-secondary">Exportar JSON</button>
        <label class="btn btn-outline-secondary mb-0">
          Importar JSON<input id="inputImport" type="file" accept="application/json" hidden>
        </label>
        <button id="btnLimparTudo" class="btn btn-outline-danger ms-auto">Limpar todos</button>
      </div>

      <p id="agCount" class="text-muted mt-2 mb-2"></p>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Cliente</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Serviço</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Endereço / Retirada</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody id="tbodyAg"></tbody>
        </table>
      </div>
    </div>
  </div>`;

  // Handlers e render
  const fBusca = $("#fBusca"), fServico = $("#fServico"), fMin = $("#fDataMin"), fMax = $("#fDataMax");
  const tbody = $("#tbodyAg"), count = $("#agCount");

  function aplicaFiltros(list){
    let arr = list.map((a, idx) => ({ a, idx })); // mantém índice do storage
    const q = (fBusca.value || "").toLowerCase().trim();
    if (q){
      arr = arr.filter(({a}) => {
        return [a.nomeCompleto, a.cpf, a.email, a.telefone, a.bairro, a.cidade]
          .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
      });
    }
    if (fServico.value){
      arr = arr.filter(({a}) => a.servico === fServico.value);
    }
    const dMin = fMin.value ? fMin.value : null;
    const dMax = fMax.value ? fMax.value : null;
    if (dMin) arr = arr.filter(({a}) => !a.data || fmtDate(a.data) >= dMin);
    if (dMax) arr = arr.filter(({a}) => !a.data || fmtDate(a.data) <= dMax);

    // ordena por data + hora (asc)
    arr.sort((x, y) => {
      const dx = fmtDate(x.a.data), dy = fmtDate(y.a.data);
      if (dx !== dy) return dx < dy ? -1 : 1;
      return String(x.a.hora||"") < String(y.a.hora||"") ? -1 : 1;
    });
    return arr;
  }

  function paint(){
    const all = loadAll();
    const arr = aplicaFiltros(all);

    count.textContent = `${arr.length} agendamento(s) exibido(s) — total armazenado: ${all.length}`;

    if (arr.length === 0){
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">Nenhum agendamento encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = arr.map(({a, idx}) => {
      const serv = a.servico === "entrega" ? "Tele-entrega" : "Retirada";
      const end = a.servico === "entrega"
        ? [a.endereco, a.numero && `, ${a.numero}`, a.bairro && ` — ${a.bairro}`, a.cidade && ` / ${a.uf}`]
            .filter(Boolean).join("")
        : "Balcão";
      return `<tr>
        <td>${a.nomeCompleto || "-"}</td>
        <td>${a.cpf || "-"}</td>
        <td>${a.telefone || "-"}</td>
        <td>${a.email || "-"}</td>
        <td>${serv}</td>
        <td>${a.data || "-"}</td>
        <td>${a.hora || "-"}</td>
        <td>${end || "—"}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-del="${idx}">Excluir</button>
        </td>
      </tr>`;
    }).join("");

    // ações de excluir
    $$('button[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-del'));
        if (confirm("Excluir este agendamento?")){
          removeByIndex(idx);
          paint();
        }
      });
    });
  }

  // eventos filtros / ações
  ["input","change"].forEach(ev => {
    fBusca.addEventListener(ev, paint);
    fServico.addEventListener(ev, paint);
    fMin.addEventListener(ev, paint);
    fMax.addEventListener(ev, paint);
  });
  $("#btnReset").addEventListener("click", () => {
    fBusca.value = ""; fServico.value = ""; fMin.value = ""; fMax.value = "";
    paint();
  });
  $("#btnLimparTudo").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja apagar TODOS os agendamentos? Esta ação não pode ser desfeita.")){
      saveAll([]); paint();
    }
  });
  $("#btnExportar").addEventListener("click", () => exportJSON(loadAll()));
  $("#inputImport").addEventListener("change", async (ev) => {
    const file = ev.target.files?.[0]; if(!file) return;
    try{
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("JSON deve ser um array de agendamentos");
      const current = loadAll();
      data.forEach(d => { d.id = d.id || `ag_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; current.push(d); });
      saveAll(current);
      paint();
      alert("Importação concluída!");
    }catch(e){
      alert("Falha ao importar: " + e.message);
    }finally{
      ev.target.value = ""; // limpa input
    }
  });

  // primeira renderização
  paint();
}

/* ================== Validação + Toast =================== */
function initValidacao(){
  const form = $("#formCadastro"); if(!form) return;
  const toastEl = $("#toastSucesso");
  const toast = toastEl ? new bootstrap.Toast(toastEl) : null;
  form.addEventListener("submit", (ev) => {
    if(!form.checkValidity()){
      ev.preventDefault(); ev.stopPropagation();
    }else{
      ev.preventDefault();
      const dados = serializeForm(form);
      addOne(dados);
      toast?.show();
      form.reset();
      initServico(); initAgendamento();
      renderAgendamentosIndex();
    }
    form.classList.add("was-validated");
  });
}

/* ================== Navbar ativa =================== */
function initNavAtiva(){
  const path = location.pathname.split("/").pop() || "index.html";
  $$(".navbar a.nav-link").forEach(a => {
    const href = a.getAttribute("href") || "";
    const alvo = href.split("/").pop();
    const ativo = (alvo === path) || (alvo.startsWith("#") && path === "index.html");
    a.classList.toggle("active", ativo);
    if (ativo) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
  });
}

/* ================== Export helper =================== */
function exportJSON(data){
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "agendamentos.json"; a.click();
  URL.revokeObjectURL(url);
}

/* ===================== Boot ===================== */
document.addEventListener("DOMContentLoaded", () => {
  initStatusLoja();
  initAgendamento();
  initServico();
  initMascaraCPF();
  initValidacao();
  renderAgendamentosIndex();   // aparece só no index
  appAgendamentosRender();     // roda só se estiver em agendamentos.html
  initNavAtiva();
});
