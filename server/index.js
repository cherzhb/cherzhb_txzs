const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'txghzs-secret-key-2026';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../dist')));

// 初始化数据库
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password TEXT NOT NULL,
      gender INTEGER DEFAULT 1,
      birth_date TEXT,
      job_type INTEGER DEFAULT 1,
      location_code TEXT DEFAULT '110000',
      salary REAL DEFAULT 0,
      account_balance REAL DEFAULT 0,
      contribution_years INTEGER DEFAULT 0,
      contribution_index REAL DEFAULT 1.0,
      is_verified INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 验证码表
  db.run(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      phone TEXT,
      code TEXT NOT NULL,
      type TEXT DEFAULT 'register',
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 文章表
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      category TEXT DEFAULT 'policy',
      cover_image TEXT,
      view_count INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 收藏表
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )
  `);

  // 系统配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 初始化文章数据
  db.get("SELECT COUNT(*) as count FROM articles", (err, row) => {
    if (row.count === 0) {
      const articles = [
        ['2025年退休政策最新解读', '详细解析新退休政策实施细则', '<h2>2025年退休政策最新解读</h2><p>随着人口老龄化加剧，国家陆续出台了一系列退休相关政策。</p>', 'policy', 12580],
        ['退休后如何保持健康的生活方式', '专家建议：保持适度运动、合理饮食', '<h2>退休后的健康生活方式</h2><p>退休后保持健康的生活方式至关重要。</p>', 'health', 9832],
        ['退休理财规划全攻略', '从风险控制到收益最大化', '<h2>退休理财规划</h2><p>合理的理财规划可以帮助您实现财务自由。</p>', 'finance', 8765],
        ['老年常见疾病预防指南', '高血压、糖尿病等老年病的预防', '<h2>老年常见疾病预防</h2><p>预防胜于治疗。</p>', 'health', 7568],
        ['社保退休年龄最新规定', '2025年社保退休年龄规定一览', '<h2>社保退休年龄规定</h2><p>2025年社保退休年龄规定如下。</p>', 'policy', 15230]
      ];
      
      articles.forEach(article => {
        db.run(
          "INSERT INTO articles (title, summary, content, category, view_count) VALUES (?, ?, ?, ?, ?)",
          article
        );
      });
    }
  });

  // 创建默认管理员账号
  db.get("SELECT COUNT(*) as count FROM users WHERE is_admin = 1", (err, row) => {
    if (row.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        "INSERT INTO users (username, email, password, is_admin, is_verified) VALUES (?, ?, ?, 1, 1)",
        ['admin', 'admin@txghzs.com', hashedPassword]
      );
      console.log('✅ Default admin created: admin / admin123');
    }
  });
});

// 邮件发送配置
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
};

// 生成随机验证码
const generateCode = () => {
  return Math.random().toString().slice(-6);
};

// JWT 验证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
};

// 管理员验证中间件
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// ==================== 认证相关API ====================

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  const { email, phone, type = 'register' } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ error: '请提供邮箱或手机号' });
  }
  
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟有效
  
  db.run(
    "INSERT INTO verification_codes (email, phone, code, type, expires_at) VALUES (?, ?, ?, ?, ?)",
    [email, phone, code, type, expiresAt.toISOString()],
    async (err) => {
      if (err) {
        return res.status(500).json({ error: '发送验证码失败' });
      }
      
      // 发送邮件
      if (email) {
        try {
          const transporter = createTransporter();
          if (transporter.options.auth.user) {
            await transporter.sendMail({
              from: process.env.SMTP_USER || 'noreply@txghzs.com',
              to: email,
              subject: '【退休规划助手】验证码',
              html: `
                <div style="padding: 20px; background: #f5f5f5;">
                  <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #1989fa;">退休规划助手</h2>
                    <p>您的验证码是：</p>
                    <div style="font-size: 32px; font-weight: bold; color: #1989fa; letter-spacing: 8px; margin: 20px 0;">
                      ${code}
                    </div>
                    <p style="color: #999; font-size: 14px;">验证码5分钟内有效，请勿泄露给他人。</p>
                  </div>
                </div>
              `
            });
          }
        } catch (error) {
          console.error('Send email error:', error);
        }
      }
      
      res.json({ 
        message: '验证码已发送',
        // 开发环境返回验证码，生产环境应该移除
        devCode: process.env.NODE_ENV === 'development' ? code : undefined
      });
    }
  );
});

// 注册
app.post('/api/auth/register', async (req, res) => {
  const { username, email, phone, password, code } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }
  
  if (!email && !phone) {
    return res.status(400).json({ error: '请提供邮箱或手机号' });
  }
  
  // 验证验证码
  if (code) {
    db.get(
      "SELECT * FROM verification_codes WHERE (email = ? OR phone = ?) AND code = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
      [email, phone, code, new Date().toISOString()],
      async (err, row) => {
        if (!row) {
          return res.status(400).json({ error: '验证码无效或已过期' });
        }
        
        // 标记验证码已使用
        db.run("UPDATE verification_codes SET used = 1 WHERE id = ?", [row.id]);
        
        // 创建用户
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
          "INSERT INTO users (username, email, phone, password, is_verified) VALUES (?, ?, ?, ?, 1)",
          [username, email, phone, hashedPassword],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: '用户名已存在' });
              }
              return res.status(500).json({ error: '注册失败' });
            }
            
            const token = jwt.sign({ id: this.lastID, username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ message: '注册成功', token, user: { id: this.lastID, username, email, phone } });
          }
        );
      }
    );
  } else {
    // 无验证码注册（开发模式）
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)",
      [username, email, phone, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '用户名已存在' });
          }
          return res.status(500).json({ error: '注册失败' });
        }
        
        const token = jwt.sign({ id: this.lastID, username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: '注册成功', token, user: { id: this.lastID, username, email, phone } });
      }
    );
  }
});

// 登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }
  
  db.get(
    "SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?",
    [username, username, username],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.is_admin === 1 },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          isAdmin: user.is_admin === 1
        }
      });
    }
  );
});

// 获取当前用户信息
app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get("SELECT id, username, email, phone, gender, birth_date, job_type, location_code, salary, account_balance, contribution_years, contribution_index, is_verified, is_admin FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  });
});

// 更新用户档案
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { gender, birth_date, job_type, location_code, salary, account_balance, contribution_years, contribution_index } = req.body;
  
  db.run(
    `UPDATE users SET 
      gender = ?, birth_date = ?, job_type = ?, location_code = ?, 
      salary = ?, account_balance = ?, contribution_years = ?, contribution_index = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [gender, birth_date, job_type, location_code, salary, account_balance, contribution_years, contribution_index, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '更新失败' });
      }
      res.json({ message: '档案已更新' });
    }
  );
});

// 注销账号
app.delete('/api/auth/account', authMiddleware, (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.user.id], (err) => {
    if (err) {
      return res.status(500).json({ error: '注销失败' });
    }
    res.json({ message: '账号已注销' });
  });
});

// ==================== 文章相关API ====================

// 获取文章列表
app.get('/api/articles', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = "SELECT id, title, summary, category, cover_image, view_count, created_at FROM articles WHERE is_published = 1";
  let params = [];
  
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  
  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);
  
  db.all(sql, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: '获取文章列表失败' });
    }
    res.json(articles);
  });
});

// 获取文章详情
app.get('/api/articles/:id', (req, res) => {
  db.get("SELECT * FROM articles WHERE id = ?", [req.params.id], (err, article) => {
    if (err || !article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加浏览量
    db.run("UPDATE articles SET view_count = view_count + 1 WHERE id = ?", [req.params.id]);
    
    res.json(article);
  });
});

// ==================== 收藏相关API ====================

// 获取收藏列表
app.get('/api/favorites', authMiddleware, (req, res) => {
  db.all(
    `SELECT f.id as favorite_id, a.* FROM favorites f 
     JOIN articles a ON f.article_id = a.id 
     WHERE f.user_id = ? 
     ORDER BY f.created_at DESC`,
    [req.user.id],
    (err, favorites) => {
      if (err) {
        return res.status(500).json({ error: '获取收藏失败' });
      }
      res.json(favorites);
    }
  );
});

// 添加收藏
app.post('/api/favorites', authMiddleware, (req, res) => {
  const { article_id } = req.body;
  
  db.run(
    "INSERT INTO favorites (user_id, article_id) VALUES (?, ?)",
    [req.user.id, article_id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '收藏失败' });
      }
      res.json({ message: '已收藏' });
    }
  );
});

// 取消收藏
app.delete('/api/favorites/:article_id', authMiddleware, (req, res) => {
  db.run(
    "DELETE FROM favorites WHERE user_id = ? AND article_id = ?",
    [req.user.id, req.params.article_id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '取消收藏失败' });
      }
      res.json({ message: '已取消收藏' });
    }
  );
});

// ==================== 管理员API ====================

// 获取所有用户
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  db.all("SELECT id, username, email, phone, gender, birth_date, job_type, is_verified, is_admin, created_at FROM users", (err, users) => {
    if (err) {
      return res.status(500).json({ error: '获取用户列表失败' });
    }
    res.json(users);
  });
});

// 删除用户
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: '删除用户失败' });
    }
    res.json({ message: '用户已删除' });
  });
});

// 创建文章
app.post('/api/admin/articles', authMiddleware, adminMiddleware, (req, res) => {
  const { title, summary, content, category, cover_image, is_published } = req.body;
  
  db.run(
    "INSERT INTO articles (title, summary, content, category, cover_image, is_published, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, summary, content, category, cover_image, is_published ? 1 : 0, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '创建文章失败' });
      }
      res.json({ message: '文章已创建', id: this.lastID });
    }
  );
});

// 更新文章
app.put('/api/admin/articles/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { title, summary, content, category, cover_image, is_published } = req.body;
  
  db.run(
    "UPDATE articles SET title = ?, summary = ?, content = ?, category = ?, cover_image = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, summary, content, category, cover_image, is_published ? 1 : 0, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: '更新文章失败' });
      }
      res.json({ message: '文章已更新' });
    }
  );
});

// 删除文章
app.delete('/api/admin/articles/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.run("DELETE FROM articles WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: '删除文章失败' });
    }
    res.json({ message: '文章已删除' });
  });
});

// 获取统计数据
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  const stats = {};
  
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    stats.users = row?.count || 0;
    
    db.get("SELECT COUNT(*) as count FROM articles", (err, row) => {
      stats.articles = row?.count || 0;
      
      db.get("SELECT SUM(view_count) as total FROM articles", (err, row) => {
        stats.totalViews = row?.total || 0;
        
        res.json(stats);
      });
    });
  });
});

// 获取系统配置
app.get('/api/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  db.all("SELECT * FROM settings", (err, settings) => {
    if (err) {
      return res.status(500).json({ error: '获取配置失败' });
    }
    const result = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    res.json(result);
  });
});

// 更新系统配置
app.put('/api/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  const settings = req.body;
  
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  Object.entries(settings).forEach(([key, value]) => {
    stmt.run(key, value);
  });
  stmt.finalize();
  
  res.json({ message: '配置已更新' });
});

// SPA 回退 - 所有其他路由返回前端
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 退休规划助手后端服务已启动`);
  console.log(`📡 API地址: http://localhost:${PORT}/api`);
  console.log(`🌐 前端地址: http://localhost:${PORT}`);
  console.log(`👤 管理员账号: admin / admin123\n`);
});
