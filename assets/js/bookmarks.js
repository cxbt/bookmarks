const VIEW_STORAGE_KEY = "openbookmark:view";
const searchInput = document.querySelector("[data-bookmark-search]");
const bookmarkList = document.querySelector("[data-bookmark-list]");
const countNode = document.querySelector("[data-bookmark-count]");
const listHeader = document.querySelector("[data-bookmark-list-header]");
const sortSelect = document.querySelector("[data-bookmark-sort]");
const categoryButtons = Array.from(document.querySelectorAll("[data-category-filter]"));
const viewButtons = Array.from(document.querySelectorAll("[data-view-mode]"));

for (const image of document.querySelectorAll("[data-fallback-image]")) {
  image.addEventListener("error", () => {
    const template = image.parentElement?.querySelector("[data-thumbnail-fallback]");
    const fallback = template?.content.firstElementChild?.cloneNode(true);

    if (fallback) {
      image.replaceWith(fallback);
    } else {
      image.remove();
    }
  }, { once: true });
}


for (const card of document.querySelectorAll("[data-bookmark-card][data-external-url]")) {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button, input, select, textarea")) {
      return;
    }

    window.open(card.dataset.externalUrl, "_blank", "noopener,noreferrer");
  });

  card.addEventListener("auxclick", (event) => {
    if (event.button !== 1 || event.target.closest("a, button, input, select, textarea")) {
      return;
    }

    event.preventDefault();
    window.open(card.dataset.externalUrl, "_blank", "noopener,noreferrer");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.target !== card) {
      return;
    }

    window.open(card.dataset.externalUrl, "_blank", "noopener,noreferrer");
  });
}

if (searchInput && bookmarkList) {
  const cards = Array.from(bookmarkList.querySelectorAll("[data-bookmark-card]"));
  const activeCategories = new Set();
  let viewMode = readViewMode();

  const update = () => {
    const query = searchInput.value.trim().toLowerCase();
    const sortedCards = sortCards(cards, sortSelect?.value || "newest");
    let visible = 0;

    for (const card of sortedCards) {
      bookmarkList.appendChild(card);
      const categories = card.getAttribute("data-categories") || "";
      const haystack = [
        card.getAttribute("data-search-text"),
        card.getAttribute("data-external-url"),
        card.textContent
      ].join(" ").toLowerCase();
      const matchedSearch = !query || haystack.includes(query);
      const categorySet = categories.split(/\s+/).filter(Boolean);
      const matchedCategory = activeCategories.size === 0 || categorySet.some((category) => activeCategories.has(category));
      const matched = matchedSearch && matchedCategory;

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    }

    bookmarkList.classList.toggle("bookmark-grid--list", viewMode === "list");

    if (listHeader) {
      listHeader.hidden = viewMode !== "list";
    }

    for (const button of viewButtons) {
      const active = button.dataset.viewMode === viewMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    for (const button of categoryButtons) {
      const category = button.dataset.categoryFilter || "";
      const active = activeCategories.has(category);
      const inactive = activeCategories.size > 0 && !active;
      button.classList.toggle("active", active);
      button.classList.toggle("inactive", inactive);
      button.setAttribute("aria-pressed", String(active));
    }

    if (countNode) {
      countNode.textContent = String(visible);
    }
  };

  searchInput.addEventListener("input", update);
  sortSelect?.addEventListener("change", update);

  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      const category = button.dataset.categoryFilter || "";
      if (activeCategories.has(category)) {
        activeCategories.delete(category);
      } else {
        activeCategories.add(category);
      }
      update();
    });
  }

  for (const button of viewButtons) {
    button.addEventListener("click", () => {
      viewMode = button.dataset.viewMode || "grid";
      writeViewMode(viewMode);
      update();
    });
  }

  update();
}

function readViewMode() {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === "list" || stored === "grid" ? stored : "grid";
  } catch {
    return "grid";
  }
}

function writeViewMode(mode) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in strict privacy contexts.
  }
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
