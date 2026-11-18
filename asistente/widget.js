/*! Asistente con IA de Puerto Media — widget de chat.
 * Uso en cualquier web:
 *   <script src="https://puertomedia.net/asistente/widget.js" data-bot="slug-del-negocio" defer></script>
 * No lleva claves: habla con el servidor del asistente, que es quien consulta a la IA.
 */
(function () {
  "use strict";
  if (window.PuertoAsistente) return;
  var tag = document.currentScript || document.querySelector("script[data-bot]");
  if (!tag) return;
  var BOT = tag.getAttribute("data-bot") || "";
  var API = tag.getAttribute("data-api") || "https://bondieoukgguaidqkaih.supabase.co/functions/v1/asistente";
  if (!BOT) return;

  var KEY = "pm-asistente-" + BOT;
  var estado = { conv: "", mensajes: [], abierto: false, ocupado: false };
  try {
    var g = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (g && g.conv && Array.isArray(g.mensajes)) { estado.conv = g.conv; estado.mensajes = g.mensajes; }
  } catch (e) {}
  if (!estado.conv) {
    var a = new Uint8Array(12);
    (window.crypto || window.msCrypto).getRandomValues(a);
    estado.conv = Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }
  function guardar() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ conv: estado.conv, mensajes: estado.mensajes.slice(-30) })); } catch (e) {}
  }

  var CSS =
    ":host{all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:var(--font-barlow,'Barlow Semi Condensed'),'Arial Narrow',system-ui,sans-serif;font-size:16px;line-height:1.4;color:#f4f1ea;" +
    "--oro:#ae9251;--oro-hi:#c9ae6e;--tinta:#010101;--grafito:#141414;--acero:#2a2a2a;--linea:#34322d;--ceniza:#a39e92;--titulo:var(--font-puerto,'Arial Narrow'),Impact,sans-serif}" +
    "*{box-sizing:border-box}button,input{font:inherit;color:inherit}" +
    ":focus-visible{outline:2px solid var(--oro-hi);outline-offset:2px}" +
    ".abrir{display:flex;align-items:center;gap:10px;border:0;cursor:pointer;background:var(--oro);color:var(--tinta);padding:14px 18px;font-weight:600;font-size:15px;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 8px 30px rgba(0,0,0,.55);clip-path:polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%);transition:background .2s}" +
    ".abrir:hover{background:var(--oro-hi)}.abrir svg{width:20px;height:20px;flex:none}" +
    ".panel{display:none;flex-direction:column;width:380px;max-width:calc(100vw - 24px);height:min(600px,calc(100vh - 40px));height:min(600px,calc(100dvh - 40px));background:var(--grafito);border:1px solid var(--linea);box-shadow:0 20px 60px rgba(0,0,0,.7)}" +
    ":host([abierto]) .panel{display:flex}:host([abierto]) .abrir{display:none}" +
    ".cab{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--linea);background:var(--tinta)}" +
    ".avatar{width:38px;height:38px;border-radius:50%;background:var(--oro);color:var(--tinta);display:grid;place-items:center;font-weight:600;font-size:14px;flex:none}" +
    ".nombre{flex:1;min-width:0}.nombre strong{display:block;font-weight:600;font-size:16px;overflow-wrap:anywhere}" +
    ".nombre span{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ceniza)}" +
    ".nombre span:before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--oro);margin-right:6px;vertical-align:1px}" +
    ".cerrar{background:none;border:0;cursor:pointer;width:36px;height:36px;font-size:24px;line-height:1;color:var(--ceniza)}.cerrar:hover{color:#fff}" +
    ".msgs{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px;display:flex;flex-direction:column;gap:10px}" +
    ".m{max-width:84%;padding:9px 12px;font-size:15px;white-space:pre-wrap;overflow-wrap:anywhere}" +
    ".m.c{align-self:flex-end;background:var(--acero)}" +
    ".m.a{align-self:flex-start;background:var(--oro);color:var(--tinta);font-weight:500}" +
    ".m.e{align-self:center;text-align:center;background:none;border:1px dashed var(--linea);color:var(--ceniza);font-size:13px;max-width:94%}" +
    ".puntos{display:inline-flex;gap:4px;padding:3px 2px}.puntos i{width:6px;height:6px;border-radius:50%;background:currentColor;animation:p 1s infinite}" +
    ".puntos i:nth-child(2){animation-delay:.15s}.puntos i:nth-child(3){animation-delay:.3s}@keyframes p{0%,60%,100%{opacity:.3}30%{opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.puntos i{animation:none}}" +
    ".tarjeta{align-self:flex-start;max-width:84%;border:1px solid var(--oro);background:var(--tinta)}" +
    ".tarjeta .k{background:var(--oro);color:var(--tinta);font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px}" +
    ".tarjeta .t{font-family:var(--titulo);font-weight:900;text-transform:uppercase;font-size:18px;letter-spacing:.04em;padding:8px 10px 2px;overflow-wrap:anywhere}" +
    ".tarjeta .d{color:var(--oro-hi);font-size:13px;font-weight:500;padding:0 10px 9px;overflow-wrap:anywhere}" +
    ".sug{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}.sug button{background:var(--tinta);border:1px solid var(--linea);padding:6px 10px;font-size:13px;cursor:pointer;text-align:left}.sug button:hover{border-color:var(--oro)}" +
    ".escribir{display:flex;gap:8px;padding:10px 14px;border-top:1px solid var(--linea)}" +
    ".escribir input{flex:1;min-width:0;background:var(--tinta);border:1px solid var(--linea);border-radius:20px;padding:9px 14px;font-size:16px}.escribir input:focus{border-color:var(--oro);outline:none}" +
    ".enviar{width:40px;height:40px;border-radius:50%;border:0;background:var(--oro);color:var(--tinta);font-size:19px;font-weight:600;cursor:pointer;flex:none}.enviar:disabled{opacity:.45;cursor:default}" +
    ".pie{padding:0 14px 10px;font-size:11px;color:var(--ceniza);text-align:center}.pie a{color:var(--oro-hi)}" +
    "@media (max-width:480px){:host{right:12px;bottom:12px}:host([abierto]){right:0;bottom:0;left:0;top:0}.panel{width:100vw;max-width:none;height:100vh;height:100dvh;border:0}}";

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  function montar(cfg) {
    var host = document.createElement("div");
    host.setAttribute("data-lenis-prevent", "");
    var root = host.attachShadow({ mode: "open" });
    if (cfg.acento && /^#[0-9a-fA-F]{3,8}$/.test(cfg.acento)) host.style.setProperty("--oro", cfg.acento);
    root.appendChild(el("style", "", CSS));

    var abrir = el("button", "abrir");
    abrir.type = "button";
    abrir.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" stroke-linejoin="round"/></svg>';
    abrir.appendChild(el("span", "", "Asistente IA"));
    abrir.setAttribute("aria-label", "Abrir el asistente con IA de " + cfg.negocio);

    var panel = el("section", "panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Asistente con IA de " + cfg.negocio);
    var cab = el("div", "cab");
    var pal = (cfg.negocio || "IA").trim().split(/\s+/);
    cab.appendChild(el("div", "avatar", ((pal[0] || "A")[0] + (pal[1] || "I")[0]).toUpperCase()));
    var nom = el("div", "nombre");
    nom.appendChild(el("strong", "", cfg.negocio + (cfg.canal ? " · " + cfg.canal : "")));
    nom.appendChild(el("span", "", "Asistente con IA · activo"));
    cab.appendChild(nom);
    var cerrar = el("button", "cerrar", "×"); cerrar.type = "button"; cerrar.setAttribute("aria-label", "Cerrar el chat");
    cab.appendChild(cerrar);

    var msgs = el("div", "msgs"); msgs.setAttribute("aria-live", "polite");
    var sug = el("div", "sug");
    var form = el("form", "escribir");
    var input = el("input"); input.type = "text"; input.maxLength = 600; input.placeholder = "Escribe tu mensaje"; input.setAttribute("aria-label", "Tu mensaje");
    var enviar = el("button", "enviar", "→"); enviar.setAttribute("aria-label", "Enviar");
    form.appendChild(input); form.appendChild(enviar);
    var pie = el("div", "pie");
    pie.appendChild(document.createTextNode("Respuestas generadas por IA · "));
    var link = el("a", "", "Puerto Media"); link.href = "https://puertomedia.net"; link.target = "_blank"; link.rel = "noopener";
    pie.appendChild(link);

    panel.appendChild(cab); panel.appendChild(msgs); panel.appendChild(sug); panel.appendChild(form); panel.appendChild(pie);
    root.appendChild(abrir); root.appendChild(panel);
    document.body.appendChild(host);

    function bajar() { msgs.scrollTop = msgs.scrollHeight; }
    function burbuja(clase, texto) { var b = el("div", "m " + clase, texto); msgs.appendChild(b); bajar(); return b; }
    function tarjeta(r) {
      var t = el("div", "tarjeta");
      t.appendChild(el("div", "k", r.tipo)); t.appendChild(el("div", "t", r.titulo));
      if (r.detalle) t.appendChild(el("div", "d", r.detalle));
      msgs.appendChild(t); bajar();
    }
    function sugerencias() {
      sug.textContent = "";
      if (estado.mensajes.length) return;
      (cfg.sugerencias || []).forEach(function (s) {
        var b = el("button", "", s); b.type = "button";
        b.onclick = function () { mandar(s); };
        sug.appendChild(b);
      });
    }

    if (cfg.bienvenida) burbuja("a", cfg.bienvenida);
    estado.mensajes.forEach(function (m) {
      burbuja(m.role === "user" ? "c" : "a", m.content);
      if (m.registro) tarjeta(m.registro);
    });
    sugerencias();

    function mandar(texto) {
      texto = (texto || "").trim();
      if (!texto || estado.ocupado) return;
      estado.ocupado = true; enviar.disabled = true; input.value = ""; sug.textContent = "";
      burbuja("c", texto);
      estado.mensajes.push({ role: "user", content: texto });
      var espera = el("div", "m a"); var p = el("span", "puntos"); p.appendChild(el("i")); p.appendChild(el("i")); p.appendChild(el("i"));
      espera.appendChild(p); msgs.appendChild(espera); bajar();
      var zona = ""; try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot: BOT, conv: estado.conv, zona: zona, pagina: location.href.slice(0, 300),
          mensajes: estado.mensajes.slice(-12).map(function (m) { return { role: m.role, content: m.content }; })
        })
      }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          espera.remove();
          if (!res.ok || !res.d.respuesta) {
            estado.mensajes.pop();
            burbuja("e", res.d.mensaje || "No se pudo obtener respuesta. Vuelve a enviar tu mensaje.");
            if (res.d.error !== "limite") input.value = texto;
            return;
          }
          burbuja("a", res.d.respuesta);
          var m = { role: "assistant", content: res.d.respuesta };
          if (res.d.registro) {
            m.registro = res.d.registro; tarjeta(res.d.registro);
            try { if (window.gtag) window.gtag("event", "generate_lead", { method: "asistente" }); if (window.fbq) window.fbq("track", "Lead", { content_name: "asistente" }); } catch (e) {}
          }
          estado.mensajes.push(m);
        })
        .catch(function () {
          espera.remove(); estado.mensajes.pop(); input.value = texto;
          burbuja("e", "Sin conexión. Revisa tu internet y vuelve a enviar.");
        })
        .then(function () { estado.ocupado = false; enviar.disabled = false; guardar(); });
    }

    function abrirPanel() { host.setAttribute("abierto", ""); estado.abierto = true; bajar(); setTimeout(function () { input.focus(); }, 50); }
    function cerrarPanel() { host.removeAttribute("abierto"); estado.abierto = false; abrir.focus(); }
    abrir.onclick = abrirPanel; cerrar.onclick = cerrarPanel;
    form.addEventListener("submit", function (e) { e.preventDefault(); mandar(input.value); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarPanel(); });

    window.PuertoAsistente = { abrir: abrirPanel, cerrar: cerrarPanel };
  }

  function iniciar() {
    fetch(API + "?bot=" + encodeURIComponent(BOT))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) { if (cfg && cfg.disponible) montar(cfg); })
      .catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
