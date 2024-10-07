BEGIN;

-- Get the id of the General Shop Safety Test
DO $$
DECLARE
    general_test_id INT;
BEGIN
    SELECT id INTO general_test_id FROM tests WHERE name = 'General Shop Safety Test';

    INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES
    (general_test_id, 'What is the first step you must take before operating any machine in the shop?',
     '["Adjust the settings to your preference", "Begin working on your project", "Receive proper instruction from the instructor", "Check if the machine is plugged in"]',
     'Receive proper instruction from the instructor'),

    (general_test_id, 'Which of the following must be removed or secured when working in a shop environment?',
     '["Loose clothing and jewelry", "Personal protective equipment", "Closed-toed shoes", "Safety glasses"]',
     'Loose clothing and jewelry'),

    (general_test_id, 'When should you use personal protective equipment (PPE) in the shop?',
     '["Only if it feels necessary", "Every time you work with power tools or machinery", "Only when cutting wood", "Never; it''s optional"]',
     'Every time you work with power tools or machinery'),

    (general_test_id, 'What should you do if you notice a tool is dull or damaged?',
     '["Keep using it until it breaks", "Tell the instructor or ask for permission to fix it", "Attempt to fix it yourself", "Ignore it and use a different tool"]',
     'Tell the instructor or ask for permission to fix it'),

    (general_test_id, 'How should you carry sharp or pointed tools?',
     '["In your pocket", "With the point facing upwards", "By the handle, with the point facing downwards", "Without holding them at all"]',
     'By the handle, with the point facing downwards'),

    (general_test_id, 'What is the appropriate action if you see someone horseplaying in the shop?',
     '["Join in to have fun", "Ignore it; it''s not your responsibility", "Ask them to stop", "Inform the instructor immediately"]',
     'Inform the instructor immediately'),

    (general_test_id, 'How can you prevent tripping hazards in the workshop?',
     '["Leave materials scattered around", "Keep the floors and work surfaces clean and clear", "Ignore the issue; it''s not a problem", "Discuss it with your friends"]',
     'Keep the floors and work surfaces clean and clear'),

    (general_test_id, 'Before changing or adjusting a power tool, you should always:',
     '["Turn it off and unplug it", "Just turn it off", "Wait for instructions", "Make your adjustments while it is still on"]',
     'Turn it off and unplug it'),

    (general_test_id, 'When is it acceptable to use compressed air for cleaning equipment?',
     '["At any time and for any purpose", "When others are not present", "Only in carefully controlled circumstances", "It''s never acceptable"]',
     'Only in carefully controlled circumstances'),

    (general_test_id, 'What is the minimum recommended length for a piece of wood to be jointed using a jointer?',
     '["150mm", "250mm", "300mm", "400mm"]',
     '300mm'),

    (general_test_id, 'After using a machine, when should you leave the area?',
     '["As soon as you finish", "Only after the machine has been turned off completely", "After checking with your classmates", "When the instructor says it''s okay"]',
     'Only after the machine has been turned off completely'),

    (general_test_id, 'What is an important rule regarding tools that are defective or damaged?',
     '["They can still be used carefully", "They should be immediately reported to the instructor", "They should be fixed yourself", "You can keep using them until they break completely"]',
     'They should be immediately reported to the instructor'),

    (general_test_id, 'Which of the following describes best how to handle heavy objects in the workshop?',
     '["Always carry them alone", "Use proper lifting techniques with help if needed", "Drag them across the floor", "Lift them quickly to avoid straining"]',
     'Use proper lifting techniques with help if needed'),

    (general_test_id, 'Why is it important to wear eye protection while using power tools?',
     '["It''s a requirement for the instructor", "To look cool and fit in", "To protect your eyes from flying debris", "It''s optional if you wear glasses"]',
     'To protect your eyes from flying debris'),

    (general_test_id, 'What should you do immediately after an accident occurs in the workshop?',
     '["Continue working to avoid interruptions", "Report the incident to the instructor", "Ensure no one else gets hurt and stay silent", "Leave the shop quickly"]',
     'Report the incident to the instructor');

END $$;

COMMIT;
