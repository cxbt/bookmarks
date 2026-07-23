const searchInput = document.querySelector("[data-bookmark-search]");
const bookmarkList = document.querySelector("[data-bookmark-list]");
const countNode = document.querySelector("[data-bookmark-count]");

if (searchInput && bookmarkList) {
  const cards = Array.from(bookmarkList.querySelectorAll("[data-bookmark-card]"));

  const update = () => {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    for (const card of cards) {
      const haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-domain"),
        card.getAttribute("data-categories")
      ].join(" ").toLowerCase();
      const matched = !query || haystack.includes(query);

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    }

    if (countNode) {
      countNode.textContent = String(visible);
    }
  };

  searchInput.addEventListener("input", update);
  update();
}
