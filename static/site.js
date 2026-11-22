const header = document.querySelector(".site-header");
const navigation = document.querySelector(".nav-wrap nav");
const article = document.querySelector("main.article");
const sections = { talk: { href: "/talk/", label: "Febri TALK" }, topics: { href: "/topics/", label: "TOPICS" } };

// 文章頁由外部腳本產生，在這裡統一成與列表頁相同的 header / 麵包屑 / footer。
if (article) {
  const key = location.pathname.split("/")[2];
  const section = sections[key];
  const brand = header.querySelector(".brand");
  brand.textContent = "Febri Archive";
  navigation.setAttribute("aria-label", "カテゴリ");
  navigation.replaceChildren(...Object.entries(sections).map(([name, item]) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    if (name === key) link.className = "active";
    return link;
  }));
  const crumb = article.querySelector(".breadcrumb");
  if (crumb && section) {
    const shareTitle = article.querySelector("[data-a2a-title]")?.dataset.a2aTitle;
    const title = (shareTitle || document.title.split(" | ")[0]).trim();
    crumb.innerHTML = '<a href="/">TOP</a><span class="sep">&gt;</span><a></a><span class="sep">&gt;</span><span></span>';
    const [, sectionLink] = crumb.querySelectorAll("a");
    sectionLink.href = section.href;
    sectionLink.textContent = section.label;
    crumb.lastElementChild.textContent = title;
  }
  // 原站標籤頁已關閉，改成在本站分類列表中搜尋該標籤。
  if (section) {
    for (const tag of article.querySelectorAll(".list-tag a, .list_tag a")) {
      tag.href = section.href + "?q=" + encodeURIComponent(tag.textContent.trim());
      tag.removeAttribute("target");
    }
  }
  const oldFooter = document.querySelector("body > footer:not(.site-footer)");
  if (oldFooter) {
    oldFooter.outerHTML = '<footer class="site-footer"><div><div><ul><li><a href="/talk/">Febri TALK</a></li><li><a href="/topics/">TOPICS</a></li></ul><small>Febri Archive</small></div><a class="footer-logo" href="/">Febri Archive</a></div></footer>';
  }
}

// 手機版選單
const menuButton = document.createElement("button");
menuButton.type = "button";
menuButton.className = "menu-toggle";
menuButton.textContent = "☰　MENU";
navigation.id = "category-menu";
menuButton.setAttribute("aria-controls", navigation.id);
const mobileLayout = matchMedia("(max-width: 767px)");
const home = document.querySelector(".home");
function resetMenu() {
  const expanded = !mobileLayout.matches || Boolean(home);
  menuButton.setAttribute("aria-expanded", String(expanded));
  navigation.hidden = !expanded;
}
menuButton.addEventListener("click", () => {
  navigation.hidden = !navigation.hidden;
  menuButton.setAttribute("aria-expanded", String(!navigation.hidden));
});
navigation.before(menuButton);
mobileLayout.addEventListener("change", resetMenu);
resetMenu();

// 首頁：捲過封面後才顯示固定 header（同原站）
if (home) {
  const cover = home.querySelector(".cover");
  const update = () => header.classList.toggle("is-stuck", scrollY > cover.offsetHeight - 65);
  addEventListener("scroll", update, { passive: true });
  update();

  const rail = home.querySelector(".rail");
  const prev = home.querySelector(".rail-prev");
  const next = home.querySelector(".rail-next");
  if (rail && prev && next) {
    const step = () => (rail.firstElementChild?.offsetWidth || 320) + 40;
    const sync = () => {
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
    };
    prev.addEventListener("click", () => rail.scrollBy({ left: -step() }));
    next.addEventListener("click", () => rail.scrollBy({ left: step() }));
    rail.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    prev.hidden = next.hidden = false;
    sync();
  }
}

// 列表頁：搜尋 + 分頁（每頁 9 筆，同原站）
const listing = document.querySelector(".listing");
if (listing) {
  const PAGE_SIZE = 9;
  const filter = document.createElement("div");
  filter.className = "archive-filter";
  filter.innerHTML = '<input id="archive-search" type="search" placeholder="記事検索" aria-label="このカテゴリの記事を検索"><span id="result-count" role="status"></span>';
  document.querySelector(".nav-wrap").append(filter);
  const input = filter.querySelector("input");
  const status = filter.querySelector("[role=status]");
  const cards = [...listing.querySelectorAll(".card")];
  const empty = listing.querySelector(".empty");
  const pager = listing.querySelector(".pagination");
  const grid = listing.querySelector(".card-grid");

  function readState() {
    const params = new URLSearchParams(location.search);
    return { query: params.get("q") || "", page: Math.max(1, parseInt(params.get("page"), 10) || 1) };
  }
  function writeState(query, page, push) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (page > 1) params.set("page", page);
    const qs = params.toString();
    const url = location.pathname + (qs ? "?" + qs : "");
    history[push ? "pushState" : "replaceState"](null, "", url);
  }
  function pageLink(page, label, current, aria) {
    if (page === current) return `<span aria-current="page">${label}</span>`;
    return `<a href="?${new URLSearchParams({ ...(input.value.trim() && { q: input.value.trim() }), page })}" data-page="${page}"${aria ? ` aria-label="${aria}"` : ""}>${label}</a>`;
  }
  function render(page) {
    const query = input.value.trim().toLowerCase();
    const matches = cards.filter(card => !query || card.dataset.search.includes(query));
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    page = Math.min(page, pages);
    const visible = new Set(matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    for (const card of cards) card.hidden = !visible.has(card);
    status.textContent = query ? matches.length + "件" : "";
    empty.hidden = matches.length !== 0;
    if (pages > 1 && pager) {
      const parts = [];
      if (page > 1) parts.push(pageLink(page - 1, "‹", 0, "前のページ"));
      const from = Math.max(1, page - 2), to = Math.min(pages, page + 2);
      if (from > 1) parts.push(pageLink(1, "1", page));
      if (from > 2) parts.push("<span>…</span>");
      for (let n = from; n <= to; n++) parts.push(pageLink(n, String(n), page));
      if (to < pages - 1) parts.push("<span>…</span>");
      if (to < pages) parts.push(pageLink(pages, String(pages), page));
      if (page < pages) parts.push(pageLink(page + 1, "›", 0, "次のページ"));
      pager.innerHTML = parts.join("");
      pager.hidden = false;
    } else if (pager) {
      pager.hidden = true;
    }
    return page;
  }

  const initial = readState();
  input.value = initial.query;
  writeState(initial.query, render(initial.page), false);

  input.addEventListener("input", () => writeState(input.value.trim(), render(1), false));
  pager?.addEventListener("click", event => {
    const link = event.target.closest("a[data-page]");
    if (!link) return;
    event.preventDefault();
    writeState(input.value.trim(), render(Number(link.dataset.page)), true);
    grid.scrollIntoView({ block: "start" });
  });
  addEventListener("popstate", () => {
    const state = readState();
    input.value = state.query;
    render(state.page);
  });
  document.querySelector('.jump[href="#archive-search"]')?.addEventListener("click", event => {
    event.preventDefault();
    if (mobileLayout.matches) input.scrollIntoView({ block: "center" });
    input.focus();
  });
}
