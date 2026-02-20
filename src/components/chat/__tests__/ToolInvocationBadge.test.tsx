import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// ── getToolLabel unit tests ──────────────────────────────────────────────────

test("getToolLabel: str_replace_editor + create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }))
    .toBe("Creating /App.jsx");
});

test("getToolLabel: str_replace_editor + str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" }))
    .toBe("Editing /components/Button.tsx");
});

test("getToolLabel: str_replace_editor + insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }))
    .toBe("Editing /App.jsx");
});

test("getToolLabel: str_replace_editor + view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/styles.css" }))
    .toBe("Viewing /styles.css");
});

test("getToolLabel: str_replace_editor + undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }))
    .toBe("Undoing edit on /App.jsx");
});

test("getToolLabel: file_manager + rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }))
    .toBe("Renaming /old.jsx → /new.jsx");
});

test("getToolLabel: file_manager + delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/unused.tsx" }))
    .toBe("Deleting /unused.tsx");
});

test("getToolLabel: unknown tool name falls back to raw toolName", () => {
  expect(getToolLabel("some_other_tool", { command: "do_something", path: "/foo" }))
    .toBe("some_other_tool");
});

test("getToolLabel: known tool with unknown command falls back to raw toolName", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown_command", path: "/foo" }))
    .toBe("str_replace_editor");
});

test("getToolLabel: missing path arg degrades gracefully", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }))
    .toBe("Creating ");
});

test("getToolLabel: missing command arg degrades gracefully", () => {
  expect(getToolLabel("str_replace_editor", { path: "/App.jsx" }))
    .toBe("str_replace_editor");
});

test("getToolLabel: file_manager rename with missing new_path degrades gracefully", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" }))
    .toBe("Renaming /old.jsx → ");
});

test("getToolLabel: non-string path value degrades gracefully", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: 42 }))
    .toBe("Creating ");
});

// ── Loading state ────────────────────────────────────────────────────────────

test("renders spinner when state is 'call'", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );

  const badge = screen.getByText("Creating /App.jsx").closest("div");
  const svg = badge?.querySelector("svg");
  expect(svg).toBeDefined();
  expect(svg?.getAttribute("class")).toContain("animate-spin");
});

test("renders spinner when state is 'partial-call'", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc2",
        toolName: "file_manager",
        args: { command: "delete", path: "/foo.tsx" },
        state: "partial-call",
      }}
    />
  );

  const badge = screen.getByText("Deleting /foo.tsx").closest("div");
  const svg = badge?.querySelector("svg");
  expect(svg).toBeDefined();
  expect(svg?.getAttribute("class")).toContain("animate-spin");
});

test("renders spinner when state is 'result' but result is undefined", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc3",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/App.jsx" },
        state: "result",
        result: undefined,
      }}
    />
  );

  const badge = screen.getByText("Viewing /App.jsx").closest("div");
  const svg = badge?.querySelector("svg");
  expect(svg).toBeDefined();
  expect(svg?.getAttribute("class")).toContain("animate-spin");
});

// ── Complete state ───────────────────────────────────────────────────────────

test("renders green dot when state is 'result' and result is present", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc4",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );

  const badge = screen.getByText("Creating /App.jsx").closest("div");
  expect(badge?.querySelector("svg")).toBeNull();
  expect(badge?.querySelector(".bg-emerald-500")).toBeDefined();
});

test("renders green dot for file_manager rename in complete state", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc5",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );

  const badge = screen.getByText("Renaming /old.jsx → /new.jsx").closest("div");
  expect(badge?.querySelector(".bg-emerald-500")).toBeDefined();
});

// ── Label text ───────────────────────────────────────────────────────────────

test("renders human-readable label instead of raw tool name", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc6",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/components/Card.tsx" },
        state: "result",
        result: "OK",
      }}
    />
  );

  expect(screen.getByText("Editing /components/Card.tsx")).toBeDefined();
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});

test("renders raw tool name as fallback for unknown tool", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc7",
        toolName: "mystery_tool",
        args: { command: "do_thing", path: "/foo" },
        state: "result",
        result: "done",
      }}
    />
  );

  expect(screen.getByText("mystery_tool")).toBeDefined();
});

// ── Container classes ────────────────────────────────────────────────────────

test("badge has correct container classes", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "tc8",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("inline-flex");
  expect(badge.className).toContain("items-center");
  expect(badge.className).toContain("font-mono");
  expect(badge.className).toContain("border-neutral-200");
});
