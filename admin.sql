-- Add is_admin column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in users table';
    END IF;
END $$;

-- Create tests table if it doesn't exist
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES tests(id),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_test_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    test_id INTEGER REFERENCES tests(id),
    score INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert an admin user if one doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE is_admin = TRUE) THEN
        INSERT INTO users (first_name, last_name, student_id, pin_hash, is_admin)
        VALUES ('Admin', 'User', 'ADMIN001', 'hashed_pin_here', TRUE);
        RAISE NOTICE 'Added an admin user';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;
