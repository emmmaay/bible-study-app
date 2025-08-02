import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { BookOpen, Bookmark, User } from "lucide-react";
import type { Bookmark as BookmarkType, Class, BibleCharacter } from "@shared/schema";

export default function Bookmarks() {
  const { data: bookmarks = [], isLoading } = useQuery<BookmarkType[]>({
    queryKey: ["/api/bookmarks"],
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: characters = [] } = useQuery<BibleCharacter[]>({
    queryKey: ["/api/characters"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const bookmarkedClasses = bookmarks
    .filter(b => b.classId)
    .map(b => classes.find(c => c.id === b.classId))
    .filter(Boolean);

  const bookmarkedCharacters = bookmarks
    .filter(b => b.characterId)
    .map(b => characters.find(c => c.id === b.characterId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Bookmark className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Bookmarks</h1>
              <p className="text-sm text-gray-500">{bookmarks.length} saved items</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bookmark className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 mb-6">Start bookmarking classes and characters you want to revisit.</p>
            <Link href="/">
              <button className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors">
                Browse Classes
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bookmarked Classes */}
            {bookmarkedClasses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Classes</h2>
                <div className="space-y-3">
                  {bookmarkedClasses.map((classItem) => (
                    <Link key={classItem.id} href={`/class/${classItem.id}`}>
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="text-primary-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{classItem.title}</h3>
                            <p className="text-sm text-gray-500">{classItem.section}</p>
                            <p className="text-sm text-gray-500">
                              {classItem.estimatedTime} min read • {classItem.activities} activities
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarked Characters */}
            {bookmarkedCharacters.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bible Characters</h2>
                <div className="space-y-3">
                  {bookmarkedCharacters.map((character) => (
                    <Link key={character.id} href={`/character/${character.id}`}>
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                            <User className="text-secondary-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{character.name}</h3>
                            <p className="text-sm text-gray-500">{character.title}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
