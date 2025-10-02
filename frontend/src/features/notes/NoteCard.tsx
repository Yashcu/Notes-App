import type { Note } from "../../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Trash2 } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 relative transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-semibold text-lg leading-6 text-gray-900 line-clamp-1">
          {note.title}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7 float-right">
              <span className="sr-only">Open menu</span>
              <svg
                width="4"
                height="18"
                fill="currentColor"
                className="mx-auto"
              >
                <circle cx="2" cy="3" r="2" />
                <circle cx="2" cy="9" r="2" />
                <circle cx="2" cy="15" r="2" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="end">
            <DropdownMenuItem
              onClick={onEdit}
              className="flex gap-2 items-center"
            >
              <Pencil size={16} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="flex gap-2 items-center text-red-600 focus:bg-red-50"
            >
              <Trash2 size={16} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {note.tags.map((tag) => (
          <Badge variant="secondary" key={tag} className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      {/* Markdown preview */}
      <div className="text-sm text-gray-700 line-clamp-4 min-h-[60px]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {note.content
            ? note.content.slice(0, 185) +
              (note.content.length > 185 ? "..." : "")
            : "*No content*"}
        </ReactMarkdown>
      </div>
      <div className="text-xs text-gray-400 mt-3 flex justify-between items-center">
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        {note.pinned && (
          <Badge
            variant="outline"
            className="uppercase text-amber-500 border-amber-400 px-2 py-0.5"
          >
            Pinned
          </Badge>
        )}
      </div>
    </div>
  );
}
