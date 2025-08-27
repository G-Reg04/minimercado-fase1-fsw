
# `CHANGELOG.md`

# Changelog
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).  
Semântica de versão: **MAJOR.MINOR.PATCH**.

## [2.1.0] - 2025-08-27
### Adicionado
- **Página `agendamentos.html`** para gestão local:
  - busca por texto, filtro por **serviço** e **intervalo de datas**;
  - ordenação por data/hora;
  - **excluir item**, **apagar todos**, **exportar** e **importar JSON**.
- Exportar JSON também na lista reduzida da página inicial.
- Link **Agendamentos** no menu (navbar).

### Alterado
- **Formulário**: persistência em `localStorage` e listagem **“Agendamentos recentes”** logo abaixo do cadastro.
- **Footer**: classe `site-footer` com altura **compacta** e borda sutil.
- **Carrossel**: legenda com **fundo claro** e texto escuro para contraste.
- **Navbar**: destaque automático do item ativo em todas as páginas.
- **Catálogos** (`frutas.html`, `higiene.html`, `nao-pereciveis.html`) e `servicos.html` refeitos em **cards + grid** com imagens em **proporção fixa**.

### Correções
- Caminhos relativos para `assets/favicon.ico`, `css/styles.css` e `js/main.js` padronizados.
- Ajustes de acessibilidade (alt em imagens, `aria-live`, foco, rótulos, contraste).

---

## [2.0.0] - 2025-08-26
### Adicionado
- **Tema do site** no `styles.css`:
  - **Paleta Coolors** (Antiflash White, YInMn Blue, Air Superiority Blue, Uranian Blue, Battleship Gray) mapeada às variáveis do Bootstrap.
  - **Tipografia**: Poppins (títulos), Nunito Sans (subtítulos), Inter (texto).
- **Página inicial (`index.html`)** modernizada:
  - **Carrossel Bootstrap** (destaques).
  - **Formulário de cadastro** com campos variados (nome, CPF, sexo, telefone, e-mail, endereço, etc.).
  - **Agendamento** com **data**, **hora** (passo de 15 min) e **serviço** (Retirada/Tele-entrega).
  - **Toast** de sucesso.
- **JavaScript (`main.js`)**:
  - **Status Aberto/Fechado** conforme dia/horário.
  - **Validação HTML5 + Bootstrap**.
  - **Endereço condicional**: campos só aparecem e tornam-se **required** para Tele-entrega.
  - **Máscara simples de CPF**.
  - **Restrições de agendamento**: data mínima (hoje), expediente (Seg–Sáb 09:00–20:00; Dom 10:00–16:00) e **antecedência mínima** de 2h.

### Alterado
- **Navbar** e **cards** com o novo tema.
- Imagens de carrossel com tamanho consistente.

---

## [1.0.0] - 2025-08-18
### Adicionado
- **Fase 1**: páginas estáticas (`index.html`, `frutas.html`, `higiene.html`, `nao-pereciveis.html`, `servicos.html`) com **header / conteúdo / footer**.
- Listas simples de produtos/serviços e assets iniciais.
- Publicação no **GitHub Pages**.

---

## Notas
- Os dados de agendamento são salvos **apenas no navegador** via `localStorage`.  
- Para limpar, use os botões da interface ou apague o armazenamento local do site.
