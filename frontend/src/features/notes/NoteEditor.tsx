/**
 * TipTap-based Markdown Note Editor for React + TypeScript apps.
 * Features: formatting toolbar, edit/preview tabs, auto-save, word/char count.
 */

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
const lowlight = createLowlight();
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Eye,
  Maximize,
  Pin,
  Share2,
  MoreVertical,
  Trash2,
  Copy,
} from "lucide-react";
import type { Note } from "../../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NoteEditorProps {
  note: Note;
  onSave: (note: Partial<Note>) => Promise<void>;
  onDelete: () => void;
}

export default function NoteEditor({
  note,
  onSave,
  onDelete,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [lastSaved, setLastSaved] = useState("just now");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [focusMode, setFocusMode] = useState(false);

  // TipTap Editor instance (loads note content)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: note.content,
    autofocus: true,
    onUpdate: ({ editor }) => {
      // Auto-save when content/titles change
      const html = editor.getHTML();
      if (html !== note.content || title !== note.title) {
        handleAutoSave(html);
      }
    },
  });

  // Reset TipTap on new note load
  useEffect(() => {
    setTitle(note.title);
    if (editor) editor.commands.setContent(note.content || "");
  }, [note._id, editor]);

  // Auto-save handler (with debounce managed by TipTap updates)
  const handleAutoSave = async (htmlContent: string) => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      await onSave({ title, content: htmlContent });
      setLastSaved("just now");
    } catch {
      setErrorMsg("Failed to save note");
    }
    setIsSaving(false);
  };

  // Toolbar Formatting Commands
  const toolbar = [
    {
      icon: Bold,
      label: "Bold",
      cmd: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italic",
      cmd: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      icon: Underline,
      label: "Underline",
      cmd: () => editor?.chain().focus().toggleUnderline?.().run(),
    },
    {
      icon: Strikethrough,
      label: "Strike",
      cmd: () => editor?.chain().focus().toggleStrike().run(),
    },
    {
      icon: List,
      label: "Bullet List",
      cmd: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      cmd: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: Quote,
      label: "Quote",
      cmd: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: LinkIcon,
      label: "Link",
      cmd: () => editor?.chain().focus().toggleLink().run(),
    },
    {
      icon: ImageIcon,
      label: "Image",
      cmd: () =>
        editor
          ?.chain()
          .focus()
          .setImage({ src: "https://via.placeholder.com/150" })
          .run(),
    },
    {
      icon: Code,
      label: "Code",
      cmd: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
  ];

  // Plaintext for stats
  const wordCount = editor
    ? editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = editor ? editor.state.doc.textContent.length : 0;

  return (
    <div
      className={`flex flex-col h-full bg-white ${
        focusMode ? "fixed inset-0 z-50 bg-white" : ""
      }`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
            placeholder="Note title"
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={note.pinned ? "secondary" : "ghost"}
            title={note.pinned ? "Unpin Note" : "Pin Note"}
            onClick={() => onSave({ pinned: !note.pinned })}
          >
            <Pin
              className={`h-5 w-5 ${
                note.pinned ? "text-amber-500" : "text-gray-400"
              }`}
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Share"
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/dashboard?note=${note._id}`
              )
            }
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(editor?.getHTML() || "")
                }
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy note
              </DropdownMenuItem>
              {/* Add Export or Duplicate logic if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-6 py-2 flex items-center gap-1 flex-wrap">
        {toolbar.map(({ icon: Icon, label, cmd }) => (
          <Button
            key={label}
            size="icon"
            variant="ghost"
            onClick={cmd}
            title={label}
            className="h-8 w-8"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      {/* Tabs for Edit/Preview */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
        className="flex-1 flex flex-col"
      >
        <div className="px-6 py-2 border-b border-gray-100">
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-sm">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-sm">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="edit"
          className="flex-1 px-6 py-4 overflow-y-auto m-0"
        >
          {/* TipTap Editor */}
          <EditorContent editor={editor} className="w-full min-h-[300px]" />
        </TabsContent>
        <TabsContent
          value="preview"
          className="flex-1 px-6 py-4 overflow-y-auto prose max-w-none m-0"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: editor?.getHTML() || "<i>Nothing to preview</i>",
            }}
          />
        </TabsContent>
      </Tabs>
      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-2 flex items-center justify-between text-sm text-gray-500">
        <span>
          {wordCount} words | {charCount} characters
        </span>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setActiveTab("preview")}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <span className="text-xs">Preview</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setFocusMode((f) => !f)}
          >
            <Maximize className="h-3 w-3" />
          </Button>
          <span className="text-xs">Focus Mode</span>
          <span className="text-xs text-gray-500">
            Last saved: {isSaving ? "saving..." : lastSaved}
          </span>
        </div>
      </div>
      {/* Inline error message */}
      {errorMsg && (
        <div className="text-red-600 text-sm text-center mt-2">{errorMsg}</div>
      )}
    </div>
  );
}
