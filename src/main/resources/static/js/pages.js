const API_BASE_URL = "http://localhost:8080";

// =========================
// BOOTSTRAP
// =========================
document.addEventListener("DOMContentLoaded", () => {
  wireNavigation();
  runPageController();
});

function runPageController() {
  const pageName = document.body.dataset.page;

  switch (pageName) {
    case "login":
      setupLoginPage();
      break;

    case "administrador":
      protectPage("admin");
      break;

    case "bibliotecario":
      protectPage("bibliotecario");
      break;

    case "leitor":
      protectPage("leitor");
      break;

    case "cad-bibliotecario":
      if (protectPage("admin")) {
        setupLibrarianForm();
      }
      break;

    case "cad-fornecedor":
      if (protectPage(["admin", "bibliotecario"])) {
        setupSupplierForm();
      }
      break;

    case "cad-leitor":
      if (protectPage(["admin", "bibliotecario"])) {
        setupReaderForm();
      }
      break;

    case "cad-livro":
      if (protectPage(["admin", "bibliotecario"])) {
        setupBookForm();
      }
      break;

    case "atu-fornecedor":
      if (protectPage(["admin", "bibliotecario"])) {
        setupUpdateSupplierPage();
      }
      break;

    case "atu-livro":
      if (protectPage(["admin", "bibliotecario"])) {
        setupUpdateBookPage();
      }
      break;

    case "consultar":
      if (protectPage(["leitor", "bibliotecario", "admin"])) {
        setupCatalogPage();
      }
      break;

    case "consultar-emprestimos":
      if (protectPage(["admin", "bibliotecario"])) {
        setupLoanManagementPage();
      }
      break;

    case "consultar-devolucoes":
      if (protectPage(["admin", "bibliotecario"])) {
        setupReturnManagementPage();
      }
      break;

    case "emprestimos":
      if (protectPage("leitor")) {
        setupReaderLoansPage();
      }
      break;

    case "devolucao":
      if (protectPage(["leitor", "bibliotecario", "admin"])) {
        setupReaderReturnPage();
      }
      break;

    default:
      break;
  }
}

// =========================
// STORAGE / SESSION
// =========================
function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

function logout() {
  removeToken();
  clearCurrentUser();
  goTo("index.html");
}

// =========================
// AUTH / ROLE
// =========================
function parseJwt(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeRole(value) {
  const role = String(value || "").toUpperCase();

  if (role.includes("ADMIN")) return "admin";
  if (role.includes("LIBRARIAN")) return "bibliotecario";
  if (role.includes("USER")) return "leitor";

  return "";
}

function extractRoleFromToken(token) {
  const payload = parseJwt(token);

  if (!payload) return "";

  return (
    normalizeRole(payload.role) ||
    normalizeRole(Array.isArray(payload.roles) ? payload.roles[0] : payload.roles) ||
    normalizeRole(Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities) ||
    normalizeRole(payload.scope)
  );
}

function getHomePageByRole(role) {
  if (role === "admin") return "administrador.html";
  if (role === "bibliotecario") return "bibliotecario.html";
  return "leitor.html";
}

function protectPage(allowedRoles) {
  const currentUser = getCurrentUser();
  const token = getToken();

  if (!currentUser || !token) {
    goTo("index.html");
    return false;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(currentUser.role)) {
    goTo(getHomePageByRole(currentUser.role));
    return false;
  }

  return true;
}

// =========================
// API
// =========================
async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error("Sessão expirada ou acesso negado.");
  }

  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.details ||
      `Erro na requisição (${response.status}).`;

    throw new Error(message);
  }

  return data;
}

async function fetchBooks() {
  const data = await apiRequest("/books", { method: "GET" });
  return Array.isArray(data) ? data : (data?.content || []);
}

async function fetchSuppliers() {
  const data = await apiRequest("/suppliers", { method: "GET" });
  return Array.isArray(data) ? data : (data?.content || []);
}

// =========================
// UI HELPERS
// =========================
function setStatus(elementId, message, type = "") {
  const statusElement = document.getElementById(elementId);

  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.className = `status ${type}`.trim();
}

function clearStatus(elementId) {
  setStatus(elementId, "");
}

function fillTable(tableBodyId, rows, renderRow, emptyMessage, onRowClick) {
  const tableBody = document.getElementById(tableBodyId);

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  if (!rows.length) {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "is-empty";

    const emptyCell = document.createElement("td");
    emptyCell.colSpan = tableBody.dataset.columns || 1;
    emptyCell.textContent = emptyMessage;

    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  rows.forEach((rowData) => {
    const row = document.createElement("tr");
    row.innerHTML = renderRow(rowData);

    if (onRowClick) {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => onRowClick(rowData, row));
    }

    tableBody.appendChild(row);
  });
}

function goTo(page) {
  window.location.href = page;
}

function wireNavigation() {
  const logoutButtons = document.querySelectorAll("[data-action='logout']");

  logoutButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  });
}

// =========================
// FORMATTERS / VALIDATORS
// =========================
function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function validateCnpj(value) {
  return onlyDigits(value).length === 14;
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function validatePhone(value) {
  const len = onlyDigits(value).length;
  return len === 10 || len === 11;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("pt-BR");
}

// =========================
// AUTH PAGES
// =========================
function setupLoginPage() {
  const currentUser = getCurrentUser();

  if (currentUser && getToken()) {
    goTo(getHomePageByRole(currentUser.role));
    return;
  }

  const hintBox = document.querySelector(".hint-box");
  if (hintBox) {
    hintBox.innerHTML = `
      <p><strong>Login via API:</strong> o formulário agora envia os dados para <code>/auth/login</code>.</p>
      <p>O JWT retornado é armazenado no navegador e enviado automaticamente nas rotas protegidas.</p>
    `;
  }

  const loginForm = document.getElementById("login-form");
  const loginField = document.getElementById("login");
  const passwordField = document.getElementById("senha");

  if (!loginForm || !loginField || !passwordField) {
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("login-status");

    const login = loginField.value.trim();
    const senha = passwordField.value.trim();

    if (!login || !senha) {
      setStatus("login-status", "Informe login e senha.", "error");
      return;
    }

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login, senha })
      });

      if (!response?.token) {
        throw new Error("A API não retornou o token JWT.");
      }

      const token = response.token;
      const role =
        normalizeRole(response.role) ||
        extractRoleFromToken(token);

      if (!role) {
        throw new Error("Não foi possível identificar o papel do usuário no retorno do login/JWT.");
      }

      setToken(token);
      setCurrentUser({
        id: response.id || null,
        nome: response.nome || login,
        login,
        role
      });

      goTo(getHomePageByRole(role));
    } catch (error) {
      setStatus("login-status", error.message || "Falha no login.", "error");
    }
  });
}

function setupLibrarianForm() {
  const form = document.getElementById("bibliotecario-form");
  const nameField = document.getElementById("nome");
  const loginField = document.getElementById("login");
  const passwordField = document.getElementById("senha");

  if (!form || !nameField || !loginField || !passwordField) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("bibliotecario-status");

    const nome = nameField.value.trim();
    const login = loginField.value.trim();
    const senha = passwordField.value.trim();

    if (nome.length < 3) {
      setStatus("bibliotecario-status", "Informe um nome com ao menos 3 caracteres.", "error");
      return;
    }

    if (login.length < 4) {
      setStatus("bibliotecario-status", "O login deve ter ao menos 4 caracteres.", "error");
      return;
    }

    if (senha.length < 6) {
      setStatus("bibliotecario-status", "A senha deve ter ao menos 6 caracteres.", "error");
      return;
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome,
          login,
          senha,
          role: "LIBRARIAN"
        })
      });

      form.reset();
      setStatus("bibliotecario-status", "Bibliotecário cadastrado com sucesso.", "success");
    } catch (error) {
      setStatus("bibliotecario-status", error.message, "error");
    }
  });
}

function setupReaderForm() {
  const form = document.getElementById("leitor-form");
  const nameField = document.getElementById("nome");
  const phoneField = document.getElementById("telefone");
  const addressField = document.getElementById("endereco");
  const loginField = document.getElementById("login");
  const passwordField = document.getElementById("senha");

  if (!form || !nameField || !phoneField || !addressField || !loginField || !passwordField) {
    return;
  }

  phoneField.addEventListener("input", () => {
    phoneField.value = formatPhone(phoneField.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("leitor-status");

    const nome = nameField.value.trim();
    const telefone = phoneField.value.trim();
    const endereco = addressField.value.trim();
    const login = loginField.value.trim();
    const senha = passwordField.value.trim();

    if (nome.length < 3) {
      setStatus("leitor-status", "Informe um nome com ao menos 3 caracteres.", "error");
      return;
    }

    if (!validatePhone(telefone)) {
      setStatus("leitor-status", "Informe um telefone válido.", "error");
      return;
    }

    if (endereco.length < 5) {
      setStatus("leitor-status", "Informe um endereço mais completo.", "error");
      return;
    }

    if (login.length < 4) {
      setStatus("leitor-status", "O login deve ter ao menos 4 caracteres.", "error");
      return;
    }

    if (senha.length < 6) {
      setStatus("leitor-status", "A senha deve ter ao menos 6 caracteres.", "error");
      return;
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome,
          telefone,
          endereco,
          login,
          senha,
          role: "USER"
        })
      });

      form.reset();
      setStatus("leitor-status", "Leitor cadastrado com sucesso.", "success");
    } catch (error) {
      setStatus("leitor-status", error.message, "error");
    }
  });
}

// =========================
// SUPPLIER PAGES
// =========================
function setupSupplierForm() {
  const form = document.getElementById("fornecedor-form");
  const nameField = document.getElementById("nome");
  const cnpjField = document.getElementById("cnpj");
  const phoneField = document.getElementById("telefone");

  if (!form || !nameField || !cnpjField || !phoneField) {
    return;
  }

  cnpjField.addEventListener("input", () => {
    cnpjField.value = formatCnpj(cnpjField.value);
  });

  phoneField.addEventListener("input", () => {
    phoneField.value = formatPhone(phoneField.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("fornecedor-status");

    const nome = nameField.value.trim();
    const cnpj = cnpjField.value.trim();
    const telefone = phoneField.value.trim();

    if (nome.length < 3) {
      setStatus("fornecedor-status", "Informe um nome com ao menos 3 caracteres.", "error");
      return;
    }

    if (!validateCnpj(cnpj)) {
      setStatus("fornecedor-status", "Informe um CNPJ com 14 dígitos.", "error");
      return;
    }

    if (!validatePhone(telefone)) {
      setStatus("fornecedor-status", "Informe um telefone válido.", "error");
      return;
    }

    try {
      await apiRequest("/suppliers", {
        method: "POST",
        body: JSON.stringify({ nome, cnpj, telefone })
      });

      form.reset();
      setStatus("fornecedor-status", "Fornecedor cadastrado com sucesso.", "success");
    } catch (error) {
      setStatus("fornecedor-status", error.message, "error");
    }
  });
}

function setupUpdateSupplierPage() {
  const form = document.getElementById("update-supplier-form");
  const nameField = document.getElementById("nome");
  const cnpjField = document.getElementById("cnpj");
  const phoneField = document.getElementById("telefone");
  const chooseSupplierButton = document.getElementById("choose-supplier");
  const updateButton = document.getElementById("update-supplier-button");

  if (!form || !nameField || !cnpjField || !phoneField || !chooseSupplierButton || !updateButton) {
    return;
  }

  let selectedSupplier = null;
  let selectedRow = null;
  let suppliersCache = [];

  cnpjField.addEventListener("input", () => {
    cnpjField.value = formatCnpj(cnpjField.value);
  });

  phoneField.addEventListener("input", () => {
    phoneField.value = formatPhone(phoneField.value);
  });

  async function renderSuppliers() {
    try {
      suppliersCache = await fetchSuppliers();

      fillTable(
        "update-suppliers-body",
        suppliersCache,
        (supplier) => `
          <td>${supplier.id ?? "-"}</td>
          <td>${supplier.nome ?? "-"}</td>
          <td>${supplier.cnpj ?? "-"}</td>
          <td>${supplier.telefone ?? "-"}</td>
        `,
        "Nenhum fornecedor disponível para edição.",
        (supplier, row) => {
          if (selectedRow) {
            selectedRow.classList.remove("is-selected");
          }

          row.classList.add("is-selected");
          selectedRow = row;
          selectedSupplier = supplier;
          chooseSupplierButton.disabled = false;
        }
      );
    } catch (error) {
      setStatus("update-supplier-status", error.message, "error");
    }
  }

  chooseSupplierButton.addEventListener("click", () => {
    if (!selectedSupplier) {
      return;
    }

    nameField.value = selectedSupplier.nome || "";
    cnpjField.value = selectedSupplier.cnpj || "";
    phoneField.value = selectedSupplier.telefone || "";
    updateButton.disabled = false;
    chooseSupplierButton.textContent = "Fornecedor Selecionado";
    chooseSupplierButton.disabled = true;

    setStatus(
      "update-supplier-status",
      `Fornecedor #${selectedSupplier.id} carregado para edição.`,
      "success"
    );
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("update-supplier-status");

    if (!selectedSupplier?.id) {
      setStatus("update-supplier-status", "Selecione um fornecedor antes de atualizar.", "error");
      return;
    }

    const nome = nameField.value.trim();
    const cnpj = cnpjField.value.trim();
    const telefone = phoneField.value.trim();

    if (nome.length < 3 || !validateCnpj(cnpj) || !validatePhone(telefone)) {
      setStatus("update-supplier-status", "Revise os campos informados.", "error");
      return;
    }

    try {
      await apiRequest(`/suppliers/${selectedSupplier.id}`, {
        method: "PATCH",
        body: JSON.stringify({ nome, cnpj, telefone })
      });

      form.reset();
      updateButton.disabled = true;
      chooseSupplierButton.textContent = "Selecionar Fornecedor";
      chooseSupplierButton.disabled = true;

      if (selectedRow) {
        selectedRow.classList.remove("is-selected");
      }

      selectedSupplier = null;
      selectedRow = null;

      await renderSuppliers();
      setStatus("update-supplier-status", "Fornecedor atualizado com sucesso.", "success");
    } catch (error) {
      setStatus("update-supplier-status", error.message, "error");
    }
  });

  renderSuppliers();
}

// =========================
// BOOK PAGES
// =========================
function setupBookForm() {
  const form = document.getElementById("livro-form");
  const selectSupplierButton = document.getElementById("select-supplier-button");
  const selectedSupplierField = document.getElementById("fornecedorId");
  const selectedSupplierSummary = document.getElementById("selected-supplier-summary");

  if (!form || !selectSupplierButton || !selectedSupplierField || !selectedSupplierSummary) {
    return;
  }

  let selectedSupplier = null;
  let selectedRow = null;

  async function renderSuppliers() {
    try {
      const suppliers = await fetchSuppliers();

      fillTable(
        "suppliers-table-body",
        suppliers,
        (supplier) => `
          <td>${supplier.id ?? "-"}</td>
          <td>${supplier.nome ?? "-"}</td>
          <td>${supplier.cnpj ?? "-"}</td>
          <td>${supplier.telefone ?? "-"}</td>
        `,
        "Nenhum fornecedor cadastrado.",
        (supplier, row) => {
          if (selectedRow) {
            selectedRow.classList.remove("is-selected");
          }

          row.classList.add("is-selected");
          selectedRow = row;
          selectedSupplier = supplier;
          selectSupplierButton.disabled = false;
        }
      );
    } catch (error) {
      setStatus("livro-status", error.message, "error");
    }
  }

  selectSupplierButton.addEventListener("click", () => {
    if (!selectedSupplier) {
      return;
    }

    selectedSupplierField.value = String(selectedSupplier.id);
    selectedSupplierSummary.textContent = `Fornecedor selecionado: ${selectedSupplier.nome}`;
    selectSupplierButton.textContent = "Fornecedor Selecionado";
    selectSupplierButton.disabled = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("livro-status");

    const titulo = document.getElementById("titulo")?.value.trim() || "";
    const autor = document.getElementById("autor")?.value.trim() || "";
    const editora = document.getElementById("editora")?.value.trim() || "";
    const dataPublicacao = document.getElementById("dataPublicacao")?.value || "";
    const genero = document.getElementById("genero")?.value.trim() || "";
    const quantidade = Number(document.getElementById("quantidade")?.value);
    const fornecedorId = Number(selectedSupplierField.value);

    if (titulo.length < 2 || autor.length < 3 || editora.length < 2 || genero.length < 3) {
      setStatus("livro-status", "Preencha todos os campos textuais corretamente.", "error");
      return;
    }

    if (!dataPublicacao) {
      setStatus("livro-status", "Informe a data de publicação.", "error");
      return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      setStatus("livro-status", "A quantidade deve ser um número inteiro maior que zero.", "error");
      return;
    }

    if (!fornecedorId) {
      setStatus("livro-status", "Selecione um fornecedor para o livro.", "error");
      return;
    }

    try {
      await apiRequest(`/books/supplier/${fornecedorId}`, {
        method: "POST",
        body: JSON.stringify({
          titulo,
          autor,
          editora,
          dataPublicacao,
          genero,
          quantidade
        })
      });

      form.reset();
      selectedSupplierField.value = "";
      selectedSupplierSummary.textContent = "Nenhum fornecedor selecionado";

      if (selectedRow) {
        selectedRow.classList.remove("is-selected");
      }

      selectedRow = null;
      selectedSupplier = null;
      selectSupplierButton.textContent = "Selecionar Fornecedor";
      selectSupplierButton.disabled = true;

      await renderSuppliers();
      setStatus("livro-status", "Livro cadastrado com sucesso.", "success");
    } catch (error) {
      setStatus("livro-status", error.message, "error");
    }
  });

  renderSuppliers();
}

function setupUpdateBookPage() {
  const form = document.getElementById("update-book-form");
  const selector = document.getElementById("bookSelector");
  const titleField = document.getElementById("titulo");
  const authorField = document.getElementById("autor");
  const publisherField = document.getElementById("editora");
  const publishDateField = document.getElementById("dataPublicacao");
  const genreField = document.getElementById("genero");
  const quantityField = document.getElementById("quantidade");
  const note = document.getElementById("book-note");

  if (
    !form || !selector || !titleField || !authorField || !publisherField ||
    !publishDateField || !genreField || !quantityField || !note
  ) {
    return;
  }

  let booksCache = [];

  function loadBook(bookId) {
    const book = booksCache.find((item) => Number(item.id) === Number(bookId));

    if (!book) {
      return;
    }

    titleField.value = book.titulo || "";
    authorField.value = book.autor || "";
    publisherField.value = book.editora || "";
    publishDateField.value = (book.dataPublicacao || "").split("T")[0];
    genreField.value = book.genero || "";
    quantityField.value = book.quantidade ?? 0;
    note.textContent = `Livro carregado: ${book.titulo || "-"}`;
  }

  async function populateSelector() {
    try {
      booksCache = await fetchBooks();

      selector.innerHTML = booksCache
        .map((book) => `<option value="${book.id}">${book.titulo}</option>`)
        .join("");

      if (!booksCache.length) {
        form.reset();
        note.textContent = "";
        setStatus("update-book-status", "Nenhum livro cadastrado para edição.", "error");
        return;
      }

      clearStatus("update-book-status");
      loadBook(booksCache[0].id);
    } catch (error) {
      setStatus("update-book-status", error.message, "error");
    }
  }

  selector.addEventListener("change", () => {
    loadBook(selector.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("update-book-status");

    const bookId = Number(selector.value);
    const titulo = titleField.value.trim();
    const autor = authorField.value.trim();
    const editora = publisherField.value.trim();
    const dataPublicacao = publishDateField.value;
    const genero = genreField.value.trim();
    const quantidade = Number(quantityField.value);

    if (!bookId) {
      setStatus("update-book-status", "Selecione um livro.", "error");
      return;
    }

    if (titulo.length < 2 || autor.length < 3 || editora.length < 2 || genero.length < 3 || !dataPublicacao) {
      setStatus("update-book-status", "Revise os dados do livro.", "error");
      return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
      setStatus("update-book-status", "A quantidade deve ser zero ou maior.", "error");
      return;
    }

    try {
      await apiRequest(`/books/${bookId}`, {
        method: "PATCH",
        body: JSON.stringify({
          titulo,
          autor,
          editora,
          dataPublicacao,
          genero,
          quantidade
        })
      });

      await populateSelector();
      selector.value = String(bookId);
      loadBook(bookId);

      setStatus("update-book-status", "Livro atualizado com sucesso.", "success");
    } catch (error) {
      setStatus("update-book-status", error.message, "error");
    }
  });

  populateSelector();
}

// =========================
// CATALOG / LOAN ACTION
// =========================
function setupCatalogPage() {
  const searchField = document.getElementById("catalog-search");
  const reserveButton = document.getElementById("reserve-button");

  if (!searchField || !reserveButton) {
    return;
  }

  let booksCache = [];
  let selectedBook = null;
  let selectedRow = null;

  async function renderCatalog() {
    try {
      booksCache = await fetchBooks();

      const searchTerm = searchField.value.trim().toLowerCase();

      const books = booksCache.filter((book) => {
        const searchableText = [
          book.id,
          book.titulo,
          book.autor,
          book.editora,
          book.genero
        ]
          .join(" ")
          .toLowerCase();

        return !searchTerm || searchableText.includes(searchTerm);
      });

      fillTable(
        "catalog-body",
        books,
        (book) => `
          <td>${book.id ?? "-"}</td>
          <td>${book.titulo ?? "-"}</td>
          <td>${book.autor ?? "-"}</td>
          <td>${book.editora ?? "-"}</td>
          <td>${book.genero ?? "-"}</td>
          <td>${book.quantidade ?? 0}</td>
        `,
        "Nenhum livro encontrado para o filtro informado.",
        (book, row) => {
          if (selectedRow) {
            selectedRow.classList.remove("is-selected");
          }

          row.classList.add("is-selected");
          selectedRow = row;
          selectedBook = book;
          reserveButton.disabled = Number(book.quantidade || 0) < 1;
        }
      );
    } catch (error) {
      setStatus("catalog-status", error.message, "error");
    }
  }

  searchField.addEventListener("input", renderCatalog);

  reserveButton.addEventListener("click", async () => {
    clearStatus("catalog-status");

    if (!selectedBook?.id) {
      setStatus("catalog-status", "Selecione um livro para emprestar.", "error");
      return;
    }

    if (Number(selectedBook.quantidade || 0) < 1) {
      setStatus("catalog-status", "Não há exemplares disponíveis para empréstimo.", "error");
      return;
    }

    try {
      await apiRequest("/loans", {
        method: "POST",
        body: JSON.stringify({ bookId: selectedBook.id })
      });

      selectedBook = null;
      reserveButton.disabled = true;

      if (selectedRow) {
        selectedRow.classList.remove("is-selected");
      }

      selectedRow = null;

      await renderCatalog();
      setStatus("catalog-status", "Empréstimo realizado com sucesso.", "success");
    } catch (error) {
      setStatus("catalog-status", error.message, "error");
    }
  });

  renderCatalog();
}

// =========================
// PAGES THAT NEED MISSING ENDPOINTS
// =========================
function renderApiUnavailableTable(tableBodyId, message) {
  fillTable(
    tableBodyId,
    [],
    () => "",
    message
  );
}

function setupLoanManagementPage() {
  setStatus(
    "loan-management-status",
    "Esta tela depende de um endpoint de listagem de empréstimos (ex.: GET /loans), que não foi informado.",
    "error"
  );

  renderApiUnavailableTable(
    "loan-management-body",
    "Listagem indisponível: falta endpoint GET /loans na API."
  );
}

function setupReturnManagementPage() {
  setStatus(
    "return-management-status",
    "Esta tela depende de um endpoint de listagem de devoluções (ex.: GET /returns ou GET /loans retornados).",
    "error"
  );

  renderApiUnavailableTable(
    "return-management-body",
    "Listagem indisponível: falta endpoint GET para devoluções."
  );
}

function setupReaderLoansPage() {
  setStatus(
    "reader-loans-status",
    "Esta tela depende de um endpoint para listar empréstimos do usuário (ex.: GET /loans/me).",
    "error"
  );

  renderApiUnavailableTable(
    "reader-loans-body",
    "Listagem indisponível: falta endpoint GET /loans/me na API."
  );
}

function setupReaderReturnPage() {
  const returnButton = document.getElementById("return-book-button");

  if (returnButton) {
    returnButton.disabled = true;
  }

  setStatus(
    "return-book-status",
    "Para devolver um livro por seleção em tabela, a API precisa expor listagem de empréstimos ativos do usuário (ex.: GET /loans/me).",
    "error"
  );

  renderApiUnavailableTable(
    "reader-returns-body",
    "Devolução por seleção indisponível: falta endpoint GET /loans/me."
  );
}