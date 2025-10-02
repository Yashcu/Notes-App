import rehypeRaw from "rehype-raw";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "../../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function NoteEditor({
  note,
  onSave,
  onDelete,
}: {
  note: Note;
  onSave: (note: Partial<Note>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [lastSaved, setLastSaved] = useState<string>("just now");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [focusMode, setFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note._id]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (title !== note.title || content !== note.content) handleAutoSave();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content]);

  const handleAutoSave = async () => {
    setIsSaving(true);
    await onSave({ title, content });
    setLastSaved("just now");
    setIsSaving(false);
  };

  function insertMarkdown(type: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    let before = "",
      after = "",
      newText = "",
      cursorMove = 0;

    if (type === "bold") {
      before = "**";
      after = "**";
      newText = selected ? before + selected + after : "**bold text**";
      cursorMove = selected ? before.length : 2;
    } else if (type === "italic") {
      before = "*";
      after = "*";
      newText = selected ? before + selected + after : "*italic*";
      cursorMove = selected ? before.length : 1;
    } else if (type === "strikethrough") {
      before = "~~";
      after = "~~";
      newText = selected ? before + selected + after : "~~strike~~";
      cursorMove = selected ? before.length : 2;
    } else if (type === "underline") {
      before = "<u>";
      after = "</u>";
      newText = selected ? before + selected + after : "<u>underline</u>";
      cursorMove = selected ? before.length : 3;
    } else if (type === "ulist") {
      newText = selected
        ? selected
            .split("\n")
            .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
            .join("\n")
        : "- list item";
      cursorMove = selected ? 0 : 2;
    } else if (type === "olist") {
      newText = selected
        ? selected
            .split("\n")
            .map((line, i) => (/\d\. /.test(line) ? line : `${i + 1}. ${line}`))
            .join("\n")
        : "1. list item";
      cursorMove = selected ? 0 : 3;
    } else if (type === "quote") {
      newText = selected
        ? selected
            .split("\n")
            .map((line) => (line.startsWith("> ") ? line : `> ${line}`))
            .join("\n")
        : "> quote";
      cursorMove = selected ? 0 : 2;
    } else if (type === "code") {
      before = "``";
      after = "\n```";
      newText = selected ? before + selected + after : "``````";
      cursorMove = selected ? before.length : 3;
    } else if (type === "link") {
      newText = selected ? `[${selected}](url)` : "[text](url)";
      cursorMove = selected ? 1 : 1;
    } else if (type === "image") {
      newText = selected ? `![alt](${selected})` : "![alt](url)";
      cursorMove = selected ? 4 : 7;
    }

    // Compose new content
    const updated = content.slice(0, start) + newText + content.slice(end);

    setContent(updated);

    // Focus textarea & select inserted text if needed
    setTimeout(() => {
      textarea.focus();
      if (!selected) {
        let selStart = start + cursorMove;
        let selEnd = start + newText.length - cursorMove;
        if (type === "link") {
          selStart = start + 1;
          selEnd = start + 5;
        } else if (type === "image") {
          selStart = start + 6;
          selEnd = start + 9;
        }
        textarea.setSelectionRange(selStart, selEnd);
      } else {
        textarea.setSelectionRange(start + before.length, end + before.length);
      }
    }, 0);
  }

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const charCount = content.length;

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
            placeholder="Welcome to NoteEditor"
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
                onClick={() => navigator.clipboard.writeText(content)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy note
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  /* implement export/duplicate logic */
                }}
              >
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-6 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("underline")}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("strikethrough")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("ulist")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("olist")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("quote")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("link")}
            title="Link (Ctrl+K)"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("image")}
            title="Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("code")}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Last saved: {isSaving ? "saving..." : lastSaved}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setActiveTab("preview")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setFocusMode((f) => !f)}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Editor Tabs */}
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
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full resize-none border-none outline-none font-mono text-sm leading-relaxed"
            placeholder="This is a simple note editor where you can write your thoughts, ideas, or anything you want to remember..."
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "b") {
                e.preventDefault();
                insertMarkdown("bold");
              } else if (e.ctrlKey && e.key === "i") {
                e.preventDefault();
                insertMarkdown("italic");
              } else if (e.ctrlKey && e.key === "u") {
                e.preventDefault();
                insertMarkdown("underline");
              } else if (e.ctrlKey && e.key === "k") {
                e.preventDefault();
                insertMarkdown("link");
              }
            }}
          />
        </TabsContent>
        <TabsContent
          value="preview"
          className="flex-1 px-6 py-4 overflow-y-auto prose max-w-none m-0"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content || "*Nothing to preview*"}
          </ReactMarkdown>
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
        </div>
      </div>
    </div>
  );
}
