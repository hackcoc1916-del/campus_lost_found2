import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// ─── Cloudinary Config ──────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const MONGODB_URI = process.env.MONGODB_URI || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Mongoose Models ────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  photoURL: { type: String, default: '' },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
});

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedByName: { type: String, required: true },
  reportedByPhoto: { type: String, default: '' },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantNames: { type: Map, of: String },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemTitle: { type: String, required: true },
  lastMessage: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

// ─── Auth Middleware ────────────────────────────────────────────
interface AuthRequest extends express.Request {
  userId?: string;
}

const authMiddleware = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Multer Config (memory storage for Cloudinary) ─────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

// ─── AUTH ROUTES ────────────────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      res.status(400).json({ error: 'access_token required' });
      return;
    }

    // Fetch user info from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!googleRes.ok) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }
    const googleUser = await googleRes.json();

    // Create or update user
    let user = await User.findOne({ googleId: googleUser.sub });
    if (!user) {
      user = await User.create({
        googleId: googleUser.sub,
        name: googleUser.name || 'Anonymous',
        email: googleUser.email || '',
        photoURL: googleUser.picture || '',
        role: 'student',
      });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ITEM ROUTES ────────────────────────────────────────────────
app.get('/api/items', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reportedBy } = req.query;
    const filter: any = {};
    if (reportedBy) filter.reportedBy = reportedBy;

    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();
    // Convert ObjectIds to strings for frontend compatibility
    const mapped = items.map((item) => ({
      ...item,
      id: item._id.toString(),
      reportedBy: item.reportedBy.toString(),
    }));
    res.json(mapped);
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/:id', authMiddleware, async (_req, res) => {
  try {
    const item = await Item.findById(_req.params.id).lean();
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ ...item, id: item._id.toString(), reportedBy: item.reportedBy.toString() });
  } catch {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

app.post('/api/items', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const item = await Item.create({
      ...req.body,
      reportedBy: req.userId,
    });
    res.status(201).json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.put('/api/items/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    item.status = req.body.status;
    await item.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ─── UPLOAD ROUTE (Cloudinary) ──────────────────────────────────
app.post('/api/upload', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'campus-lost-found', resource_type: 'image' },
    (error, result) => {
      if (error || !result) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: 'Image upload failed' });
        return;
      }
      res.json({ imageUrl: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

// ─── CHAT ROUTES ────────────────────────────────────────────────
app.get('/api/chats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const chats = await Chat.find({ participants: new mongoose.Types.ObjectId(req.userId) })
      .sort({ updatedAt: -1 })
      .lean();
    const mapped = chats.map((c) => ({
      ...c,
      id: c._id.toString(),
      participants: c.participants.map((p: any) => p.toString()),
      participantNames: c.participantNames instanceof Map ? Object.fromEntries(c.participantNames) : (c.participantNames || {}),
    }));
    res.json(mapped);
  } catch (error) {
    console.error('GET /api/chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

app.post('/api/chats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { itemId, itemTitle, otherUserId, otherUserName, currentUserName } = req.body;
    console.log('--- POST /api/chats ---');
    console.log('req.userId:', req.userId, typeof req.userId);
    console.log('otherUserId:', otherUserId, typeof otherUserId);

    // Check if chat already exists
    const existing = await Chat.findOne({
      participants: { $all: [new mongoose.Types.ObjectId(req.userId), new mongoose.Types.ObjectId(otherUserId)] },
      itemId: new mongoose.Types.ObjectId(itemId),
    });

    if (existing) {
      res.json({
        ...existing.toObject(),
        id: existing._id.toString(),
        participantNames: existing.participantNames instanceof Map ? Object.fromEntries(existing.participantNames) : (existing.participantNames || {}),
      });
      return;
    }

    const chat = await Chat.create({
      participants: [req.userId, otherUserId],
      participantNames: new Map([
        [req.userId!, currentUserName],
        [otherUserId, otherUserName],
      ]),
      itemId,
      itemTitle,
      lastMessage: '',
      updatedAt: new Date(),
    });

    res.status(201).json({
      ...chat.toObject(),
      id: chat._id.toString(),
      participantNames: chat.participantNames instanceof Map ? Object.fromEntries(chat.participantNames) : (chat.participantNames || {}),
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// ─── MESSAGE ROUTES ─────────────────────────────────────────────
app.get('/api/messages/:chatId', authMiddleware, async (_req, res) => {
  try {
    const messages = await Message.find({ chatId: _req.params.chatId })
      .sort({ createdAt: 1 })
      .lean();
    const mapped = messages.map((m) => ({ ...m, id: m._id.toString(), senderId: m.senderId.toString() }));
    res.json(mapped);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { chatId, text } = req.body;

    const message = await Message.create({
      chatId,
      senderId: req.userId,
      text,
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: new Date(),
    });

    res.status(201).json({ ...message.toObject(), id: message._id.toString() });
  } catch {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ─── AI SMART MATCH ROUTE ───────────────────────────────────────
app.post('/api/ai-match/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const lostItem = await Item.findById(req.params.id).lean();
    if (!lostItem) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const foundItems = await Item.find({ type: 'found', status: 'active' }).lean();
    if (foundItems.length === 0) {
      res.json([]);
      return;
    }

    const foundSummary = foundItems.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      date: item.date,
    }));

    const prompt = `You are a lost-and-found matching assistant for a university campus.

LOST ITEM:
- Title: ${lostItem.title}
- Description: ${lostItem.description}
- Category: ${lostItem.category}
- Location lost: ${lostItem.location}
- Date lost: ${lostItem.date}

FOUND ITEMS DATABASE:
${JSON.stringify(foundSummary, null, 2)}

Compare each found item against the lost item. Assign a similarity score 0-100.
Only include items with score above 25. Sort by score descending.

Return ONLY a valid JSON array (no markdown):
[{"itemId":"id","score":85,"explanation":"Brief reason"}]

If no items match, return: []`;

    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      res.json([]);
      return;
    }

    const matches = JSON.parse(jsonMatch[0]);

    // Attach full item data to matches
    const enriched = matches
      .map((match: any) => {
        const foundItem = foundItems.find((i) => i._id.toString() === match.itemId);
        if (!foundItem) return null;
        return {
          ...match,
          matchedItem: { ...foundItem, id: foundItem._id.toString() },
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    res.json(enriched);
  } catch (error) {
    console.error('AI Match error:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// ─── START SERVER ───────────────────────────────────────────────
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env file!');
  console.log('   Please set up MongoDB Atlas and add the connection string.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
