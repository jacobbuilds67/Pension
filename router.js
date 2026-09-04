export function currentRoute() {
  const route = location.hash.replace(/^#\//, "").split("/")[0];
  return ["dashboard", "history", "countdown", "settings"].includes(route) ? route : "dashboard";
}
export function startRouter(render) {
  const run = () => render(currentRoute());
  window.addEventListener("hashchange", run);
  if (!location.hash) history.replaceState(null, "", "#/dashboard");
  run();
}
