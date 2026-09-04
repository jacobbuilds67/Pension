import { DEFAULT_SETTINGS } from "./config.js";
import { startRouter } from "./router.js";
import { openDatabase } from "./storage/database.js";
import { entriesRepository, settingsRepository } from "./storage/repository.js";
import { createBackup, downloadBackup, mergeEntries, parseBackup } from "./backup/backup-service.js";
import { countdownScreen, dashboardScreen, escapeHtml, formatDate, historyScreen, settingsScreen } from "./ui/screens.js";

let entries = [];
let settings = { ...DEFAULT_SETTINGS };
let activeRoute = "dashboard";
let activePeriod = "all";
const main = document.querySelector("#main-content");
const dialog = document.querySelector("#editor-dialog");

function notify(message) {
  const root = document.querySelector("#toast-root");
  root.innerHTML = `<div class="toast" role="status">${escapeHtml(message)}</div>`;
  setTimeout(() => { root.innerHTML = ""; }, 2600);
}
function setActiveRoute(route) {
  document.querySelectorAll("[data-route]").forEach((link) => link.toggleAttribute("aria-current", link.dataset.route === route));
}
async function refresh() {
  entries = await entriesRepository.all();
  settings = await settingsRepository.get();
  document.documentElement.dataset.theme = settings.theme;
}
function render(route = activeRoute) {
  activeRoute = route;
  setActiveRoute(route);
  main.innerHTML = route === "history" ? historyScreen(entries, activePeriod) : route === "countdown" ? countdownScreen(settings) : route === "settings" ? settingsScreen(settings) : dashboardScreen(entries, settings, activePeriod);
  bindEvents();
  main.focus({ preventScroll: true });
}
function openEditor(existing) {
  const today = new Date().toISOString().slice(0, 10);
  dialog.innerHTML = `<form method="dialog" data-entry-form><div class="dialog-head"><div><p class="eyebrow">OPSPARING</p><h2>${existing?"Rediger registrering":"Ny registrering"}</h2></div><button type="button" class="close" data-close aria-label="Luk">×</button></div><label>Dato<input name="date" type="date" max="${today}" value="${existing?.date||today}" required></label><label>Samlet opsparing (kr.)<input name="balance" inputmode="decimal" value="${existing?.balance||""}" required></label><label>Indbetaling siden sidst <span>(valgfri)</span><input name="contribution" inputmode="decimal" value="${existing?.contribution??""}"></label><label>Note <span>(valgfri)</span><textarea name="note" maxlength="160">${escapeHtml(existing?.note||"")}</textarea></label><p class="error" data-error hidden></p><button class="primary wide" type="submit">Gem registrering</button></form>`;
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("form").onsubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget), date = form.get("date"), balance = Number(String(form.get("balance")).replaceAll(".","").replace(",",".")), contributionText=String(form.get("contribution")).trim(), contribution=contributionText?Number(contributionText.replaceAll(".","").replace(",",".")):undefined, error=dialog.querySelector("[data-error]");
    const fail=(message)=>{error.textContent=message;error.hidden=false;};
    if (!date || date > today) return fail("Datoen må ikke ligge i fremtiden.");
    if (!Number.isFinite(balance) || balance < 0) return fail("Indtast et gyldigt opsparingsbeløb.");
    if (contribution!==undefined && (!Number.isFinite(contribution)||contribution<0)) return fail("Indtast en gyldig indbetaling.");
    const duplicate=entries.find((item)=>item.date===date&&item.id!==existing?.id);
    if (duplicate && !confirm("Der findes allerede en registrering på datoen. Skal den erstattes?")) return;
    if (duplicate) await entriesRepository.delete(duplicate.id);
    await entriesRepository.put({ id: existing?.id||duplicate?.id||crypto.randomUUID(), date, balance, ...(contribution!==undefined?{contribution}:{}), ...(String(form.get("note")).trim()?{note:String(form.get("note")).trim()}:{}), createdAt: existing?.createdAt||new Date().toISOString() });
    dialog.close(); await refresh(); render(); notify("Registreringen er gemt.");
  };
  dialog.showModal();
}
function bindEvents() {
  main.querySelectorAll("[data-add]").forEach((button) => button.onclick = () => openEditor());
  main.querySelectorAll("[data-period]").forEach((button) => button.onclick = () => { activePeriod=button.dataset.period; render(); });
  main.querySelectorAll("[data-edit]").forEach((button) => button.onclick = () => openEditor(entries.find((entry) => entry.id === button.dataset.edit)));
  main.querySelectorAll("[data-delete]").forEach((button) => button.onclick = async () => { const entry=entries.find((item)=>item.id===button.dataset.delete); if (entry&&confirm(`Vil du slette registreringen fra ${formatDate(entry.date)}?`)) { await entriesRepository.delete(entry.id); await refresh(); render(); notify("Registreringen er slettet."); } });
  main.querySelectorAll("[data-setting]").forEach((input) => input.onchange = async () => { let value=input.value; if (["growthRate","retirementAge"].includes(input.dataset.setting)) value=Number(value); settings={...settings,[input.dataset.setting]:value}; await settingsRepository.put(settings); render(); notify("Indstillingen er gemt."); });
  const exportButton=main.querySelector("[data-export]"); if(exportButton) exportButton.onclick=()=>downloadBackup(createBackup(entries,settings));
  const importButton=main.querySelector("[data-import]"), fileInput=main.querySelector("[data-file]");
  if(importButton) importButton.onclick=()=>fileInput.click();
  if(fileInput) fileInput.onchange=async()=>{ const file=fileInput.files[0]; if(!file)return; try { const backup=parseBackup(await file.text()), merge=main.querySelector("[data-merge]").checked; if(!merge&&!confirm("Importen erstatter alle nuværende registreringer. Fortsæt?"))return; const next=merge?mergeEntries(entries,backup.entries):backup.entries; await entriesRepository.replace(next); await settingsRepository.put({...settings,...backup.settings}); await refresh(); render(); notify(`${next.length} registreringer er importeret.`); } catch(error){ alert(error.message); } };
  const clear=main.querySelector("[data-clear]"); if(clear) clear.onclick=async()=>{if(confirm("Vil du slette alle registreringer? Handlingen kan ikke fortrydes.")){await entriesRepository.clear();await refresh();render();notify("Alle registreringer er slettet.");}};
}
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registration=await navigator.serviceWorker.register("./service-worker.js",{scope:"./"});
  const show=(worker)=>{const banner=document.querySelector("#update-banner");banner.hidden=false;banner.querySelector("button").onclick=()=>worker.postMessage({type:"SKIP_WAITING"});};
  if(registration.waiting)show(registration.waiting);
  registration.addEventListener("updatefound",()=>registration.installing?.addEventListener("statechange",()=>{if(registration.installing?.state==="installed"&&navigator.serviceWorker.controller)show(registration.installing);}));
  navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload());
}
async function start() {
  try { await openDatabase(); await refresh(); document.querySelector("#storage-status").textContent="Gemt lokalt"; startRouter(render); registerServiceWorker().catch(()=>{}); }
  catch(error){ console.error(error); document.querySelector("#storage-status").textContent="Lagringsfejl"; main.innerHTML=`<div class="card empty-copy">Appen kunne ikke åbne den lokale lagring. Genstart browseren og prøv igen.</div>`; }
}
start();
