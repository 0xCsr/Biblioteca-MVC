const API_BASE_URL = "";

// =========================
// BOOT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  setupGlobalNavigation();
  routePage();
});

function routePage() {
  const page = document.body.dataset.page;

  switch (page) {
    case "login":
      setupLoginPage();
      break;

    case "administrador":
      protectPage("ADMIN");
      break;

    case "bibliotecario":
      protectPage("LIBRARIAN");
      break;

    case "leitor":
      protectPage("USER");
      break;

    case "cad-leitor":
      if (protectPage(["ADMIN", "LIBRARIAN"])) setupReaderForm();
      break;

    case "cad-bibliotecario":
      if (protectPage("ADMIN")) setupLibrarianForm();
      break;

    case "cad-fornecedor":
      if (protectPage(["ADMIN", "LIBRARIAN"])) setupSupplierForm();
      break;

    case "atu-fornecedor":
      if (protectPage(["ADMIN", "LIBRARIAN"])) setupUpdateSupplierPage();
      break;

    case "cad-livro":
      if (protectPage(["ADMIN", "LIBRARIAN"])) setupBookForm();
      break;

    case "atu-livro":
      if (protectPage(["ADMIN", "LIBRARIAN"])) setupUpdateBookPage();
      break;

    case "consultar":
      if (protectPage(["USER", "ADMIN", "LIBRARIAN"])) setupCatalogPage();
      break;

    case "emprestimos":
      if (protectPage("USER")) setupReaderLoansPage();
      break;

    case "devolucao":
      if (protectPage("USER")) setupReaderReturnPage();
      break;

    case "consultar-emprestimos":
      if (protectPage(["ADMIN", "LIBRARIAN"])) {
        setSimpleStatus("loan-management-status", "Endpoint geral de empréstimos ainda não existe.");
      }
      break;

    case "consultar-devolucoes":
      if (protectPage(["ADMIN", "LIBRARIAN"])) {
        setSimpleStatus("return-management-status", "Endpoint geral de devoluções ainda não existe.");
      }
      break;

    default:
      break;
  }
}

// =========================
// STORAGE
// =========================
function saveSession(session) {
  localStorage.setItem("auth", JSON.stringify(session));
}

function getSession() {
  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem("auth");
}

function getToken() {
  return getSession()?.token || null;
}

function getCurrentUser() {
  return getSession() || null;
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

// =========================
// API
// =========================
async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error("Sessão expirada ou acesso negado.");
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Erro ${response.status}`
    );
  }

  return data;
}

// =========================
// AUTH / ACCESS
// =========================
function protectPage(roles) {
  const session = getSession();

  if (!session?.token || !session?.role) {
    window.location.href = "index.html";
    return false;
  }

  const allowed = Array.isArray(roles) ? roles : [roles];

  if (!allowed.includes(session.role)) {
    window.location.href = homeByRole(session.role);
    return false;
  }

  return true;
}

function homeByRole(role) {
  if (role === "ADMIN") return "administrador.html";
  if (role === "LIBRARIAN") return "bibliotecario.html";
  return "leitor.html";
}

// =========================
// GLOBAL NAV
// =========================
function setupGlobalNavigation() {
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.go;
      if (target) window.location.href = target;
    });
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", logout);
  });
}

// =========================
// HELPERS
// =========================
function setSimpleStatus(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function setStatus(id, message, type = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `status ${type}`.trim();
}

function clearStatus(id) {
  setStatus(id, "");
}

function fillTable(tbodyId, rows, renderRow, emptyMessage, onClick) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = tbody.dataset.columns || 1;
    td.textContent = emptyMessage;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach((rowData) => {
    const tr = document.createElement("tr");
    tr.innerHTML = renderRow(rowData);

    if (onClick) {
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => onClick(rowData, tr));
    }

    tbody.appendChild(tr);
  });
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function validatePhone(value) {
  const len = onlyDigits(value).length;
  return len === 10 || len === 11;
}

function validateCnpj(value) {
  return onlyDigits(value).length === 14;
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// =========================
// LOGIN
// =========================
function setupLoginPage() {
  const session = getSession();
  if (session?.token && session?.role) {
    window.location.href = homeByRole(session.role);
    return;
  }

  const form = document.getElementById("login-form");
  const usernameField = document.getElementById("login");
  const passwordField = document.getElementById("senha");

  if (!form || !usernameField || !passwordField) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("login-status");

    const username = usernameField.value.trim();
    const password = passwordField.value.trim();

    if (!username || !password) {
      setStatus("login-status", "Informe login e senha.", "error");
      return;
    }

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password
        })
      });

      saveSession({
        token: data.token,
        id: data.id,
        username: data.username,
        role: data.role
      });

      window.location.href = homeByRole(data.role);
    } catch (error) {
      setStatus("login-status", error.message, "error");
    }
  });
}

// =========================
// CREATE USER
// =========================
function setupReaderForm() {
  const form = document.getElementById("leitor-form");
  if (!form) return;

  const phoneField = document.getElementById("telefone");
  if (phoneField) {
    phoneField.addEventListener("input", () => {
      phoneField.value = formatPhone(phoneField.value);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("leitor-status");

    const name = document.getElementById("nome")?.value.trim() || "";
    const username = document.getElementById("login")?.value.trim() || "";
    const password = document.getElementById("senha")?.value.trim() || "";
    const address = document.getElementById("endereco")?.value.trim() || "";
    const phone = document.getElementById("telefone")?.value.trim() || "";

    if (!name || !username || !password || !address || !phone) {
      setStatus("leitor-status", "Preencha todos os campos.", "error");
      return;
    }

    if (!validatePhone(phone)) {
      setStatus("leitor-status", "Telefone inválido.", "error");
      return;
    }

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          username,
          password,
          address,
          phone
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
// CREATE LIBRARIAN
// =========================
function setupLibrarianForm() {
  const form = document.getElementById("bibliotecario-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("bibliotecario-status");

    const name = document.getElementById("nome")?.value.trim() || "";
    const username = document.getElementById("login")?.value.trim() || "";
    const password = document.getElementById("senha")?.value.trim() || "";

    if (!name || !username || !password) {
      setStatus("bibliotecario-status", "Preencha todos os campos.", "error");
      return;
    }

    try {
      await apiFetch("/users/librarians", {
        method: "POST",
        body: JSON.stringify({
          name,
          username,
          password
        })
      });

      form.reset();
      setStatus("bibliotecario-status", "Bibliotecário cadastrado com sucesso.", "success");
    } catch (error) {
      setStatus("bibliotecario-status", error.message, "error");
    }
  });
}

// =========================
// SUPPLIERS
// =========================
function setupSupplierForm() {
  const form = document.getElementById("fornecedor-form");
  if (!form) return;

  const cnpjField = document.getElementById("cnpj");
  const phoneField = document.getElementById("telefone");

  if (cnpjField) {
    cnpjField.addEventListener("input", () => {
      cnpjField.value = formatCnpj(cnpjField.value);
    });
  }

  if (phoneField) {
    phoneField.addEventListener("input", () => {
      phoneField.value = formatPhone(phoneField.value);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("fornecedor-status");

    const name = document.getElementById("nome")?.value.trim() || "";
    const cnpj = document.getElementById("cnpj")?.value.trim() || "";
    const phone = document.getElementById("telefone")?.value.trim() || "";

    if (!name || !cnpj || !phone) {
      setStatus("fornecedor-status", "Preencha todos os campos.", "error");
      return;
    }

    if (!validateCnpj(cnpj)) {
      setStatus("fornecedor-status", "CNPJ inválido.", "error");
      return;
    }

    if (!validatePhone(phone)) {
      setStatus("fornecedor-status", "Telefone inválido.", "error");
      return;
    }

    try {
      await apiFetch("/suppliers", {
        method: "POST",
        body: JSON.stringify({ name, cnpj, phone })
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
  const chooseButton = document.getElementById("choose-supplier");

  if (!form || !chooseButton) return;

  let selectedSupplier = null;
  let selectedRow = null;

  async function loadSuppliers() {
    try {
      const suppliers = await apiFetch("/suppliers");

      fillTable(
        "update-suppliers-body",
        suppliers,
        (supplier) => `
          <td>${supplier.id}</td>
          <td>${supplier.name}</td>
          <td>${supplier.cnpj}</td>
          <td>${supplier.phone}</td>
        `,
        "Nenhum fornecedor encontrado.",
        (supplier, tr) => {
          if (selectedRow) selectedRow.classList.remove("is-selected");
          tr.classList.add("is-selected");
          selectedRow = tr;
          selectedSupplier = supplier;
          chooseButton.disabled = false;
        }
      );
    } catch (error) {
      setStatus("update-supplier-status", error.message, "error");
    }
  }

  chooseButton.addEventListener("click", () => {
    if (!selectedSupplier) return;

    document.getElementById("nome").value = selectedSupplier.name;
    document.getElementById("cnpj").value = selectedSupplier.cnpj;
    document.getElementById("telefone").value = selectedSupplier.phone;

    chooseButton.disabled = true;
    setStatus("update-supplier-status", "Fornecedor carregado.", "success");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("update-supplier-status");

    if (!selectedSupplier?.id) {
      setStatus("update-supplier-status", "Selecione um fornecedor.", "error");
      return;
    }

    const name = document.getElementById("nome")?.value.trim() || "";
    const cnpj = document.getElementById("cnpj")?.value.trim() || "";
    const phone = document.getElementById("telefone")?.value.trim() || "";

    try {
      await apiFetch(`/suppliers/${selectedSupplier.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, cnpj, phone })
      });

      form.reset();
      selectedSupplier = null;
      if (selectedRow) selectedRow.classList.remove("is-selected");
      selectedRow = null;
      chooseButton.disabled = true;

      await loadSuppliers();
      setStatus("update-supplier-status", "Fornecedor atualizado com sucesso.", "success");
    } catch (error) {
      setStatus("update-supplier-status", error.message, "error");
    }
  });

  loadSuppliers();
}

// =========================
// BOOKS
// =========================
function setupBookForm() {
  const form = document.getElementById("livro-form");
  const selectSupplierButton = document.getElementById("select-supplier-button");
  const supplierSummary = document.getElementById("selected-supplier-summary");

  if (!form || !selectSupplierButton || !supplierSummary) return;

  let selectedSupplier = null;
  let selectedRow = null;

  async function loadSuppliers() {
    try {
      const suppliers = await apiFetch("/suppliers");

      fillTable(
        "suppliers-table-body",
        suppliers,
        (supplier) => `
          <td>${supplier.id}</td>
          <td>${supplier.name}</td>
          <td>${supplier.cnpj}</td>
          <td>${supplier.phone}</td>
        `,
        "Nenhum fornecedor encontrado.",
        (supplier, tr) => {
          if (selectedRow) selectedRow.classList.remove("is-selected");
          tr.classList.add("is-selected");
          selectedRow = tr;
          selectedSupplier = supplier;
          selectSupplierButton.disabled = false;
        }
      );
    } catch (error) {
      setStatus("livro-status", error.message, "error");
    }
  }

  selectSupplierButton.addEventListener("click", () => {
    if (!selectedSupplier) return;
    supplierSummary.textContent = `Fornecedor selecionado: ${selectedSupplier.name}`;
    selectSupplierButton.disabled = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("livro-status");

    if (!selectedSupplier?.id) {
      setStatus("livro-status", "Selecione um fornecedor.", "error");
      return;
    }

    const title = document.getElementById("titulo")?.value.trim() || "";
    const author = document.getElementById("autor")?.value.trim() || "";
    const publisher = document.getElementById("editora")?.value.trim() || "";
    const publicationDate = document.getElementById("dataPublicacao")?.value || "";
    const genre = document.getElementById("genero")?.value.trim() || "";
    const quantity = Number(document.getElementById("quantidade")?.value);

    try {
      await apiFetch(`/books/supplier/${selectedSupplier.id}`, {
        method: "POST",
        body: JSON.stringify({
          title,
          author,
          publisher,
          publicationDate,
          genre,
          quantity
        })
      });

      form.reset();
      selectedSupplier = null;
      if (selectedRow) selectedRow.classList.remove("is-selected");
      selectedRow = null;
      supplierSummary.textContent = "Nenhum fornecedor selecionado";
      selectSupplierButton.disabled = true;

      await loadSuppliers();
      setStatus("livro-status", "Livro cadastrado com sucesso.", "success");
    } catch (error) {
      setStatus("livro-status", error.message, "error");
    }
  });

  loadSuppliers();
}

function setupUpdateBookPage() {
  const form = document.getElementById("update-book-form");
  const selector = document.getElementById("bookSelector");

  if (!form || !selector) return;

  let books = [];

  function loadSelectedBook(bookId) {
    const book = books.find((item) => String(item.id) === String(bookId));
    if (!book) return;

    document.getElementById("titulo").value = book.title || "";
    document.getElementById("autor").value = book.author || "";
    document.getElementById("editora").value = book.publisher || "";
    document.getElementById("dataPublicacao").value = String(book.publicationDate || "").split("T")[0];
    document.getElementById("genero").value = book.genre || "";
    document.getElementById("quantidade").value = book.quantity ?? 0;
  }

  async function loadBooks() {
    try {
      books = await apiFetch("/books");

      selector.innerHTML = books
        .map((book) => `<option value="${book.id}">${book.title}</option>`)
        .join("");

      if (books.length) {
        loadSelectedBook(books[0].id);
      }
    } catch (error) {
      setStatus("update-book-status", error.message, "error");
    }
  }

  selector.addEventListener("change", () => {
    loadSelectedBook(selector.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus("update-book-status");

    const bookId = selector.value;
    const title = document.getElementById("titulo")?.value.trim() || "";
    const author = document.getElementById("autor")?.value.trim() || "";
    const publisher = document.getElementById("editora")?.value.trim() || "";
    const publicationDate = document.getElementById("dataPublicacao")?.value || "";
    const genre = document.getElementById("genero")?.value.trim() || "";
    const quantity = Number(document.getElementById("quantidade")?.value);

    try {
      await apiFetch(`/books/${bookId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          author,
          publisher,
          publicationDate,
          genre,
          quantity
        })
      });

      await loadBooks();
      selector.value = bookId;
      loadSelectedBook(bookId);
      setStatus("update-book-status", "Livro atualizado com sucesso.", "success");
    } catch (error) {
      setStatus("update-book-status", error.message, "error");
    }
  });

  loadBooks();
}

// =========================
// CATALOG
// =========================
function setupCatalogPage() {
  const searchField = document.getElementById("catalog-search");
  const reserveButton = document.getElementById("reserve-button");

  if (!searchField || !reserveButton) return;

  let books = [];
  let selectedBook = null;
  let selectedRow = null;

  async function renderBooks() {
    try {
      books = await apiFetch("/books");
      const term = searchField.value.trim().toLowerCase();

      const filtered = books.filter((book) => {
        const text = `${book.title} ${book.author} ${book.publisher} ${book.genre}`.toLowerCase();
        return !term || text.includes(term);
      });

      fillTable(
        "catalog-body",
        filtered,
        (book) => `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.publisher}</td>
          <td>${book.genre}</td>
          <td>${book.quantity}</td>
        `,
        "Nenhum livro encontrado.",
        (book, tr) => {
          if (selectedRow) selectedRow.classList.remove("is-selected");
          tr.classList.add("is-selected");
          selectedRow = tr;
          selectedBook = book;
          reserveButton.disabled = false;
        }
      );
    } catch (error) {
      setStatus("catalog-status", error.message, "error");
    }
  }

  searchField.addEventListener("input", renderBooks);

  reserveButton.addEventListener("click", async () => {
    clearStatus("catalog-status");

    const user = getCurrentUser();

    if (!selectedBook?.id) {
      setStatus("catalog-status", "Selecione um livro.", "error");
      return;
    }

    try {
      await apiFetch("/loans", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          bookId: selectedBook.id
        })
      });

      selectedBook = null;
      if (selectedRow) selectedRow.classList.remove("is-selected");
      selectedRow = null;
      reserveButton.disabled = true;

      await renderBooks();
      setStatus("catalog-status", "Empréstimo realizado com sucesso.", "success");
    } catch (error) {
      setStatus("catalog-status", error.message, "error");
    }
  });

  renderBooks();
}

// =========================
// USER LOANS
// =========================
function setupReaderLoansPage() {
  const user = getCurrentUser();
  if (!user?.id) return;

  (async () => {
    try {
      const loans = await apiFetch(`/loans/${user.id}`);

      fillTable(
        "reader-loans-body",
        loans,
        (loan) => `
          <td>${loan.id}</td>
          <td>${loan.title}</td>
          <td>${loan.author}</td>
          <td>${loan.publisher}</td>
          <td>${loan.genre}</td>
          <td>${formatDate(loan.dueDate)}</td>
        `,
        "Você não possui empréstimos ativos."
      );
    } catch (error) {
      setStatus("reader-loans-status", error.message, "error");
    }
  })();
}

function setupReaderReturnPage() {
  const user = getCurrentUser();
  const returnButton = document.getElementById("return-book-button");
  if (!user?.id || !returnButton) return;

  let selectedLoan = null;
  let selectedRow = null;

  async function renderLoans() {
    try {
      const loans = await apiFetch(`/loans/${user.id}`);

      fillTable(
        "reader-returns-body",
        loans,
        (loan) => `
          <td>${loan.id}</td>
          <td>${loan.title}</td>
          <td>${loan.author}</td>
          <td>${loan.publisher}</td>
          <td>${loan.genre}</td>
        `,
        "Você não possui livros pendentes para devolução.",
        (loan, tr) => {
          if (selectedRow) selectedRow.classList.remove("is-selected");
          tr.classList.add("is-selected");
          selectedRow = tr;
          selectedLoan = loan;
          returnButton.disabled = false;
        }
      );
    } catch (error) {
      setStatus("return-book-status", error.message, "error");
    }
  }

  returnButton.addEventListener("click", async () => {
    clearStatus("return-book-status");

    if (!selectedLoan?.id) {
      setStatus("return-book-status", "Selecione um empréstimo.", "error");
      return;
    }

    try {
      await apiFetch(`/loans/${selectedLoan.id}/return-book`, {
        method: "POST"
      });

      selectedLoan = null;
      if (selectedRow) selectedRow.classList.remove("is-selected");
      selectedRow = null;
      returnButton.disabled = true;

      await renderLoans();
      setStatus("return-book-status", "Livro devolvido com sucesso.", "success");
    } catch (error) {
      setStatus("return-book-status", error.message, "error");
    }
  });

  renderLoans();
}