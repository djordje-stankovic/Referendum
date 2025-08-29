-- -- Kreiranje tabele za opštine
-- CREATE TABLE municipalities (
--     municipality_id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     region VARCHAR(100),
--     population INT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Kreiranje tabele za korisnike
-- CREATE TABLE users (
--     user_id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     full_name VARCHAR(100),
--     first_name VARCHAR(50) NOT NULL,
--     last_name VARCHAR(50) NOT NULL,
--     bio TEXT,
--     avatar VARCHAR(500),
--     municipality_id INT REFERENCES municipalities(municipality_id),
--     role VARCHAR(20) DEFAULT 'user', -- Zamena ENUM za fleksibilnost
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Kreiranje tabele za ankete/predloge
-- CREATE TABLE surveys (
--     survey_id SERIAL PRIMARY KEY,
--     title VARCHAR(200) NOT NULL,
--     summary TEXT,
--     details JSONB, -- JSONB za PostgreSQL, može se zameniti sa TEXT za MySQL
--     media JSONB, -- Lista medija
--     creator_id INT NOT NULL REFERENCES users(user_id),
--     municipality_id INT NOT NULL REFERENCES municipalities(municipality_id),
--     status VARCHAR(20) DEFAULT 'pending', -- Zamena ENUM
--     votes_for INT DEFAULT 0,
--     votes_against INT DEFAULT 0,
--     votes_abstain INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Kreiranje tabele za kontribucije
-- CREATE TABLE contributions (
--     contribution_id SERIAL PRIMARY KEY,
--     survey_id INT NOT NULL REFERENCES surveys(survey_id),
--     contributor_id INT NOT NULL REFERENCES users(user_id),
--     content TEXT NOT NULL,
--     status VARCHAR(20) DEFAULT 'pending', -- Zamena ENUM
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Kreiranje tabele za praćenje aktivnosti korisnika
-- CREATE TABLE user_contributions (
--     user_contribution_id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL REFERENCES users(user_id),
--     survey_id INT REFERENCES surveys(survey_id),
--     contribution_id INT REFERENCES contributions(contribution_id),
--     action_type VARCHAR(50) NOT NULL, -- 'created_survey' ili 'added_contribution'
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Kreiranje tabele za obaveštenja
-- CREATE TABLE notifications (
--     notification_id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL REFERENCES users(user_id),
--     survey_id INT REFERENCES surveys(survey_id),
--     contribution_id INT REFERENCES contributions(contribution_id),
--     message TEXT NOT NULL,
--     is_read BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Kreiranje tabele za komentare
-- CREATE TABLE comments (
--     comment_id SERIAL PRIMARY KEY,
--     survey_id INT NOT NULL REFERENCES surveys(survey_id),
--     user_id INT NOT NULL REFERENCES users(user_id),
--     content TEXT NOT NULL,
--     parent_comment_id INT REFERENCES comments(comment_id),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Dodavanje inicijalnih podataka za testiranje
-- INSERT INTO municipalities (name, region, population) VALUES
-- ('Novi Sad', 'Vojvodina', 300000),
-- ('Beograd', 'Beogradski okrug', 1700000);

-- INSERT INTO users (username, email, password_hash, full_name, municipality_id) VALUES
-- ('user123', 'user123@example.com', '$2b$10$...hashed_password...', 'User One', 1),
-- ('citizen456', 'citizen456@example.com', '$2b$10$...hashed_password...', 'Citizen Two', 2);

-- INSERT INTO surveys (title, summary, details, media, creator_id, municipality_id) VALUES
-- ('Izgradnja skejt parka', 'Skejt park za mlade', '{"problem": "Nedostatak rekreacije", "solution": "500m² park", "cost": "50000", "impact": "Veće uključivanje"}', '["https://via.placeholder.com/200"]', 1, 1),
-- ('Poboljšanje autobuskih stanica', 'Skloništa i displeji', '{"problem": "Nedostatak zaštite", "solution": "Skloništa i ekrani", "cost": "100000", "impact": "Bolje iskustvo"}', '["https://via.placeholder.com/200"]', 2, 2);

-- Table for tracking proposal contributions and edits
CREATE TABLE IF NOT EXISTS proposal_contributions (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(50) NOT NULL DEFAULT 'edit', -- 'edit', 'comment', 'vote', 'file_upload'
    field_name VARCHAR(100), -- For edits: 'title', 'summary', 'problem_description', etc.
    old_value TEXT, -- Previous value of the field
    new_value TEXT, -- New value of the field
    edit_summary TEXT, -- Reason for the change
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for notifications about proposal changes
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
    contribution_id INTEGER REFERENCES proposal_contributions(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'edit_proposed', 'edit_approved', 'edit_rejected', 'new_contributor'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for proposal_contributions
CREATE INDEX IF NOT EXISTS idx_proposal_contributions_proposal_id ON proposal_contributions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_contributions_user_id ON proposal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_contributions_status ON proposal_contributions(status);
CREATE INDEX IF NOT EXISTS idx_proposal_contributions_type ON proposal_contributions(contribution_type);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_proposal_id ON notifications(proposal_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);