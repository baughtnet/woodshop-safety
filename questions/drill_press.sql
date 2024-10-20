BEGIN;

DO $$
DECLARE
    drill_test_id INT;
BEGIN
    -- First, let's find the ID of the Drill Press Safety Test
    SELECT id INTO drill_test_id FROM tests WHERE name = 'Drill Press Safety Test';
    
    -- Check if the test exists
    IF drill_test_id IS NULL THEN
        RAISE EXCEPTION 'Drill Press Safety Test not found in the tests table';
    END IF;

    INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES    
(drill_test_id, 'What is the appropriate speed adjustment for using large drill bits on the drill press?',
       '["Use high speed", "Use medium speed", "Use low speed", "Speed is irrelevant"]',
       'Use low speed'),
(drill_test_id, 'Which adjustment must you make to ensure you do not drill into the vice or table?',
       '["Lower the table", "Use scrap wood under your work", "Use a shorter drill bit", "Do not make any adjustments"]',
       'Use scrap wood under your work'),
(drill_test_id, 'What should you ensure about the chuck before starting the drill press?',
       '["It is tightened with a wrench", "The chuck key is removed", "It is oiled properly", "It is spinning freely"]',
       'The chuck key is removed'),
(drill_test_id, 'Which of the following is essential to avoid having your hair caught in the drill press?',
       '["Wear a hat", "Comb your hair frequently", "Tie back long hair", "Leave hair loose"]',
       'Tie back long hair'),
(drill_test_id, 'What is the reason for securing the material in a drill vice or clamping it to the drill press table?',
       '["To enhance precision", "To prevent the table from moving", "To avoid tool overheating", "To prevent injury from spinning materials"]',
       'To prevent injury from spinning materials'),
(drill_test_id, 'What is the function of the feed crank on a drill press?',
       '["Secure the material to the table", "Adjust the drill bit speed", "Control the drilling depth", "Engage the clutch"]',
       'Control the drilling depth'),
(drill_test_id, 'What role does the depth stop play in the operation of the drill press?',
       '["Changes the drill bit", "Sets the maximum drilling depth", "Locks the drill chuck", "Stops the drill automatically after use"]',
       'Sets the maximum drilling depth'),
(drill_test_id, 'Before adjusting the height of the drill press table, what must you always ensure?',
       '["The drill bit is removed", "The machine is turned on", "The table is unclamped", "Wear safety goggles"]',
       'The table is unclamped'),
(drill_test_id, 'Which safety feature prevents the drill bit from excessive travel through the material?',
       '["Emergency stop button", "Magnetic chuck feature", "Depth stop", "Adjustable feed handle"]',
       'Depth stop'),
(drill_test_id, 'Why is it important to ensure alignment of the drill bit with the intended hole location?',
       '["To prevent motor overloading", "To extend tool life", "To ensure accurate drilling and prevent \"drift\"", "To make the drill quieter"]',
       'To ensure accurate drilling and prevent "drift"'),
(drill_test_id, 'What is the proper way to operate the drill press if you hear an unusual noise?',
       '["Continue drilling", "Turn off the machine and investigate the noise", "Ignore the noise as it is common", "Increase the speed to see if it stops"]',
       'Turn off the machine and investigate the noise'),
(drill_test_id, 'Which of these should you wear to protect your eyes while operating the drill press?',
       '["Sunglasses", "Safety goggles", "Contact lenses", "No protection needed"]',
       'Safety goggles'),
(drill_test_id, 'What is the primary purpose of the drill press chuck?',
       '["To hold the drill press spindle", "To measure drilling depth", "To securely hold the drill bit", "To indicate drill speed"]',
       'To securely hold the drill bit'),
(drill_test_id, 'Which part of the drill press helps in aligning the workpiece at a right angle to the drill bit?',
       '["Feed crank", "Drill press base", "Drill press vice", "Drill table"]',
       'Drill press vice');

    -- Update the total_questions count
    UPDATE tests
    SET total_questions = (SELECT COUNT(*) FROM questions WHERE test_id = drill_test_id)
    WHERE id = drill_test_id;

    -- Output the new test ID (optional, for confirmation)
    RAISE NOTICE 'New Drill Press Safety Test questions added with ID: %', drill_test_id;
END $$;
COMMIT;
