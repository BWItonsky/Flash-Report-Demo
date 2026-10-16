import "./add-contact.js";

(() => {
  const table = document.getElementById("triggers-table");
  const body = table.tBodies[0];
  const rows = [...body.rows];
  const controls = {
    period: document.getElementById("trigger-period"),
    account: document.getElementById("trigger-account"),
    kind: document.getElementById("trigger-kind"),
    q: document.getElementById("trigger-search"),
  };
  const count = document.getElementById("trigger-count");
  const empty = document.getElementById("trigger-empty");
  const periodKeys = table.dataset.recent.split(" ");
  const defaultPeriod = `recent-${table.dataset.defaultRecent}`;
  const sortState = { by: "date", dir: "descending" };

  const periodsFor = (value) => {
    if (value === "all") return null;
    const recent = value.match(/^recent-(\d+)$/);
    return recent ? periodKeys.slice(0, Number(recent[1])) : [value];
  };

  const sortValue = (row, by) => {
    if (by === "kind") return row.dataset.kind;
    if (by === "account") return row.querySelector(".account-pill")?.textContent.toLowerCase() || "";
    return row.dataset.sortDate;
  };

  const applySort = () => {
    const factor = sortState.dir === "ascending" ? 1 : -1;
    rows.sort((a, b) => factor * sortValue(a, sortState.by).localeCompare(sortValue(b, sortState.by)));
    body.append(...rows);
    table.querySelectorAll("th").forEach((th) => th.removeAttribute("aria-sort"));
    table.querySelector(`[data-sort="${sortState.by}"]`)?.closest("th").setAttribute("aria-sort", sortState.dir);
  };

  const apply = () => {
    const periods = periodsFor(controls.period.value);
    const term = controls.q.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach((row) => {
      const visible =
        (!periods || row.dataset.periods.split(" ").some((key) => periods.includes(key))) &&
        (!controls.account.value || row.dataset.accounts.split(" ").includes(controls.account.value)) &&
        (!controls.kind.value || row.dataset.kind === controls.kind.value) &&
        (!term || row.dataset.search.includes(term));
      row.hidden = !visible;
      if (visible) shown += 1;
    });
    count.textContent = `Showing ${shown} of ${rows.length} triggers`;
    empty.hidden = shown > 0;
    table.hidden = shown === 0;

    const params = new URLSearchParams();
    if (controls.period.value !== defaultPeriod) params.set("period", controls.period.value);
    if (controls.account.value) params.set("account", controls.account.value);
    if (controls.kind.value) params.set("kind", controls.kind.value);
    if (term) params.set("q", controls.q.value.trim());
    const query = params.toString();
    history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  const setSelect = (select, value) => {
    if (value && [...select.options].some((option) => option.value === value)) select.value = value;
  };

  const params = new URLSearchParams(window.location.search);
  setSelect(controls.period, params.get("period"));
  setSelect(controls.account, params.get("account"));
  setSelect(controls.kind, params.get("kind"));
  controls.q.value = params.get("q") || "";

  Object.values(controls).forEach((control) => control.addEventListener("input", apply));
  document.getElementById("trigger-reset").addEventListener("click", () => {
    controls.period.value = defaultPeriod;
    controls.account.value = "";
    controls.kind.value = "";
    controls.q.value = "";
    apply();
  });
  table.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
    const by = button.dataset.sort;
    sortState.dir = sortState.by === by
      ? (sortState.dir === "ascending" ? "descending" : "ascending")
      : (by === "date" ? "descending" : "ascending");
    sortState.by = by;
    applySort();
  }));

  applySort();
  apply();
})();
