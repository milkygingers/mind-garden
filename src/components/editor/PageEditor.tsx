"use client";

/**
 * Page Editor Component
 * 
 * A rich text editor using Tiptap with:
 * - Headings
 * - Bold, italic, underline
 * - Lists (bullet, numbered, checklist)
 * - Blockquotes
 * - Code blocks
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Highlighter,
} from "lucide-react";

interface PageEditorProps {
  initialContent: string | null;
  onUpdate: (content: string) => void;
  placeholder?: string;
}

export function PageEditor({
  initialContent,
  onUpdate,
  placeholder = "Start typing...",
}: PageEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Use ref to store the onUpdate callback to prevent editor recreation
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Parse initial content - only once
  const getInitialContent = useCallback(() => {
    if (!initialContent) {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }
    try {
      return JSON.parse(initialContent);
    } catch {
      return { type: "doc", content: [{ type: "paragraph" }] };
    }
  }, [initialContent]);

  // Initialize the editor - stable config
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content: getInitialContent(),
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[300px] px-1",
      },
    },
    onUpdate: ({ editor }) => {
      // Use ref to get latest callback without causing re-renders
      const json = JSON.stringify(editor.getJSON());
      onUpdateRef.current(json);
    },
    // Prevent unnecessary editor recreations
    immediatelyRender: false,
  });

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !editor) {
    return (
      <div className="h-64 flex items-center justify-center border border-[var(--border)] rounded-xl bg-[var(--card)]">
        <div className="w-6 h-6 border-2 border-garden-500/30 border-t-garden-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border)] bg-[var(--background)]">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Text formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border)]">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive("taskList")}
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Blocks */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor content */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-garden-500 text-white"
          : "hover:bg-[var(--card-hover)] text-[var(--foreground)]"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
