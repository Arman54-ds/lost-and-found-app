// ================= IMPORTS =================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const upload = require('./middleware/upload');

const app = express();

// ================= EMAIL TRANSPORTER =================
// ================= EMAIL CONFIGURATION =================
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin_email@gmail.com'; 
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin_app_password';    

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ADMIN_EMAIL,
    pass: ADMIN_PASS
  }
});

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// ================= MYSQL CONNECTION =================
const dbConfig = process.env.DATABASE_URL || {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arman@5403',
  database: process.env.DB_NAME || 'lostfound_db'
};

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
    return;
  }
  console.log('✅ MySQL Connected');
});

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});


// =====================================================
// ================= AUTH ROUTES =======================
// =====================================================

// ✅ REGISTER
app.post('/api/auth/register', (req, res) => {

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userRole = role === "admin" ? "admin" : "user";

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, password, userRole], (err) => {
    if (err) {
      console.log(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Email already registered" });
      }
      return res.status(500).json({ message: "Registration failed" });
    }

    res.json({ message: "User registered successfully" });
  });
});


// ✅ LOGIN
app.post('/api/auth/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email=? AND password=?";

  db.query(sql, [email, password], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result[0];

    res.json({
      message: "Login success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});


// =====================================================
// ================= LOST ITEMS ========================
// =====================================================

// ✅ ADD LOST ITEM (with image upload)
app.post('/api/lost', upload.single('image'), (req, res) => {
  const { title, description, location, user_id, dateLost } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  if (!title || !location || !user_id) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO lost_items (title, description, location, user_id, created_at, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, description || null, location, user_id, dateLost || new Date(), imagePath], (err) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Lost item added successfully" });
  });
});

// ✅ GET LOST ITEMS BY USER
app.get('/api/lost/user/:id', (req, res) => {

  const userId = req.params.id;

  const sql = "SELECT * FROM lost_items WHERE user_id = ? ORDER BY id DESC";

  db.query(sql, [userId], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});


// =====================================================
// ================= FOUND ITEMS =======================
// =====================================================

// ✅ ADD FOUND ITEM (with image upload)
app.post('/api/found', upload.single('image'), (req, res) => {
  const { title, description, location, user_id, dateFound } = req.body;
  const imagePath = req.file ? req.file.filename : null;

  if (!title || !location || !user_id) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql = `
    INSERT INTO found_items (title, description, location, user_id, created_at, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, description || null, location, user_id, dateFound || new Date(), imagePath], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Found item added successfully" });
  });
});


// ✅ GET FOUND ITEMS BY USER
app.get('/api/found/user/:id', (req, res) => {

  const userId = req.params.id;

  const sql = "SELECT * FROM found_items WHERE user_id = ? ORDER BY id DESC";

  db.query(sql, [userId], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});


// =====================================================
// ================= ADMIN ROUTES ======================
// =====================================================

// ✅ VIEW ALL MATCHES
app.get('/api/admin/matches', (req, res) => {
  const sql = `
    SELECT 
      l.id AS lost_id, l.title AS lost_title, l.location AS lost_location, l.created_at AS date_lost, l.image AS lost_image,
      f.id AS found_id, f.title AS found_title, f.location AS found_location, f.created_at AS date_found, f.image AS found_image,
      u1.name AS lost_student, u1.email AS lost_email,
      u2.name AS found_student, u2.email AS found_email
    FROM lost_items l
    JOIN found_items f ON l.title LIKE CONCAT('%', f.title, '%') OR f.title LIKE CONCAT('%', l.title, '%')
    LEFT JOIN users u1 ON l.user_id = u1.id
    LEFT JOIN users u2 ON f.user_id = u2.id
    WHERE l.status = 'lost' AND f.status = 'unclaimed'
    ORDER BY l.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    const matches = result.map(item => {
      let score = 50;
      if (item.lost_location && item.found_location && item.lost_location.toLowerCase() === item.found_location.toLowerCase()) {
        score += 50;
      }
      return { ...item, match_score: score + '%' };
    });

    res.json(matches);
  });
});

// ✅ VIEW UNMATCHED ITEMS
app.get('/api/admin/unmatched', (req, res) => {
  const sqlMatched = `
    SELECT l.id AS lost_id, f.id AS found_id
    FROM lost_items l
    JOIN found_items f ON l.title LIKE CONCAT('%', f.title, '%') OR f.title LIKE CONCAT('%', l.title, '%')
    WHERE l.status = 'lost' AND f.status = 'unclaimed'
  `;

  db.query(sqlMatched, (err, matches) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const matchedLostIds = matches.length ? matches.map(m => m.lost_id) : [0];
    const matchedFoundIds = matches.length ? matches.map(m => m.found_id) : [0];

    const sqlLost = `
      SELECT 'Lost' as type, l.title, l.location, l.created_at as date, l.image, u.name as reported_by
      FROM lost_items l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.status = 'lost' AND l.id NOT IN (?)
    `;
    const sqlFound = `
      SELECT 'Found' as type, f.title, f.location, f.created_at as date, f.image, u.name as reported_by
      FROM found_items f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.status = 'unclaimed' AND f.id NOT IN (?)
    `;

    db.query(sqlLost, [matchedLostIds], (errL, lostResults) => {
      if (errL) return res.status(500).json({ message: "Database error" });

      db.query(sqlFound, [matchedFoundIds], (errF, foundResults) => {
        if (errF) return res.status(500).json({ message: "Database error" });

        res.json([...lostResults, ...foundResults]);
      });
    });
  });
});

// ✅ APPROVE MATCH
app.post('/api/admin/match/approve', (req, res) => {
  const { lost_id, found_id } = req.body;
  if (!lost_id || !found_id) return res.status(400).json({ message: "Missing IDs" });

  const sqlLost = "UPDATE lost_items SET status = 'found' WHERE id = ?";
  const sqlFound = "UPDATE found_items SET status = 'claimed' WHERE id = ?";

  db.query(sqlLost, [lost_id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });

    db.query(sqlFound, [found_id], (err2) => {
      if (err2) return res.status(500).json({ message: "Database error" });

      // Fetch user emails to notify them
      const sqlEmails = `
        SELECT u1.email as lost_email, u1.name as lost_name, l.title as lost_title,
               u2.email as found_email, u2.name as found_name, f.title as found_title
        FROM lost_items l
        LEFT JOIN users u1 ON l.user_id = u1.id
        JOIN found_items f ON f.id = ?
        LEFT JOIN users u2 ON f.user_id = u2.id
        WHERE l.id = ?
      `;

      db.query(sqlEmails, [found_id, lost_id], async (err3, results) => {
        if (err3 || results.length === 0) {
          console.log("Email fetch error:", err3);
          return res.json({ message: "Match approved, but failed to send notifications" });
        }

        const data = results[0];

        // Send email to the person who lost the item
        const lostMailOptions = {
          from: ADMIN_EMAIL,
          to: data.lost_email,
          subject: 'Good News! Your Lost Item Match Found',
          text: `Hi ${data.lost_name},\n\nGood news! A potential match for your lost item "${data.lost_title}" has been approved by the admin.\n\nYou can contact the person who found your item at: ${data.found_email}\n\nPlease coordinate with them to retrieve your item.\n\nBest regards,\nLost & Found Team`
        };

        // Send email to the person who found the item
        const foundMailOptions = {
          from: ADMIN_EMAIL,
          to: data.found_email,
          subject: 'Item Match Approved',
          text: `Hi ${data.found_name},\n\nThe item "${data.found_title}" you found has been matched with a lost report and approved by the admin. Thank you for your honesty!\n\nBest regards,\nLost & Found Team`
        };

        // Send emails and wait for completion
        try {
          await transporter.sendMail(lostMailOptions);
          await transporter.sendMail(foundMailOptions);
          res.json({ message: "Match approved and notifications sent successfully! ✅" });
        } catch (mailError) {
          console.error("Email Sending Error:", mailError);
          res.status(500).json({
            message: "Match approved in database, but failed to send emails. Check your server credentials.",
            error: mailError.message
          });
        }
      });
    });
  });
});


// ✅ VIEW ALL LOST
app.get('/api/admin/lost', (req, res) => {

  const sql = `
    SELECT lost_items.*, users.name 
    FROM lost_items 
    JOIN users ON lost_items.user_id = users.id
    ORDER BY lost_items.id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});


// ✅ VIEW ALL FOUND
app.get('/api/admin/found', (req, res) => {

  const sql = `
    SELECT found_items.*, users.name 
    FROM found_items 
    JOIN users ON found_items.user_id = users.id
    ORDER BY found_items.id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});


// ✅ VIEW ALL USERS
app.get('/api/admin/users', (req, res) => {

  db.query("SELECT * FROM users", (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(result);
  });
});


// ✅ DELETE USER
app.delete('/api/admin/user/:id', (req, res) => {

  db.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Delete failed" });
    }

    res.json({ message: "User deleted successfully" });
  });
});


// =====================================================
// ================= EMAIL NOTIFICATION ================
// =====================================================

// ✅ SEND CUSTOM EMAIL
app.post('/api/admin/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const mailOptions = {
    from: ADMIN_EMAIL,
    to,
    subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error('Send Email Error:', error);
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
});


// =====================================================
// ================= START SERVER ======================
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});