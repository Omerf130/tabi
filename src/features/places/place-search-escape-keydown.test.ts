import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { handlePlaceSearchEscapeKeyDown } from "./place-search-escape-keydown";

function mockEscapeEvent() {
  return {
    key: "Escape",
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  };
}

describe("handlePlaceSearchEscapeKeyDown", () => {
  it("dismisses suggestions and consumes Escape when suggestions are visible", () => {
    const event = mockEscapeEvent();
    const dismissSuggestions = vi.fn();
    const resetActiveIndex = vi.fn();

    handlePlaceSearchEscapeKeyDown(event, 3, {
      dismissSuggestions,
      resetActiveIndex,
    });

    expect(dismissSuggestions).toHaveBeenCalledOnce();
    expect(resetActiveIndex).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
  });

  it("does not consume Escape when suggestions are not visible", () => {
    const event = mockEscapeEvent();
    const dismissSuggestions = vi.fn();
    const resetActiveIndex = vi.fn();

    handlePlaceSearchEscapeKeyDown(event, 0, {
      dismissSuggestions,
      resetActiveIndex,
    });

    expect(dismissSuggestions).not.toHaveBeenCalled();
    expect(resetActiveIndex).toHaveBeenCalledOnce();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it("supports first Escape dismiss then second Escape passthrough contract", () => {
    const dismissSuggestions = vi.fn();
    const resetActiveIndex = vi.fn();

    const first = mockEscapeEvent();
    handlePlaceSearchEscapeKeyDown(first, 2, {
      dismissSuggestions,
      resetActiveIndex,
    });
    expect(first.stopPropagation).toHaveBeenCalledOnce();

    const second = mockEscapeEvent();
    handlePlaceSearchEscapeKeyDown(second, 0, {
      dismissSuggestions,
      resetActiveIndex,
    });
    expect(second.stopPropagation).not.toHaveBeenCalled();
    expect(resetActiveIndex).toHaveBeenCalledOnce();
  });

  it("ignores non-Escape keys", () => {
    const event = {
      key: "ArrowDown",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    const dismissSuggestions = vi.fn();
    const resetActiveIndex = vi.fn();

    handlePlaceSearchEscapeKeyDown(event, 5, {
      dismissSuggestions,
      resetActiveIndex,
    });

    expect(dismissSuggestions).not.toHaveBeenCalled();
    expect(resetActiveIndex).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });
});

describe("PlaceSearchField keyboard contract", () => {
  const fieldSource = readFileSync(
    join(process.cwd(), "src/features/places/PlaceSearchField.tsx"),
    "utf8",
  );

  it("wires Escape through handlePlaceSearchEscapeKeyDown", () => {
    expect(fieldSource).toContain("handlePlaceSearchEscapeKeyDown");
    expect(fieldSource).toContain("dismissSuggestionsFromEscape");
    expect(fieldSource).toContain("handleQueryChange(\"\")");
  });

  it("preserves ArrowDown, ArrowUp, and Enter selection behavior", () => {
    expect(fieldSource).toContain('event.key === "ArrowDown"');
    expect(fieldSource).toContain('event.key === "ArrowUp"');
    expect(fieldSource).toContain('event.key === "Enter" && activeIndex >= 0');
    expect(fieldSource).toContain("void selectSuggestion(suggestion)");
    expect(fieldSource).toContain("onClick={() => void selectSuggestion(suggestion)}");
  });

  it("keeps planner and default presentations unchanged", () => {
    expect(fieldSource).toContain('presentation === "planner"');
    expect(fieldSource).toContain("styles.plannerResults");
    expect(fieldSource).toContain("styles.suggestions");
  });
});
