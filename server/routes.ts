import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { 
  insertUserSchema, 
  loginSchema,
  insertClassSchema,
  insertCharacterSchema,
  insertProgressSchema,
  insertBookmarkSchema,
  insertNoteSchema,
  type User 
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "bible-study-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check super admin role
const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    const userWithStats = await storage.getUserWithStats(req.user.id);
    res.json({ ...userWithStats, password: undefined });
  });

  // Classes routes
  app.get("/api/classes", authenticateToken, async (req, res) => {
    const classes = await storage.getPublishedClasses();
    res.json(classes);
  });

  app.get("/api/classes/:id", authenticateToken, async (req, res) => {
    const classData = await storage.getClass(req.params.id);
    if (!classData || !classData.isPublished) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classData);
  });

  app.post("/api/classes", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.json(newClass);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/classes/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const updatedClass = await storage.updateClass(req.params.id, updates);
      if (!updatedClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(updatedClass);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/classes/:id", authenticateToken, requireAdmin, async (req, res) => {
    const deleted = await storage.deleteClass(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class deleted successfully" });
  });

  // Bible Characters routes
  app.get("/api/characters", authenticateToken, async (req, res) => {
    const characters = await storage.getPublishedCharacters();
    res.json(characters);
  });

  app.get("/api/characters/:id", authenticateToken, async (req, res) => {
    const character = await storage.getCharacter(req.params.id);
    if (!character || !character.isPublished) {
      return res.status(404).json({ message: "Character not found" });
    }
    res.json(character);
  });

  app.post("/api/characters", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse(req.body);
      const newCharacter = await storage.createCharacter(characterData);
      res.json(newCharacter);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Progress routes
  app.get("/api/progress", authenticateToken, async (req, res) => {
    const progress = await storage.getUserProgress(req.user.id);
    res.json(progress);
  });

  app.post("/api/progress", authenticateToken, async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Check if progress already exists
      if (progressData.classId) {
        const existing = await storage.getClassProgress(req.user.id, progressData.classId);
        if (existing) {
          const updated = await storage.updateProgress(existing.id, progressData);
          return res.json(updated);
        }
      }
      
      const newProgress = await storage.createProgress(progressData);
      res.json(newProgress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/progress/:id", authenticateToken, async (req, res) => {
    try {
      const updates = req.body;
      const updatedProgress = await storage.updateProgress(req.params.id, updates);
      if (!updatedProgress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(updatedProgress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bookmarks routes
  app.get("/api/bookmarks", authenticateToken, async (req, res) => {
    const bookmarks = await storage.getUserBookmarks(req.user.id);
    res.json(bookmarks);
  });

  app.post("/api/bookmarks", authenticateToken, async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const newBookmark = await storage.createBookmark(bookmarkData);
      res.json(newBookmark);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/bookmarks/:id", authenticateToken, async (req, res) => {
    const deleted = await storage.deleteBookmark(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    res.json({ message: "Bookmark deleted successfully" });
  });

  // Notes routes
  app.get("/api/notes", authenticateToken, async (req, res) => {
    const { classId, characterId } = req.query;
    const notes = await storage.getClassNotes(
      req.user.id, 
      classId as string, 
      characterId as string
    );
    res.json(notes);
  });

  app.post("/api/notes", authenticateToken, async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const newNote = await storage.createNote(noteData);
      res.json(newNote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/notes/:id", authenticateToken, async (req, res) => {
    try {
      const updates = req.body;
      const updatedNote = await storage.updateNote(req.params.id, updates);
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(updatedNote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/notes/:id", authenticateToken, async (req, res) => {
    const deleted = await storage.deleteNote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  });

  // Create first admin (only if no admins exist)
  app.post("/api/admin/create-first", async (req, res) => {
    try {
      const { email, password, name, secretKey } = req.body;
      
      // Check secret key to prevent unauthorized admin creation
      if (secretKey !== process.env.ADMIN_SETUP_SECRET) {
        return res.status(403).json({ message: "Invalid setup secret" });
      }
      
      // Check if any admin already exists
      const existingAdmins = await storage.getAllUsers();
      const hasAdmin = existingAdmins.some(u => u.role === 'admin' || u.role === 'super_admin');
      
      if (hasAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }
      
      // Create first admin
      const userData = { email, password, name, role: 'super_admin' as const };
      const admin = await storage.createUser(userData);
      
      res.json({ message: "First admin created successfully", admin: { ...admin, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/users", authenticateToken, requireSuperAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithoutPassword = users.map(u => ({ ...u, password: undefined }));
    res.json(usersWithoutPassword);
  });

  app.get("/api/admin/classes", authenticateToken, requireAdmin, async (req, res) => {
    const classes = await storage.getAllClasses();
    res.json(classes);
  });

  const httpServer = createServer(app);
  return httpServer;
}
