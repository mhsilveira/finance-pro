import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

function ThemeConsumer() {
  const { theme, mounted } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="mounted">{mounted ? "yes" : "no"}</span>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("provides dark theme", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("adds dark class to documentElement", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("sets mounted to true after effect", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
    });

    expect(screen.getByTestId("mounted").textContent).toBe("yes");
  });

  it("renders children", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Hello</div>
        </ThemeProvider>,
      );
    });

    expect(screen.getByTestId("child").textContent).toBe("Hello");
  });
});
