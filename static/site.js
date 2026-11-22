const navigation = document.querySelector(".nav-wrap nav");
const menuButton = document.createElement("button");
menuButton.type = "button";
menuButton.className = "menu-toggle";
menuButton.textContent = "☰　MENU";
navigation.id = "category-menu";
menuButton.setAttribute("aria-controls", navigation.id);
const mobileLayout = matchMedia("(max-width: 767px)");
function resetMenu() {
  const expanded = !mobileLayout.matches || Boolean(document.querySelector(".home"));
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
const listing = document.querySelector(".listing");
if (listing) {
  const filter = document.createElement("div");
  filter.className = "archive-filter";
  filter.innerHTML = '<input id="archive-search" type="search" placeholder="記事検索" aria-label="このカテゴリの記事を検索"><span id="result-count" role="status"></span>';
  document.querySelector(".nav-wrap").append(filter);
  const input = filter.querySelector("input");
  const cards = listing.querySelectorAll(".card");
  const empty = listing.querySelector(".empty");
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let matches = 0;
    for (const card of cards) {
      card.hidden = !card.dataset.search.includes(query);
      if (!card.hidden) matches++;
    }
    filter.querySelector("[role=status]").textContent = query ? matches + "件" : "";
    empty.hidden = matches !== 0;
  });
  document.querySelector('.jump[href="#archive-search"]')?.addEventListener("click", event => {
    event.preventDefault();
    input.focus();
  });
}
