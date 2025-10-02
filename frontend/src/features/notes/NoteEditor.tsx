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

  // Update fields when switching notes
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

  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

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
          {/* PIN BUTTON */}
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
            onClick={() => insertMarkdown("**")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("*")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("<u>", "</u>")}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("~~")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("\n- ", "")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("\n1. ", "")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("\n> ", "")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("[", "](url)")}
            title="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("![alt](", ")")}
            title="Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => insertMarkdown("``````")}
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
          />
        </TabsContent>
        <TabsContent
          value="preview"
          className="flex-1 px-6 py-4 overflow-y-auto prose max-w-none m-0"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
