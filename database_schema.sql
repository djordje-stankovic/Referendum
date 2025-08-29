-- Database schema for Referendum App
-- This file contains all table definitions and relationships

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    bio TEXT,
    avatar VARCHAR(500),
    municipality_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Municipalities table
CREATE TABLE IF NOT EXISTS municipalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    population INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#1976d2',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'approved', 'rejected', 'completed')),
    problem_description TEXT,
    proposed_solution TEXT,
    estimated_cost DECIMAL(12,2),
    expected_impact TEXT,
    votes JSONB DEFAULT '{"for": 0, "against": 0, "abstain": 0}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, user_id)
);

-- Proposal Contributions table (for tracking all changes)
CREATE TABLE IF NOT EXISTS proposal_contributions (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(20) NOT NULL CHECK (contribution_type IN ('edit', 'contributor', 'comment', 'file')),
    field_name VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    edit_summary TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    files_added JSONB DEFAULT '[]',
    files_removed JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposal Contributors table (for tracking who contributed to a proposal)
CREATE TABLE IF NOT EXISTS proposal_contributors (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contribution_type VARCHAR(20) DEFAULT 'contributor',
    contribution_summary TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proposal_id, user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
    contribution_id INTEGER REFERENCES proposal_contributions(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposal Files table (for file attachments)
CREATE TABLE IF NOT EXISTS proposal_files (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Proposal Comments table
CREATE TABLE IF NOT EXISTS proposal_comments (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id INTEGER REFERENCES proposal_comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposal History table (for tracking all changes to proposals)
CREATE TABLE IF NOT EXISTS proposal_history (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'status_changed', 'file_added', 'file_removed'
    field_name VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    action_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO municipalities (name, region, population) VALUES
('Beograd', 'Centralna Srbija', 1688667),
('Novi Sad', 'Vojvodina', 368967),
('Niš', 'Južna Srbija', 183164),
('Kragujevac', 'Šumadija', 150835),
('Subotica', 'Vojvodina', 105681);

INSERT INTO categories (name, description, color) VALUES
('Infrastruktura', 'Putevi, mostovi, javna osvetljenja', '#1976d2'),
('Zdravstvo', 'Bolnice, ambulante, zdravstveni centri', '#388e3c'),
('Obrazovanje', 'Škole, fakulteti, biblioteke', '#f57c00'),
('Kultura', 'Muzeji, pozorišta, kulturni centri', '#7b1fa2'),
('Sport', 'Sportski objekti, tereni, bazeni', '#d32f2f'),
('Ekologija', 'Zelenilo, reciklaža, čist vazduh', '#388e3c'),
('Transport', 'Javni prevoz, biciklističke staze', '#1976d2'),
('Sigurnost', 'Policija, vatrogasci, hitna pomoć', '#f57c00');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proposals_municipality ON proposals(municipality_id);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON proposals(category_id);
CREATE INDEX IF NOT EXISTS idx_proposals_author ON proposals(author_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_proposal ON proposal_contributions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON proposal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON proposal_contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributors_proposal ON proposal_contributors(proposal_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_history_proposal ON proposal_history(proposal_id);
CREATE INDEX IF NOT EXISTS idx_files_proposal ON proposal_files(proposal_id);
CREATE INDEX IF NOT EXISTS idx_comments_proposal ON proposal_comments(proposal_id);

