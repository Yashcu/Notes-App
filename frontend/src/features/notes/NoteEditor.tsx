import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoteEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: {
    title: string;
    content: string;
    tags: string[];
    pinned?: boolean;
  }) => void;
  initial?: {
    title?: string;
    content?: string;
    tags?: string[];
    pinned?: boolean;
  };
}

export default function NoteEditor({
  open,
  onClose,
  onSave,
  initial = {},
}: NoteEditorProps) {
  // Controlled fields
  const [title, setTitle] = useState(initial.title || "");
  const [content, setContent] = useState(initial.content || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial.tags || []);
  const [pinned, setPinned] = useState(initial.pinned || false);

  // Focus title field when dialog opens
  const titleRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 200);
  }, [open]);

  // Tag add/remove
  const handleTagAdd = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
    setTagInput("");
  };
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleTagAdd();
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  // Save note handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, content, tags, pinned });
    // Reset state (optional, if you want to clear on close)
    setTitle("");
    setContent("");
    setTags([]);
    setPinned(false);
    onClose();
  };

  useEffect(() => {
    // Re-populate state when editing a new note
    setTitle(initial.title || "");
    setContent(initial.content || "");
    setTags(initial.tags || []);
    setPinned(initial.pinned || false);
  }, [JSON.stringify(initial), open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {initial.title ? "Edit Note" : "New Note"}
          </DialogTitle>
          <DialogDescription>
            Write, edit, and preview your note in Markdown. Add tags for easy
            organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col space-y-5">
          {/* Title field */}
          <Input
            ref={titleRef}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {/* Tags input */}
          <div>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag and hit Enter"
                className="w-full"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleTagAdd}
              >
                Add
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} <span className="ml-1 text-gray-400">&times;</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Pin note */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pin"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="pin" className="text-sm text-gray-600 select-none">
              Pin this note
            </label>
          </div>

          {/* Markdown Editor/Preview Tabs */}
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="w-full">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[120px] border rounded p-2 font-mono resize-vertical bg-gray-50"
                placeholder="Write Markdown here..."
              />
            </TabsContent>
            <TabsContent
              value="preview"
              className="bg-gray-50 rounded p-2 min-h-[120px] text-sm border"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "Nothing to preview."}
              </ReactMarkdown>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={!title.trim()}
          >
            {initial.title ? "Update Note" : "Create Note"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
