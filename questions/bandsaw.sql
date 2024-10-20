BEGIN;

DO $$
DECLARE
    bandsaw_test_id INT;
BEGIN
    -- First, let's find the ID of the Bandsaw Safety Test
    SELECT id INTO bandsaw_test_id FROM tests WHERE name = 'Bandsaw Safety Test';
    
    -- Check if the test exists
    IF bandsaw_test_id IS NULL THEN
        RAISE EXCEPTION 'Bandsaw Safety Test not found in the tests table';
    END IF;

    INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES
(bandsaw_test_id, 'What is the ideal distance between the upper guide and the stock during operation?',
       '["Between 1mm and 3mm", "5mm", "10mm", "Directly on the stock"]',
       'Between 1mm and 3mm'),
(bandsaw_test_id, 'How often should you adjust the guide to maintain proper operation?',
       '["Once per session", "Whenever you change the stock height", "Weekly", "Only during initial setup"]',
       'Whenever you change the stock height'),
(bandsaw_test_id, 'What is the primary purpose of the blade guard on a band saw?',
       '["To keep the stock stable", "To protect the user from the blade", "To prevent dust build-up", "To enhance cutting precision"]',
       'To protect the user from the blade'),
(bandsaw_test_id, 'Which of the following safety features is essential to prevent the blade from binding?',
       '["Blade Guard", "Thrust Bearings", "Table Adjustment", "Upper guide adjustment"]',
       'Thrust Bearings'),
(bandsaw_test_id, 'Why should relief cuts be used when sawing tight corners?',
       '["To speed up the process", "To prevent overloading the saw", "To avoid blade dulling", "To minimize material waste"]',
       'To prevent overloading the saw'),
(bandsaw_test_id, 'What should you do if the blade breaks during operation?',
       '["Keep the machine running until finished", "Turn off the saw immediately and notify the instructor", "Replace the blade yourself", "Continue cutting with caution"]',
       'Turn off the saw immediately and notify the instructor'),
(bandsaw_test_id, 'Which part of the band saw is responsible for providing tension to the blade?',
       '["Table", "Blade Guide", "Motor", "Upper and Lower Wheels"]',
       'Upper and Lower Wheels'),
(bandsaw_test_id, 'What is the function of the thrust bearing on a band saw?',
       '["To reduce machine noise", "To support the table", "To prevent the blade from moving backward", "To guide the stock"]',
       'To prevent the blade from moving backward'),
(bandsaw_test_id, 'Why is it unsafe to stand to the right of the bandsaw while in use?',
       '["The sawdust is heavy on that side", "The machine vibrates on that side", "The blade might flip out in that direction if it breaks", "The motor is on that side"]',
       'The blade might flip out in that direction if it breaks'),
(bandsaw_test_id, 'When making relief cuts for curved cuts, what is the primary purpose?',
       '["To increase cutting speed", "To reduce waste", "To prevent blade binding", "To improve cut accuracy"]',
       'To prevent blade binding'),
(bandsaw_test_id, 'Can you back out of a long, curved cut while the machine is still on?',
       '["Yes, if you go slowly", "Yes, with permission from the teacher", "No, never back out of a cut", "Yes, if you tighten the blade first"]',
       'No, never back out of a cut'),
(bandsaw_test_id, 'Why is it important to avoid excessive twisting of the blade?',
       '["It makes the cut faster", "It can cause the blade to overheat", "It may break the blade", "It produces a cleaner cut"]',
       'It may break the blade'),
(bandsaw_test_id, 'How should you handle round or irregular shaped wood when using the bandsaw?',
       '["Cut slowly without any assistance", "Use a jig to stabilize them", "Hold firmly with gloves", "Cut at an angle"]',
       'Use a jig to stabilize them'),
(bandsaw_test_id, 'What could happen if you apply too much pressure or twist the material excessively when using the bandsaw?',
       '["It will create smoother cuts", "It will increase cutting speed", "The saw will slow down", "The cut path will become more accurate"]',
       'The saw will slow down');

    -- Update the total_questions count
    UPDATE tests
    SET total_questions = (SELECT COUNT(*) FROM questions WHERE test_id = bandsaw_test_id)
    WHERE id = bandsaw_test_id;

    -- Output the new test ID (optional, for confirmation)
    RAISE NOTICE 'New Bandsaw Safety Test added with ID: %', bandsaw_test_id;
END $$;
COMMIT;
