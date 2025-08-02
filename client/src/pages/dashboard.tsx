import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { BookOpen, User, TrendingUp, Search, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Class, BibleCharacter } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<BibleCharacter[]>({
    queryKey: ["/api/characters"],
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
  });

  if (classesLoading || charactersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Group classes by section
  const sections = classes.reduce((acc, cls) => {
    if (!acc[cls.section]) {
      acc[cls.section] = [];
    }
    acc[cls.section].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  const progressMap = progress.reduce((acc, p) => {
    if (p.classId) acc[p.classId] = p;
    return acc;
  }, {} as any);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Bible Study Pro</h1>
              <p className="text-sm text-gray-500">
                {user?.completedClasses || 0} of {classes.length} classes completed
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-xl">
              <User className="text-gray-600" size={20} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search classes, characters, or content..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Progress Overview */}
      <div className="px-4 py-6 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 mb-1">Overall Progress</p>
              <p className="text-2xl font-bold">{user?.progressPercentage || 0}%</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ width: `${user?.progressPercentage || 0}%` }}
            ></div>
          </div>
          <p className="text-primary-100 mt-3 text-sm">
            {user?.progressPercentage === 100 
              ? "Congratulations! You've completed all classes!" 
              : "Keep up the great work! You're making progress."}
          </p>
        </div>
      </div>

      {/* Course Sections */}
      <div className="px-4 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Sections</h2>
        
        <div className="space-y-4">
          {Object.entries(sections).map(([sectionName, sectionClasses]) => {
            const completedCount = sectionClasses.filter(cls => 
              progressMap[cls.id]?.isCompleted
            ).length;
            const isComplete = completedCount === sectionClasses.length;
            const inProgress = sectionClasses.some(cls => 
              progressMap[cls.id] && !progressMap[cls.id].isCompleted && progressMap[cls.id].readingProgress > 0
            );

            return (
              <div key={sectionName} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{sectionName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isComplete 
                        ? "bg-success-50 text-success-600"
                        : inProgress
                        ? "bg-secondary-50 text-secondary-600"
                        : "bg-gray-50 text-gray-600"
                    }`}>
                      {isComplete ? "Complete" : inProgress ? "In Progress" : "Not Started"}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Explore the fundamental concepts and teachings in this section.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    {isComplete ? (
                      <>
                        <CheckCircle className="text-success-500 mr-1" size={16} />
                        {completedCount} of {sectionClasses.length} classes completed
                      </>
                    ) : (
                      <>
                        <Clock className="text-secondary-500 mr-1" size={16} />
                        {completedCount} of {sectionClasses.length} classes completed
                      </>
                    )}
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {sectionClasses.slice(0, 2).map((cls) => {
                    const classProgress = progressMap[cls.id];
                    const isCompleted = classProgress?.isCompleted;
                    const readingProgress = classProgress?.readingProgress || 0;
                    
                    return (
                      <Link key={cls.id} href={`/class/${cls.id}`}>
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? "bg-success-500"
                                : readingProgress > 0
                                ? "bg-secondary-500"
                                : "bg-gray-300"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="text-white" size={16} />
                              ) : readingProgress > 0 ? (
                                <Clock className="text-white" size={16} />
                              ) : (
                                <span className="text-white text-sm">{cls.order}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{cls.title}</p>
                              <p className="text-sm text-gray-500">
                                {cls.estimatedTime} min read • {cls.activities} activities
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-400" size={20} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Bible Characters Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Bible Characters</h3>
                <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                  Special Section
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Explore the lives and lessons of key biblical figures.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {characters.slice(0, 4).map((character) => (
                  <Link key={character.id} href={`/character/${character.id}`}>
                    <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                      <p className="font-medium text-gray-900">{character.name}</p>
                      <p className="text-sm text-gray-500">{character.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
