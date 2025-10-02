import { useState, useEffect } from "react";
import { noteAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { Note } from "../types";
import NoteEditor from "../features/notes/NoteEditor";
import NoteCard from "../features/notes/NoteCard";
import { Button } from "@/components/ui/button";
import logo from "../assets/logo.svg";

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();

  // Initial load
  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await noteAPI.getAllNotes();
      setNotes(data.notes);
    } catch {
      alert("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await noteAPI.getTags();
      setTags(data.tags);
    } catch {
      /* ignore */
    }
  };

  // Note CRUD
  const handleSaveNote = async (note: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    if (editingNote) {
      await noteAPI.updateNote(editingNote._id, note);
    } else {
      await noteAPI.createNote(note);
    }
    fetchNotes();
    fetchTags();
    setEditingNote(null);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleDelete = async (note: Note) => {
    if (window.confirm("Delete this note?")) {
      await noteAPI.deleteNote(note._id);
      fetchNotes();
      fetchTags();
    }
  };

  // Tag filter
  const filteredNotes = selectedTag
    ? notes.filter((n) => n.tags.includes(selectedTag))
    : notes;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700 text-white flex flex-col justify-between p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-8 mt-1">
            <img
              src={logo}
              alt="Notes Logo"
              className="h-8 w-8 rounded shadow-lg"
            />
            <span className="text-xl font-bold tracking-tight">Notes</span>
          </div>
          <nav className="space-y-2">
            <Button
              variant={selectedTag === null ? "secondary" : "ghost"}
              className={`w-full justify-start text-base font-semibold transition ${
                selectedTag === null
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "hover:bg-indigo-500/30"
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All Notes{" "}
              <span className="ml-2 text-xs text-indigo-200">
                ({notes.length})
              </span>
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "secondary" : "ghost"}
                className={`w-full justify-start text-base font-semibold transition ${
                  selectedTag === tag
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "hover:bg-blue-500/30"
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </Button>
            ))}
          </nav>
        </div>
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
              {user?.name?.charAt(0)}
            </div>
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
          <Button
            variant="link"
            className="mt-2 text-red-500 px-0"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between mb-10 gap-2">
          <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
          <Button
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-indigo-600"
            onClick={() => {
              setEditorOpen(true);
              setEditingNote(null);
            }}
          >
            + New Note
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">No notes found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDelete(note)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Editor Dialog Modal */}
      <NoteEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initial={editingNote ?? undefined}
      />
    </div>
  );
}
