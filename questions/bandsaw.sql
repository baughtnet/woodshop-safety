BEGIN;

DO $$
DECLARE
    bandsaw_test_id INT;
BEGIN
    -- Now, let's insert the questions for the Bandsaw Safety Test
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

    (bandsaw_test_id, 'Where should you avoid standing while operating a bandsaw?',
     '["To the left side", "To the right side", "In front of the blade", "Behind the machine"]',
     'To the right side'),

    (bandsaw_test_id, 'When making relief cuts for curved cuts, what is the primary purpose?',
     '["To increase cutting speed", "To reduce waste", "To prevent blade binding", "To improve cut accuracy"]',
     'To prevent blade binding'),

    (bandsaw_test_id, 'Why should you never back out of a curved cut with the bandsaw running?',
     '["It dulls the blade", "It''s too slow", "It can easily bind or break the blade", "It reduces cut accuracy"]',
     'It can easily bind or break the blade');

END $$;

COMMIT;
