import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Share, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BibleCharacter, Note } from "@shared/schema";

export default function CharacterContent() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const { data: character, isLoading } = useQuery<BibleCharacter>({
    queryKey: ["/api/characters", id],
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["/api/bookmarks"],
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    select: (data) => data.filter(note => note.characterId === id),
  });

  const isBookmarked = bookmarks.some((b: any) => b.characterId === id);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        const bookmark = bookmarks.find((b: any) => b.characterId === id);
        if (bookmark) {
          const response = await apiRequest("DELETE", `/api/bookmarks/${bookmark.id}`);
          return response.json();
        }
      } else {
        const response = await apiRequest("POST", "/api/bookmarks", { characterId: id });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked ? "Character removed from bookmarks" : "Character saved to bookmarks",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/notes", {
        characterId: id,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNoteContent("");
      toast({
        title: "Note added",
        description: "Your note has been saved successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Character not found</p>
      </div>
    );
  }

  const handleAddNote = () => {
    if (noteContent.trim()) {
      addNoteMutation.mutate(noteContent);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="text-gray-600" size={20} />
          </Button>
          <div className="flex-1 mx-4">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{character.name}</h1>
            <p className="text-sm text-gray-500">{character.title}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => bookmarkMutation.mutate()}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            {isBookmarked ? (
              <BookmarkCheck className="text-primary-500" size={20} />
            ) : (
              <Bookmark className="text-gray-600" size={20} />
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 pb-24 max-w-4xl mx-auto">
        <article className="font-reading leading-relaxed">
          {/* Character Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{character.name}</h1>
            <p className="text-xl text-primary-600 font-semibold">{character.title}</p>
          </div>
          
          <div className="bg-primary-50 border-l-4 border-primary-500 p-6 mb-8 rounded-r-xl">
            <h2 className="font-semibold text-primary-900 mb-2">Character Study</h2>
            <p className="text-primary-800">
              Explore the life, faith journey, and lessons we can learn from {character.name}.
            </p>
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: character.content.replace(/\n/g, '<br />') }}
          />

          {/* Interactive Element */}
          {showNotes && (
            <div className="bg-secondary-50 rounded-2xl p-6 mb-8 mt-8">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Personal Reflections</h3>
              
              {/* Existing Notes */}
              {notes.length > 0 && (
                <div className="mb-4 space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-lg p-3 border border-secondary-200">
                      <p className="text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Note */}
              <div>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="What lessons can you learn from this character? Write your thoughts and reflections here..."
                  className="w-full p-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent mb-3"
                  rows={4}
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!noteContent.trim() || addNoteMutation.isPending}
                  className="bg-secondary-500 hover:bg-secondary-600"
                >
                  Add Reflection
                </Button>
              </div>
            </div>
          )}
        </article>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col space-y-3">
        <Button
          onClick={() => setShowNotes(!showNotes)}
          className="w-14 h-14 bg-secondary-500 text-white rounded-full shadow-lg hover:bg-secondary-600 transition-colors p-0"
        >
          <FileText size={20} />
        </Button>
        <Button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${character.name} - ${character.title}`,
                text: `Learn about ${character.name} in this Bible character study.`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link copied",
                description: "Character link copied to clipboard",
              });
            }
          }}
          className="w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors p-0"
        >
          <Share size={20} />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setLocation("/")}
            className="bg-primary-500 text-white px-8 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            Back to Dashboard
          </Button>
        </div>
      </nav>
    </div>
  );
}
