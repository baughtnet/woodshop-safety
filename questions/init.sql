-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES tests(id),
    question_text TEXT NOT NULL,
    answers JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL
);

-- Create user_test_results table
CREATE TABLE IF NOT EXISTS user_test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    test_id INTEGER REFERENCES tests(id),
    score INTEGER NOT NULL,
    answers JSON NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert jointer safety test
INSERT INTO tests (name, description) VALUES 
('Jointer Safety Test', 'A comprehensive test covering jointer safety principles and procedures');

-- Insert jointer safety questions
INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES
(1, 'When adjusting the depth of cut on the jointer, what is the maximum depth you should set?', 
   '["1.5 mm (1/16 inch)", "2 mm (1/8 inch)", "3 mm (1/4 inch)", "5 mm (3/16 inch)"]', '3 mm (1/4 inch)'),
(1, 'Who is allowed to change the depth of the outfeed table on a jointer?', 
   '["Any student", "The teacher or a qualified person", "It can be adjusted anytime", "Only during maintenance"]', 'The teacher or a qualified person'),
(1, 'If the stock you are jointing is less than 300mm long, what should you do?', 
   '["Joint it anyway", "Use push sticks", "Do not joint it", "Cut it into smaller pieces"]', 'Do not joint it'),
(1, 'What safety equipment is recommended to be worn when operating a jointer?', 
   '["Gloves and rings", "Approved eye protection and hearing protection", "Open-toed shoes", "No special equipment is needed"]', 'Approved eye protection and hearing protection'),
(1, 'What is the purpose of the safety guard on the jointer?', 
   '["To improve visibility", "To protect the operator from the cutter head", "To ensure smooth operation", "To secure the wood in place"]', 'To protect the operator from the cutter head'),
(1, 'Which of the following is a correct safety procedure when using the jointer?', 
   '["Ensure that hair is loose to allow airflow", "Push wood through the cut with your hands over the cutter", "Step your hands past the cutter head", "Joint boards less than 50mm wide without tools"]', 'Step your hands past the cutter head'),
(1, 'Before turning on the jointer, what is the most important thing you should you check?', 
   '["Temperature of the machine", "That all guards are in place and functional", "Type of wood being used", "Height of the infeed table to set the depth of cut"]', 'That all guards are in place and functional'),
(1, 'Why is it important to check stock for defects before jointing?', 
   '["Defects can enhance the cutting experience", "Defects can damage the machine and cause kickback", "Defects will improve the finish", "Checking is not necessary"]', 'Defects can damage the machine and cause kickback'),
(1, 'Which part of the jointer is primarily responsible for cutting wood?', 
   '["Outfeed table", "Infeed table", "Cutter head", "Safety guard"]', 'Cutter head'),
(1, 'The purpose of the fence on the jointer is to:', 
   '["Hold the machine in place", "Secure the wood and control the cut and ensure a 90 degree angle is cut", "Measure the thickness of the wood", "Provide a place to attach other tools"]', 'Secure the wood and control the cut and ensure a 90 degree angle is cut'),
(1, 'One of the key safety considerations when using the jointer is to always joint with the __________.', 
   '["Edge", "Grain", "Filter", "Cutter"]', 'Grain'),
(1, 'If the stock to be jointed is less than the minimum size, what should be done?', 
   '["Use your hands to hold it in place", "Use a push stick", "Joint it anyway, being careful", "Do not joint it"]', 'Do not joint it'),
(1, 'What is the minimum length of stock that can be jointed on the jointer?', 
   '["15 cm (6 inches)", "30 cm (12 inches)", "45 cm (18 inches)", "60 cm (24 inches)"]', '30 cm (12 inches)'),
(1, 'Why is it essential to ensure all guards are in place before starting the jointer?', 
   '["To improve the efficiency of the machine", "To prevent injuries from blade exposure", "To make the machine look neat", "It is not essential"]', 'To prevent injuries from blade exposure'),
(1, 'If you are unsure about the proper way to operate the jointer, what is the best course of action?', 
   '["Watch others operate the machine and imitate them", "Self-teach by trial and error", "Consult the operating manual or ask the instructor", "Use the machine without worry"]', 'Consult the operating manual or ask the instructor'),
(1, 'Which of the following parts helps in guiding the stock through the jointer?', 
   '["Infeed table", "Fence", "Outfeed table", "All of the above"]', 'All of the above'),
(1, 'What happens if you do not follow the set depth adjustments correctly?', 
   '["The wood will split", "The machine will run smoothly", "It will not affect anything", "The end cut will be inaccurate and potentially harmful"]', 'The end cut will be inaccurate and potentially harmful'),
(1, 'If the wood piece is lower than the fence, what should not be done?', 
   '["Adjust the machine settings", "Ensure it is jointed gently", "Joint it without using a push stick", "Joint it with a push stick"]', 'Joint it without using a push stick'),
(1, 'What protective gear is required when operating the jointer?', 
   '["Gloves only", "Eye protection only", "Eye protection plus hearing protection", "No protective gear is necessary"]', 'Eye protection plus hearing protection'),
(1, 'When using the jointer you should always start by:', 
   '["Jointing a face", "Jointing an edge", "Jointing the end of the board", "Sanding flat before jointing"]', 'Jointing a face'),
(1, 'You should never joint...', 
   '["The face of a board", "The edge of a board", "The end of a board", "A softwood board"]', 'The end of a board');
