-- Hostinger MySQL schema for influencer-training-chat (MVP)
-- 注意：这里的类型/索引适配 MySQL 8+。

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('agent','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS influencers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(255) NOT NULL,
  platform VARCHAR(32) NOT NULL,
  follower_band VARCHAR(16) NOT NULL,
  avg_price_eur DECIMAL(10,2) NOT NULL,
  persona_prompt TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS influencer_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  influencer_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('active','completed') NOT NULL,
  collaboration_round INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_influencer (influencer_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_sessions_influencer FOREIGN KEY (influencer_id) REFERENCES influencers(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_session (session_id),
  CONSTRAINT fk_messages_session FOREIGN KEY (session_id) REFERENCES influencer_sessions(id)
);

CREATE TABLE IF NOT EXISTS evaluation_runs (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  overall_score INT NOT NULL,
  spanish_grammar JSON NOT NULL,
  price_reasonableness JSON NOT NULL,
  negotiation_skill JSON NOT NULL,
  professionalism JSON NOT NULL,
  goal_achieved JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluation_session FOREIGN KEY (session_id) REFERENCES influencer_sessions(id),
  INDEX idx_evaluation_session (session_id)
);

CREATE TABLE IF NOT EXISTS academy_progress (
  user_id VARCHAR(36) PRIMARY KEY,
  completed_json JSON NOT NULL,
  scores_json JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_academy_user FOREIGN KEY (user_id) REFERENCES users(id)
);

