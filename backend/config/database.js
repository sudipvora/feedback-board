const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'feedback_board',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool without database initially
const initialConfig = {
  ...dbConfig,
  database: undefined // Don't specify database initially
};

const initialPool = mysql.createPool(initialConfig);

// Initialize database and create tables
async function initializeDatabase() {
  try {
    // Test connection without specifying database
    const connection = await initialPool.getConnection();
    console.log('✅ Database connection established');

    // Create database if it doesn't exist (use query instead of execute)
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log('✅ Database created/verified');

    // Close initial connection
    connection.release();

    // Create new pool with the specific database
    const pool = mysql.createPool(dbConfig);
    
    // Get connection with the specific database
    const dbConnection = await pool.getConnection();

    // Create feedback table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        rating INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await dbConnection.execute(createTableQuery);
    console.log('✅ Feedback table created/verified');

    // Create indexes for better performance (handle IF NOT EXISTS gracefully)
    try {
      await dbConnection.execute('CREATE INDEX idx_rating ON feedback(rating)');
      console.log('✅ Rating index created');
    } catch (indexError) {
      if (indexError.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Rating index already exists');
      } else {
        console.log('⚠️ Rating index creation skipped:', indexError.message);
      }
    }

    try {
      await dbConnection.execute('CREATE INDEX idx_created_at ON feedback(created_at)');
      console.log('✅ Created_at index created');
    } catch (indexError) {
      if (indexError.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Created_at index already exists');
      } else {
        console.log('⚠️ Created_at index creation skipped:', indexError.message);
      }
    }

    console.log('✅ Database indexes verified');
    dbConnection.release();
    
    // Store the pool for later use
    global.dbPool = pool;
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Get database pool
function getPool() {
  return global.dbPool || initialPool;
}

module.exports = {
  initializeDatabase,
  getPool
}; 