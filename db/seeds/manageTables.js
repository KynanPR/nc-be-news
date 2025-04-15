const db = require("../connection");

const dropTables = async () => {
  return db.query(`
    DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS articles;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS topics;
  `);
};

const createTables = async () => {
  return db.query(`
    CREATE TABLE topics (
      slug VARCHAR(20) PRIMARY KEY,
      description VARCHAR(100) NOT NULL,
      img_url VARCHAR(1000)
    );
    CREATE TABLE users (
      username VARCHAR(50) PRIMARY KEY,
      name VARCHAR NOT NULL,
      avatar_url VARCHAR(1000)
    );
    CREATE TABLE articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      topic VARCHAR,
      FOREIGN KEY (topic) REFERENCES topics(slug) ON DELETE SET NULL,
      author VARCHAR NOT NULL,
      FOREIGN KEY (author) REFERENCES users(username) ON DELETE CASCADE,
      body TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      votes int NOT NULL DEFAULT 0,
      article_img_url VARCHAR(1000)
    );
    CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      article_id INT NOT NULL,
      FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
      body TEXT,
      votes INT NOT NULL DEFAULT 0,
      author VARCHAR NOT NULL,
      FOREIGN KEY (author) REFERENCES users(username) ON DELETE CASCADE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

  `);
};

module.exports = { dropTables, createTables };
