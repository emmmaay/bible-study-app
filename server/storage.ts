import { 
  type User, 
  type InsertUser, 
  type Class, 
  type InsertClass,
  type BibleCharacter,
  type InsertCharacter,
  type UserProgress,
  type InsertProgress,
  type Bookmark,
  type InsertBookmark,
  type Note,
  type InsertNote,
  type UserWithStats
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;
  
  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getAllClasses(): Promise<Class[]>;
  getPublishedClasses(): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<Class>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;
  
  // Bible Characters
  getCharacter(id: string): Promise<BibleCharacter | undefined>;
  getAllCharacters(): Promise<BibleCharacter[]>;
  getPublishedCharacters(): Promise<BibleCharacter[]>;
  createCharacter(character: InsertCharacter): Promise<BibleCharacter>;
  updateCharacter(id: string, character: Partial<BibleCharacter>): Promise<BibleCharacter | undefined>;
  deleteCharacter(id: string): Promise<boolean>;
  
  // User Progress
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getClassProgress(userId: string, classId: string): Promise<UserProgress | undefined>;
  createProgress(progress: InsertProgress): Promise<UserProgress>;
  updateProgress(id: string, progress: Partial<UserProgress>): Promise<UserProgress | undefined>;
  
  // Bookmarks
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: string): Promise<boolean>;
  
  // Notes
  getUserNotes(userId: string): Promise<Note[]>;
  getClassNotes(userId: string, classId?: string, characterId?: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
  
  // Admin functions
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    completedClasses: number;
    averageProgress: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private classes: Map<string, Class> = new Map();
  private characters: Map<string, BibleCharacter> = new Map();
  private progress: Map<string, UserProgress> = new Map();
  private bookmarks: Map<string, Bookmark> = new Map();
  private notes: Map<string, Note> = new Map();

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create sample classes structure
    const sections = [
      { name: "Foundations of Faith", classes: 4 },
      { name: "Old Testament Study", classes: 4 },
      { name: "New Testament Study", classes: 4 },
      { name: "Christian Living", classes: 4 },
      { name: "Theology and Doctrine", classes: 4 },
      { name: "Spiritual Growth", classes: 4 }
    ];

    let classOrder = 1;
    for (const section of sections) {
      for (let i = 1; i <= section.classes; i++) {
        const classId = randomUUID();
        const classData: Class = {
          id: classId,
          title: `Class ${classOrder}: ${section.name} - Part ${i}`,
          content: `# ${section.name} - Part ${i}\n\nThis is the content for class ${classOrder}. It covers important aspects of ${section.name.toLowerCase()}.\n\n## Learning Objectives\n- Understand key concepts\n- Apply practical principles\n- Develop spiritual insights\n\n## Content\n\nDetailed lesson content would go here...`,
          section: section.name,
          order: classOrder,
          estimatedTime: 30 + Math.floor(Math.random() * 30),
          activities: Math.floor(Math.random() * 5) + 2,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.classes.set(classId, classData);
        classOrder++;
      }
    }

    // Create sample bible characters
    const characters = [
      { name: "Moses", title: "The Lawgiver", content: "Moses was chosen by God to lead the Israelites out of Egypt..." },
      { name: "David", title: "The King", content: "David was a man after God's own heart, known for his psalms..." },
      { name: "Paul", title: "The Apostle", content: "Paul was transformed from persecutor to preacher..." },
      { name: "Mary", title: "Mother of Jesus", content: "Mary exemplified faith and obedience to God's will..." },
    ];

    for (const char of characters) {
      const charId = randomUUID();
      const characterData: BibleCharacter = {
        id: charId,
        name: char.name,
        title: char.title,
        content: char.content,
        imageUrl: null,
        isPublished: true,
        createdAt: new Date(),
      };
      this.characters.set(charId, characterData);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const userProgress = Array.from(this.progress.values()).filter(p => p.userId === id);
    const completedClasses = userProgress.filter(p => p.isCompleted && p.classId).length;
    const inProgressClasses = userProgress.filter(p => !p.isCompleted && p.readingProgress > 0 && p.classId).length;
    const totalBookmarks = Array.from(this.bookmarks.values()).filter(b => b.userId === id).length;
    const totalNotes = Array.from(this.notes.values()).filter(n => n.userId === id).length;
    const totalClasses = Array.from(this.classes.values()).filter(c => c.isPublished).length;
    const progressPercentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

    return {
      ...user,
      completedClasses,
      inProgressClasses,
      totalBookmarks,
      totalNotes,
      progressPercentage,
    };
  }

  // Classes
  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getAllClasses(): Promise<Class[]> {
    return Array.from(this.classes.values()).sort((a, b) => a.order - b.order);
  }

  async getPublishedClasses(): Promise<Class[]> {
    return Array.from(this.classes.values())
      .filter(c => c.isPublished)
      .sort((a, b) => a.order - b.order);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const newClass: Class = {
      ...classData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial<Class>): Promise<Class | undefined> {
    const existingClass = this.classes.get(id);
    if (!existingClass) return undefined;

    const updatedClass = {
      ...existingClass,
      ...classData,
      updatedAt: new Date(),
    };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Bible Characters
  async getCharacter(id: string): Promise<BibleCharacter | undefined> {
    return this.characters.get(id);
  }

  async getAllCharacters(): Promise<BibleCharacter[]> {
    return Array.from(this.characters.values());
  }

  async getPublishedCharacters(): Promise<BibleCharacter[]> {
    return Array.from(this.characters.values()).filter(c => c.isPublished);
  }

  async createCharacter(character: InsertCharacter): Promise<BibleCharacter> {
    const id = randomUUID();
    const newCharacter: BibleCharacter = {
      ...character,
      id,
      createdAt: new Date(),
    };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacter(id: string, character: Partial<BibleCharacter>): Promise<BibleCharacter | undefined> {
    const existingCharacter = this.characters.get(id);
    if (!existingCharacter) return undefined;

    const updatedCharacter = { ...existingCharacter, ...character };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    return this.characters.delete(id);
  }

  // User Progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async getClassProgress(userId: string, classId: string): Promise<UserProgress | undefined> {
    return Array.from(this.progress.values()).find(p => p.userId === userId && p.classId === classId);
  }

  async createProgress(progress: InsertProgress): Promise<UserProgress> {
    const id = randomUUID();
    const newProgress: UserProgress = {
      ...progress,
      id,
      createdAt: new Date(),
    };
    this.progress.set(id, newProgress);
    return newProgress;
  }

  async updateProgress(id: string, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const existingProgress = this.progress.get(id);
    if (!existingProgress) return undefined;

    const updatedProgress = { ...existingProgress, ...progressData };
    this.progress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Bookmarks
  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(b => b.userId === userId);
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const id = randomUUID();
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      createdAt: new Date(),
    };
    this.bookmarks.set(id, newBookmark);
    return newBookmark;
  }

  async deleteBookmark(id: string): Promise<boolean> {
    return this.bookmarks.delete(id);
  }

  // Notes
  async getUserNotes(userId: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(n => n.userId === userId);
  }

  async getClassNotes(userId: string, classId?: string, characterId?: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(n => {
      if (n.userId !== userId) return false;
      if (classId && n.classId !== classId) return false;
      if (characterId && n.characterId !== characterId) return false;
      return true;
    });
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = randomUUID();
    const newNote: Note = {
      ...note,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: string, noteData: Partial<Note>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return undefined;

    const updatedNote = {
      ...existingNote,
      ...noteData,
      updatedAt: new Date(),
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Admin stats
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    completedClasses: number;
    averageProgress: number;
  }> {
    const totalUsers = this.users.size;
    const activeUsers = Array.from(this.users.values()).filter(u => {
      const userProgress = Array.from(this.progress.values()).filter(p => p.userId === u.id);
      return userProgress.some(p => p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    }).length;
    
    const completedClasses = Array.from(this.progress.values()).filter(p => p.isCompleted).length;
    const allProgress = Array.from(this.progress.values());
    const averageProgress = allProgress.length > 0 
      ? Math.round(allProgress.reduce((sum, p) => sum + p.readingProgress, 0) / allProgress.length)
      : 0;

    return {
      totalUsers,
      activeUsers,
      completedClasses,
      averageProgress,
    };
  }
}

export const storage = new MemStorage();
