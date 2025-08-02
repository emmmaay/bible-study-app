import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Share, FileText, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Class, UserProgress, Note } from "@shared/schema";

export default function ClassContent() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [readingProgress, setReadingProgress] = useState(0);
  const [noteContent, setNoteContent] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const { data: classData, isLoading } = useQuery<Class>({
    queryKey: ["/api/classes", id],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["/api/bookmarks"],
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    select: (data) => data.filter(note => note.classId === id),
  });

  const classProgress = progress?.find(p => p.classId === id);
  const isBookmarked = bookmarks.some((b: any) => b.classId === id);

  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      const response = await apiRequest("POST", "/api/progress", progressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        const bookmark = bookmarks.find((b: any) => b.classId === id);
        if (bookmark) {
          const response = await apiRequest("DELETE", `/api/bookmarks/${bookmark.id}`);
          return response.json();
        }
      } else {
        const response = await apiRequest("POST", "/api/bookmarks", { classId: id });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked ? "Class removed from bookmarks" : "Class saved to bookmarks",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/notes", {
        classId: id,
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

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Class not found</p>
      </div>
    );
  }

  const handleMarkComplete = () => {
    updateProgressMutation.mutate({
      classId: id,
      isCompleted: true,
      readingProgress: 100,
      completedAt: new Date().toISOString(),
    });
    
    toast({
      title: "Class completed!",
      description: "Great job! You've completed this class.",
    });
  };

  const handleProgressUpdate = (progress: number) => {
    setReadingProgress(progress);
    updateProgressMutation.mutate({
      classId: id,
      readingProgress: progress,
    });
  };

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
            <h1 className="text-lg font-semibold text-gray-900 truncate">{classData.title}</h1>
            <p className="text-sm text-gray-500">Class {classData.order} of 24</p>
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

      {/* Progress Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Reading Progress</span>
          <span className="text-sm text-gray-600">{classProgress?.readingProgress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${classProgress?.readingProgress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-6 pb-24 max-w-4xl mx-auto">
        <article className="font-reading leading-relaxed">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{classData.title}</h1>
          
          <div className="bg-primary-50 border-l-4 border-primary-500 p-6 mb-8 rounded-r-xl">
            <h2 className="font-semibold text-primary-900 mb-2">Class Information</h2>
            <ul className="text-primary-800 space-y-1">
              <li>• Estimated reading time: {classData.estimatedTime} minutes</li>
              <li>• Number of activities: {classData.activities}</li>
              <li>• Section: {classData.section}</li>
            </ul>
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: classData.content.replace(/\n/g, '<br />') }}
          />

          {/* Interactive Element */}
          {showNotes && (
            <div className="bg-secondary-50 rounded-2xl p-6 mb-8 mt-8">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Personal Notes</h3>
              
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
                  placeholder="Write your thoughts and reflections here..."
                  className="w-full p-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent mb-3"
                  rows={4}
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!noteContent.trim() || addNoteMutation.isPending}
                  className="bg-secondary-500 hover:bg-secondary-600"
                >
                  Add Note
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
                title: classData.title,
                text: `Check out this Bible study class: ${classData.title}`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link copied",
                description: "Class link copied to clipboard",
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
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Previous</span>
          </Button>
          
          <Button
            onClick={handleMarkComplete}
            disabled={classProgress?.isCompleted || updateProgressMutation.isPending}
            className="bg-success-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-success-600 transition-colors"
          >
            {classProgress?.isCompleted ? (
              <>
                <CheckCircle size={16} className="mr-2" />
                Completed
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
          
          <Button
            variant="ghost"
            className="flex items-center space-x-2 px-4 py-2 text-primary-500 hover:text-primary-600"
          >
            <span className="text-sm font-medium">Next</span>
            <ChevronRight size={20} />
          </Button>
        </div>
      </nav>
    </div>
  );
}
