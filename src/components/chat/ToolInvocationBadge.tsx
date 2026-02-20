"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "result" | "call" | "partial-call";
  result?: unknown;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const path = typeof args.path === "string" ? args.path : "";
  const command = typeof args.command === "string" ? args.command : "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":      return `Creating ${path}`;
      case "str_replace": return `Editing ${path}`;
      case "insert":      return `Editing ${path}`;
      case "view":        return `Viewing ${path}`;
      case "undo_edit":   return `Undoing edit on ${path}`;
      default:            return toolName;
    }
  }

  if (toolName === "file_manager") {
    const newPath = typeof args.new_path === "string" ? args.new_path : "";
    switch (command) {
      case "rename": return `Renaming ${path} → ${newPath}`;
      case "delete": return `Deleting ${path}`;
      default:       return toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const label = getToolLabel(toolName, args);
  const isComplete = state === "result" && result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
