(function () {
  const S = window.SHOP;
  const $ = (s, r = document) => r.querySelector(s);
  const eur = n => new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);
  const page = document.body.dataset.page || "home";

  /* ---------- Header ---------- */
  function megaPanel(id) {
    const cols = S.mega[id] || [];
    return `<div class="mega" data-panel="${id}" hidden>
      <div class="mega-inner">
        ${cols.map(c => `<div class="mega-col">${c[0] ? `<h4>${c[0]}</h4>` : ""}<ul>${c[1].map(l => `<li><a href="#">${l}</a></li>`).join("")}</ul></div>`).join("")}
        <div class="mega-img ph" style="--tone:#d8c6c0"></div>
      </div></div>`;
  }
  const header = `
  <div class="announce"><button class="ann-arrow" aria-label="Назад">‹</button><button class="ann-arrow" aria-label="Напред">›</button>
    <p>${S.announce.text} &nbsp;|&nbsp; <a href="${S.announce.href}">${S.announce.link}</a></p>
    <button class="ann-close" aria-label="Затвори">×</button></div>
  <header class="site-header ${page === "home" ? "is-over" : "is-solid"}" id="header">
    <div class="hdr-row">
      <a class="logo" href="index.html"><span class="logo-main">${S.brand}</span><span class="logo-sub">${S.tagline}</span></a>
      <nav class="main-nav" aria-label="Главно меню">
        ${S.nav.map(n => `<a href="${n.href}" data-menu="${n.id}" class="${page === n.id ? "active" : ""}">${n.label}</a>`).join("")}
      </nav>
      <div class="hdr-icons">
        <button aria-label="Търсене">${ico("search")}</button>
        <button aria-label="Контакти">${ico("phone")}</button>
        <button aria-label="Любими">${ico("heart")}</button>
        <button aria-label="Количка" id="cartBtn">${ico("bag")}<span class="cart-count" id="cartCount"></span></button>
      </div>
    </div>
    <div class="mega-wrap">${S.nav.map(n => megaPanel(n.id)).join("")}</div>
  </header>`;

  /* ---------- Footer ---------- */
  const footer = `
  <footer class="site-footer">
    <div class="foot-top"><a href="#" class="to-top" id="toTop">Към началото ↑</a></div>
    <div class="foot-news"><label for="nl">Абонирай се за бюлетина</label>
      <input id="nl" type="email" placeholder="Имейл">
      <div class="country"><span>Държава</span><small>България / Български</small></div></div>
    <div class="foot-cols">
      ${S.footer.map(c => `<div><h5>${c[0]}</h5><ul>${c[1].map(l => `<li><a href="#">${l}</a></li>`).join("")}</ul></div>`).join("")}
      <div><h5>Последвай ни</h5><div class="socials"><a href="#">IG</a><a href="#">FB</a><a href="#">TT</a><a href="#">X</a></div>
      <h5 style="margin-top:28px">Изтегли приложението</h5></div>
    </div>
    <div class="foot-bottom">Powered by Hackera Online &nbsp; © 2026 ${S.brand}. Всички права запазени.</div>
  </footer>
  <aside class="cart-drawer" id="drawer" aria-hidden="true">
    <div class="cd-head"><h3>Количка</h3><button id="cdClose" aria-label="Затвори">×</button></div>
    <div class="cd-items" id="cdItems"></div>
    <div class="cd-foot"><div class="cd-total"><span>Общо</span><strong id="cdTotal">0 €</strong></div><button class="btn btn-dark">Към поръчката</button></div>
  </aside><div class="scrim" id="scrim"></div>`;

  function ico(n) {
    const p = {
      search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
      phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>',
      heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
      bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>'
    };
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3">${p[n]}</svg>`;
  }

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  /* ---------- Mega menu ---------- */
  const hdr = $("#header");
  let closeT;
  document.querySelectorAll(".main-nav a").forEach(a => {
    a.addEventListener("mouseenter", () => { clearTimeout(closeT); openMega(a.dataset.menu, a); });
  });
  hdr.addEventListener("mouseleave", () => { closeT = setTimeout(closeMega, 120); });
  function openMega(id, link) {
    document.querySelectorAll(".mega").forEach(m => (m.hidden = m.dataset.panel !== id));
    document.querySelectorAll(".main-nav a").forEach(x => x.classList.toggle("hover", x === link));
    hdr.classList.add("mega-open");
  }
  function closeMega() {
    document.querySelectorAll(".mega").forEach(m => (m.hidden = true));
    document.querySelectorAll(".main-nav a").forEach(x => x.classList.remove("hover"));
    hdr.classList.remove("mega-open");
  }
  addEventListener("scroll", () => hdr.classList.toggle("scrolled", scrollY > 40), { passive: true });
  $(".ann-close").onclick = () => $(".announce").remove();
  $("#toTop").onclick = e => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); };

  /* ---------- Cart (localStorage) ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem("cart")) || []; } catch (e) { return []; } };
  const save = c => { try { localStorage.setItem("cart", JSON.stringify(c)); } catch (e) {} };
  let cart = load();
  function renderCart() {
    const n = cart.reduce((a, i) => a + i.qty, 0);
    $("#cartCount").textContent = n || "";
    $("#cdItems").innerHTML = cart.length ? cart.map(i => `
      <div class="cd-item"><div class="ph" style="--tone:${i.tone}"></div>
      <div><p>${i.name}</p><small>${eur(i.price)} × ${i.qty}</small></div>
      <button data-rm="${i.id}" aria-label="Премахни">×</button></div>`).join("") : "<p class='empty'>Количката е празна. Добави продукт от каталога.</p>";
    $("#cdTotal").textContent = eur(cart.reduce((a, i) => a + i.price * i.qty, 0));
  }
  window.addToCart = id => {
    const p = S.products.find(x => x.id === id); if (!p) return;
    const ex = cart.find(i => i.id === id);
    ex ? ex.qty++ : cart.push({ ...p, qty: 1 });
    save(cart); renderCart(); toggleDrawer(true);
  };
  function toggleDrawer(open) {
    $("#drawer").classList.toggle("open", open); $("#scrim").classList.toggle("open", open);
    $("#drawer").setAttribute("aria-hidden", String(!open));
  }
  $("#cartBtn").onclick = () => toggleDrawer(true);
  $("#cdClose").onclick = $("#scrim").onclick = () => toggleDrawer(false);
  $("#cdItems").addEventListener("click", e => {
    const id = e.target.dataset.rm; if (!id) return;
    cart = cart.filter(i => i.id !== +id); save(cart); renderCart();
  });
  renderCart();

  /* ---------- Home ---------- */
  const hl = $("#highlights");
  if (hl) {
    const draw = k => (hl.querySelector(".hl-grid").innerHTML = S.highlights[k].map(h => `<a href="bags.html" class="hl-tile ph" style="--tone:${h[1]}"><span>${h[0]}</span></a>`).join(""));
    draw("women");
    hl.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => {
      hl.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("on", x === b)); draw(b.dataset.tab);
    });
  }
  const col = $("#collection");
  if (col) col.innerHTML = `<div class="col-hero ph" style="--tone:#d6cfc6"></div>` + S.collection.map(c => `
    <a href="bags.html" class="col-card"><small>${c.tag}</small><div class="ph" style="--tone:${c.tone}"></div>
    <p><span>${c.name}</span><span>${eur(c.price)}</span></p></a>`).join("");

  const pause = $("#heroPause");
  if (pause) pause.onclick = () => pause.classList.toggle("paused");

  /* ---------- Category page ---------- */
  const grid = $("#productGrid");
  if (grid) {
    const side = $("#sideNav");
    let active = "Виж всички";
    side.innerHTML = `<h2>Чанти</h2><ul>${S.bagCategories.map(c => `<li><button data-c="${c}" class="${c === active ? "on" : ""}">${c}</button></li>`).join("")}</ul>`;
    const drawGrid = () => {
      const list = S.products.filter(p => active === "Виж всички" || p.cat === active);
      grid.innerHTML = list.map(p => `
        <article class="p-card"><a href="#" class="p-img ph" style="--tone:${p.tone}" aria-label="${p.name}"></a>
        <div class="p-meta"><h3>${p.name}</h3><span>${eur(p.price)}</span></div>
        <button class="p-add" onclick="addToCart(${p.id})">Добави в количката</button></article>`).join("") || "<p class='empty'>Няма продукти в тази категория.</p>";
    };
    side.addEventListener("click", e => {
      const c = e.target.dataset.c; if (!c) return; active = c;
      side.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.c === c)); drawGrid();
    });
    drawGrid();
  }
})();
