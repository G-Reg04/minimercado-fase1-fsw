# MiniMercado Greger — Fase 2 (Fundamentos de Sistemas Web)

**Site (GitHub Pages):**  
https://g-reg04.github.io/minimercado-fase1-fsw/index.html

**Repositório:**  
https://github.com/G-Reg04/minimercado-fase1-fsw

Projeto acadêmico de um minimercado com **HTML + CSS/Bootstrap 5.3 + JavaScript (ES6)**.  
Nesta Fase 2 o foco foi **tornar o site atrativo e dinâmico**, criar o **formulário de cadastro** com **agendamento** e **aprimorar acessibilidade**.

---

## 📂 Estrutura de pastas

```plaintext
minimercado-greger/          # Projeto completo do site

├─ index.html                # Página inicial (carrossel + catálogo + formulário + agendamentos recentes)
├─ frutas.html               # Subcatálogo Frutas & Verduras
├─ higiene.html              # Subcatálogo Higiene & Limpeza
├─ nao-pereciveis.html       # Subcatálogo Alimentos Não Perecíveis
├─ servicos.html             # Página de serviços (Retirada / Tele-entrega)
├─ agendamentos.html         # Nova página (gestão completa dos agendamentos via localStorage)
│
├─ css/
│  └─ styles.css             # Paleta, fontes, ajustes de Bootstrap, responsividade e acessibilidade
│
├─ js/
│  └─ main.js                # Lógica JS: validação, horários, máscara CPF, cadastro, storage, listagens
│
├─ assets/
│  ├─ favicon.ico            # Ícone do site
│  └─ img/                   # Imagens de produtos
│     ├─ frutas/
│     ├─ verduras/
│     ├─ nao-pereciveis/
│     ├─ higiene/
│     └─ limpeza/
│
├─ README.md                 # Documentação do projeto (instruções, requisitos, links)
└─ CHANGELOG.md              # Registro de alterações por versão

---

## 🧰 Tecnologias e decisões

- **Bootstrap 5.3 (CDN)**: grid responsivo, componentes (navbar, cards, carousel, accordion, toasts).
- **JavaScript puro (ES6)**, sem bibliotecas adicionais.
- **Tema próprio** no `styles.css`:
  - **Paleta Coolors**: Antiflash White, YInMn Blue, Air Superiority Blue, Uranian Blue, Battleship Gray.
  - **Tipografia (Google Fonts)**: *Poppins* (títulos), *Nunito Sans* (subtítulos), *Inter* (texto).
  - Mapeamento para variáveis do Bootstrap (`--bs-primary`, `--bs-tertiary-bg`, links, etc.).
- **Acessibilidade**: *skip link*, `alt` em imagens, contraste, navegação por teclado, rótulos de formulário, mensagens com `aria-live`.

---

## ✅ O que foi implementado na Fase 2

### UI/Design
- Carrossel (Bootstrap) com **tamanho consistente** e legenda **legível**.
- **Footer compacto** e padrão visual da marca aplicado ao site todo.
- Páginas de catálogo reconstruídas com **cards** e **grid responsivo**.

### JavaScript (dinâmica do site)
- **Status de funcionamento** “Aberto agora / Fechado” por **dia/horário**.
- **Agendamento** com:
  - **Data mínima** = hoje,
  - **janela de atendimento** (Seg–Sáb 09:00–20:00; Dom 10:00–16:00),
  - **antecedência mínima** de 2 horas,
  - passo de 15 min.
- **Serviço** (Retirada / Tele-entrega): alterna exibição e **obrigatoriedade** dos campos de **endereço**.
- **Máscara simples de CPF** no input.
- **Validação HTML5 + Bootstrap** com **Toast de sucesso**.
- **Persistência** no **`localStorage`**: salva agendamentos do formulário.
- **Lista de agendamentos recentes** logo abaixo do formulário (com **Exportar JSON** e **Limpar**).
- **Gestão completa** em `agendamentos.html`: **buscar**, **filtrar por serviço e data**, **ordenar por data/hora**, **excluir item**, **apagar tudo**, **exportar/importar JSON**.
- **Navbar** marca automaticamente o **item ativo** em todas as páginas.

### Acessibilidade
- **Skip link** “Ir para o conteúdo”.
- `alt` descritivo nas imagens.
- Legenda do carrossel com **fundo claro** e texto de **alto contraste**.
- `aria-live` nas mensagens dinâmicas (status/validação/toast/lista).
- Foco visível, sem dependência de mouse.

---

## 🧪 Como testar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/G-Reg04/minimercado-projeto-fsw
   cd minimercado-projeto-fsw

2. Abra index.html no navegador (ou use a extensão Live Server do VS Code).

3. Teste:
    - Carrossel e navegação.
    - Formulário (campos obrigatórios, máscara, data/hora válidas).
    - Toast de sucesso e lista de agendamentos.
    - Página agendamentos.html para filtrar/gerenciar.
    - Os dados ficam somente no navegador (não há back-end). Para “resetar”, use o botão Limpar lista ou apague localStorage do site.

