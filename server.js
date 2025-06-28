import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
    try {
        await client.connect();
        db = client.db('sngrequests');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// API Routes
app.post('/api/requests', async (req, res) => {
    try {
        const { fullName, songTitle, songArtist } = req.body;
        
        const request = {
            fullName,
            songTitle,
            songArtist,
            timestamp: new Date(),
            completed: false
        };
        
        const result = await db.collection('requests').insertOne(request);
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/requests', async (req, res) => {
    try {
        const requests = await db.collection('requests')
            .find({ completed: false })
            .sort({ timestamp: -1 })
            .toArray();
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/requests/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('requests').deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (error) {
        console.error('Error completing request:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = 'Theo12345?';
    
    if (password === adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
