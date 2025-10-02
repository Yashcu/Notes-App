import { useState, useEffect } from "react";
import { noteAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { Note } from "../types";
import NoteEditor from "../features/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import logo from "../assets/logo.svg";

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();

  async function fetchNotes() {
    setLoading(true);
    try {
      const { data } = await noteAPI.getAllNotes();
      // Pinned notes first (already sorted by backend, but for safety)
      const sorted = [...data.notes].sort((a, b) =>
        b.pinned === a.pinned
          ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          : b.pinned
          ? 1
          : -1
      );
      setNotes(sorted);
      if (sorted.length > 0) {
        const found = sorted.find(
          (n) => selectedNote && n._id === selectedNote._id
        );
        setSelectedNote(found || sorted[0]);
      } else {
        setSelectedNote(null);
      }
    } catch {
      alert("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const handleCreateNote = async () => {
    try {
      const { data } = await noteAPI.createNote({
        title: "Untitled Note",
        content: "",
        tags: [],
      });
      await fetchNotes();
      setSelectedNote(data.note);
    } catch {
      alert("Failed to create note");
    }
  };

  const handleSaveNote = async (updated: Partial<Note>) => {
    if (!selectedNote) return;
    try {
      await noteAPI.updateNote(selectedNote._id, updated);
      await fetchNotes();
      setSelectedNote((prev) => prev && { ...prev, ...updated });
    } catch {
      alert("Failed to save note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("Delete this note?")) {
      try {
        await noteAPI.deleteNote(noteId);
        await fetchNotes();
      } catch {
        alert("Failed to delete note");
      }
    }
  };

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} mins ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)} hours ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className={`flex h-screen bg-gray-50 overflow-hidden`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-6 w-6" />
            <span className="text-lg font-bold text-purple-600">
              NoteEditor
            </span>
          </div>
        </div>
        <div className="p-4">
          <Button
            onClick={handleCreateNote}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            + New Note
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase mb-2">
            MY NOTES
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">
              No notes yet
            </p>
          ) : (
            <div className="space-y-1">
              {notes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedNote?._id === note._id
                      ? "bg-purple-50 border border-purple-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <h4 className="font-medium text-sm text-gray-900 truncate flex items-center gap-2">
                    {note.title || "Untitled"}
                    {note.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 flex items-center">
                      {formatDate(note.updatedAt)}
                      {note.pinned}
                    </span>
                    <span className="text-xs text-gray-400">
                      {note.wordCount || 0} words
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </aside>
      {/* Main Editor */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onDelete={() => handleDeleteNote(selectedNote._id)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">No note selected</p>
              <p className="text-sm">Create a new note to get started</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
