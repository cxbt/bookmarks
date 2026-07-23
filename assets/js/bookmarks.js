const searchInput = document.querySelector("[data-bookmark-search]");
const bookmarkList = document.querySelector("[data-bookmark-list]");
const countNode = document.querySelector("[data-bookmark-count]");
const sortSelect = document.querySelector("[data-bookmark-sort]");
const categoryButtons = Array.from(document.querySelectorAll("[data-category-filter]"));
const viewButtons = Array.from(document.querySelectorAll("[data-view-mode]"));

if (searchInput && bookmarkList) {
  const cards = Array.from(bookmarkList.querySelectorAll("[data-bookmark-card]"));
  let activeCategory = "";
  let viewMode = localStorage.getItem("openbookmark:view") || "grid";

  const update = () => {
    const query = searchInput.value.trim().toLowerCase();
    const sortedCards = sortCards(cards, sortSelect?.value || "newest");
    let visible = 0;

    for (const card of sortedCards) {
      bookmarkList.appendChild(card);
      const categories = card.getAttribute("data-categories") || "";
      const haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-domain"),
        categories
      ].join(" ").toLowerCase();
      const matchedSearch = !query || haystack.includes(query);
      const matchedCategory = !activeCategory || categories.split(" ").includes(activeCategory);
      const matched = matchedSearch && matchedCategory;

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    }

    bookmarkList.classList.toggle("bookmark-grid--list", viewMode === "list");

    for (const button of viewButtons) {
      const active = button.dataset.viewMode === viewMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    for (const button of categoryButtons) {
      button.classList.toggle("active", (button.dataset.categoryFilter || "") === activeCategory);
    }

    if (countNode) {
      countNode.textContent = String(visible);
    }
  };

  searchInput.addEventListener("input", update);
  sortSelect?.addEventListener("change", update);

  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.categoryFilter || "";
      update();
    });
  }

  for (const button of viewButtons) {
    button.addEventListener("click", () => {
      viewMode = button.dataset.viewMode || "grid";
      localStorage.setItem("openbookmark:view", viewMode);
      update();
    });
  }

  update();
}

function sortCards(cards, mode) {
  return [...cards].sort((a, b) => {
    if (mode === "oldest") {
      return Number(a.dataset.created || 0) - Number(b.dataset.created || 0);
    }

    if (mode === "title") {
      return text(a.dataset.title).localeCompare(text(b.dataset.title));
    }

    if (mode === "domain") {
      return text(a.dataset.domain).localeCompare(text(b.dataset.domain));
    }

    return Number(b.dataset.created || 0) - Number(a.dataset.created || 0);
  });
}

function text(value) {
  return String(value || "").toLowerCase();
}
