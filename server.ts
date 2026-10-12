import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Persistent server-side works database file
const worksDbPath = path.join(uploadsDir, 'works.json');

// Serve uploaded media files publicly (with support for HTTP Range requests for MP4 streaming)
app.use(
  '/uploads',
  express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      }
    },
  })
);

// Serve public static assets & images
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/src/assets', express.static(path.join(__dirname, 'src/assets')));

// Configure multer for file uploads (supports videos up to 250MB)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB limit
});

// Direct upload API endpoint for student projects (MP4, PDF, EPUB, Audio, Images)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei empfangen' });
  }

  // Public URL that anyone on the web can open without password or Microsoft account
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Server-side persistent storage for works
app.get('/api/works', (_req, res) => {
  try {
    if (fs.existsSync(worksDbPath)) {
      const data = fs.readFileSync(worksDbPath, 'utf8');
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (e) {
    console.error('Error reading works database:', e);
    return res.json([]);
  }
});

app.post('/api/works', (req, res) => {
  try {
    const newWork = req.body;
    if (!newWork || !newWork.id) {
      return res.status(400).json({ error: 'Ungültiges Werk' });
    }

    let existingWorks: any[] = [];
    if (fs.existsSync(worksDbPath)) {
      try {
        existingWorks = JSON.parse(fs.readFileSync(worksDbPath, 'utf8'));
      } catch {}
    }

    // Upsert work: if exists update, otherwise prepend at the top
    const index = existingWorks.findIndex((w: any) => w.id === newWork.id);
    if (index >= 0) {
      existingWorks[index] = newWork;
    } else {
      existingWorks.unshift(newWork);
    }

    fs.writeFileSync(worksDbPath, JSON.stringify(existingWorks, null, 2), 'utf8');
    return res.json({ success: true, work: newWork, total: existingWorks.length });
  } catch (e: any) {
    console.error('Error saving work to server database:', e);
    return res.status(500).json({ error: e?.message || 'Serverfehler beim Speichern' });
  }
});

// Helper endpoint: Auto-detect title, description, author, and cover image from any link (Book Creator, YouTube, OneDrive etc.)
app.get('/api/fetch-link-metadata', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL query parameter required' });
  }

  try {
    // Fast path: Scratch projects
    const scratchMatch = targetUrl.match(/scratch\.mit\.edu\/projects\/(\d+)/i) || targetUrl.match(/turbowarp\.org\/(?:embed\/)?(\d+)/i);
    if (scratchMatch) {
      const pId = scratchMatch[1];
      const cover = `https://uploads.scratch.mit.edu/get_image/project/${pId}_480x360.png`;
      let pTitle = `Scratch Projekt #${pId}`;
      let pDesc = 'Interaktives Scratch-Spiel aus DIE SCAPES der Schule Saatlen.';

      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        const html = await response.text();
        const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
        const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i);
        if (ogTitle) {
          pTitle = ogTitle[1].replace(' on Scratch', '').trim();
        }
        if (ogDesc) {
          pDesc = ogDesc[1].trim();
        }
      } catch {}

      return res.json({
        title: pTitle,
        description: pDesc,
        coverImage: cover,
        author: '',
        tool: 'Scratch & Interaktiv',
        rubrikId: 'games',
      });
    }

    // Fast path: Lichess (Schach)
    const lichessMatch = targetUrl.match(/lichess\.org\/(?:embed\/game\/|study\/)?([a-zA-Z0-9]{8,12})/i);
    if (lichessMatch) {
      return res.json({
        title: 'Interaktive Schachpartie',
        description: 'Schachspiel und Denksportaufgabe auf Lichess.',
        coverImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
        author: '',
        tool: 'Scratch & Interaktiv',
        rubrikId: 'games',
      });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = await response.text();

    // 1. Special check for Book Creator Next.js payload
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const book = nextData.props?.pageProps?.book;
        if (book) {
          const cover =
            book.userId && book.id
              ? `https://assets.api.bookcreator.com/${book.userId}/books/${book.id}/cover/share`
              : '';
          return res.json({
            title: book.title || 'Vorlage Scapefolio',
            description: `Interaktives Buch & Portfolio aus den SCAPES der Schule Saatlen. Erstellt mit Book Creator (${book.contents?.length || 1} Doppelseiten).`,
            author: book.author || 'Vuong Loan (KfK)',
            authorId: 'Sternfuchs-42',
            coverImage: cover,
            tool: 'Book Creator',
          });
        }
      } catch (parseErr) {
        console.warn('Next data parse error:', parseErr);
      }
    }

    // 2. OpenGraph & Meta tags
    const titleMatch =
      html.match(/<meta property="og:title" content="([^"]+)"/i) ||
      html.match(/<meta name="twitter:title" content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    const descMatch =
      html.match(/<meta property="og:description" content="([^"]+)"/i) ||
      html.match(/<meta name="description" content="([^"]+)"/i) ||
      html.match(/<meta name="twitter:description" content="([^"]+)"/i);

    const imgMatch =
      html.match(/<meta property="og:image" content="([^"]+)"/i) ||
      html.match(/<meta name="twitter:image" content="([^"]+)"/i);

    return res.json({
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : '',
      coverImage: imgMatch ? imgMatch[1].trim() : '',
      author: '',
    });
  } catch (err: any) {
    console.warn('Metadata fetch error for', targetUrl, err?.message);
    return res.json({ title: '', description: '', coverImage: '' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Scapestudio server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
