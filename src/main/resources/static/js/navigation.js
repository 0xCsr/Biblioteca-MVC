function goTo(pageName) {
  window.location.href = pageName;
}

function getHomePageByRole(role) {
  if (role === "admin") {
    return "administrador.html";
  }

  if (role === "bibliotecario") {
    return "bibliotecario.html";
  }

  return "leitor.html";
}

function wireNavigation() {
  const navigationButtons = document.querySelectorAll("[data-go]");
  const logoutButtons = document.querySelectorAll("[data-logout]");

  navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetPage = button.getAttribute("data-go");

      if (targetPage) {
        goTo(targetPage);
      }
    });
  });

  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearCurrentUser();
      goTo("index.html");
    });
  });
}

function protectPage(allowedRoles) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    goTo("index.html");
    return false;
  }

  const acceptedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (acceptedRoles.includes(currentUser.role)) {
    return true;
  }

  goTo(getHomePageByRole(currentUser.role));
  return false;
}
