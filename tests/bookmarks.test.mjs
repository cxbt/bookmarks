import assert from "node:assert/strict";
import test from "node:test";

test("middle-clicking a bookmark card opens its URL in a new tab", async () => {
  const listeners = new Map();
  const opened = [];
  const card = {
    dataset: { externalUrl: "https://example.com/article" },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    }
  };

  globalThis.document = {
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      return selector === "[data-bookmark-card][data-external-url]" ? [card] : [];
    }
  };
  globalThis.window = {
    open(...args) {
      opened.push(args);
    }
  };

  await import(`../assets/js/bookmarks.js?test=${Date.now()}`);

  let defaultPrevented = false;
  listeners.get("auxclick")({
    button: 1,
    target: { closest: () => null },
    preventDefault() {
      defaultPrevented = true;
    }
  });

  assert.equal(defaultPrevented, true);
  assert.deepEqual(opened, [["https://example.com/article", "_blank", "noopener,noreferrer"]]);
});
