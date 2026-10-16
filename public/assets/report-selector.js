// Reporting-period selector and Triggers Log link for Flash Report pages.
const selector = document.getElementById("report-selector");
const archiveMatch = window.location.pathname.match(/\/flash-report\/archive\/([^/]+)\//);
const currentPath = window.location.pathname.replace(/index\.html$/, "");

selector.addEventListener("change", (event) => {
  const target = event.target.value;
  if (target && target !== currentPath) window.location.href = target;
});

// Archive pages are frozen when they are built, so their static period list goes stale.
// The manifest always lists every period, so rebuild the selector from it.
const hydrateSelector = async () => {
  try {
    const response = await fetch("/data/flash_reports.json", { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) return;
    const reports = (await response.json()).reports;
    if (!Array.isArray(reports) || !reports.length) return;
    const currentKey = archiveMatch ? archiveMatch[1] : reports[0].key;
    selector.replaceChildren(...reports.map((report, index) => {
      const option = document.createElement("option");
      option.value = report.url;
      option.textContent = index === 0 ? `${report.label} (latest)` : report.label;
      option.selected = report.key === currentKey;
      return option;
    }));
  } catch (error) {
    // Keep the static options if the manifest cannot be loaded.
  }
};
hydrateSelector();
window.addEventListener("pageshow", (event) => {
  if (event.persisted) hydrateSelector();
});

// Older archive pages predate the Triggers Log, so add the link when it is missing.
const history = document.querySelector(".report-history");
if (history && !history.querySelector('a[href="/flash-report/triggers/"]')) {
  const link = document.createElement("a");
  link.className = "triggers-link";
  link.href = "/flash-report/triggers/";
  link.textContent = "Triggers log: every trigger across periods";
  history.append(link);
}
