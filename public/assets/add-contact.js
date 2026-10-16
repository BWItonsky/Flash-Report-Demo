// Keep only one "Add Contact to Account" menu open at a time; close on outside click or Escape.
const menus = () => [...document.querySelectorAll("details.add-contact[open]")];

document.addEventListener("click", (event) => {
  menus().forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute("open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  menus().forEach((menu) => {
    menu.removeAttribute("open");
    menu.querySelector("summary")?.focus();
  });
});
