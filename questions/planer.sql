BEGIN;

DO $$
DECLARE
    planer_test_id INT;
    jointer_test_order INT;
BEGIN
    -- First, let's find the display order of the jointer test
    SELECT display_order INTO jointer_test_order
    FROM tests
    WHERE name = 'Jointer Safety Test';

    -- Now, let's create the new Planer Safety Test
    -- We'll place it right before the jointer test
    INSERT INTO tests (name, display_order) 
    VALUES ('Planer Safety Test', jointer_test_order)
    RETURNING id INTO planer_test_id;

    -- Update the display order of tests after the planer test
    UPDATE tests
    SET display_order = display_order + 1
    WHERE display_order >= jointer_test_order AND name != 'Planer Safety Test';

    -- Now, let's insert the questions for the Planer Safety Test
    INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES
    (planer_test_id, 'What is the maximum depth of cut for the thickness planer?',
     '["5mm", "3mm", "1mm", "10mm"]',
     '3mm'),

    (planer_test_id, 'What safety equipment is mandatory when operating the thickness planer?',
     '["Gloves", "Eye protection", "Ear muffs", "All of the above"]',
     'Eye protection'),

    (planer_test_id, 'What should you do if the wood gets stuck in the planer?',
     '["Force it through", "Kick the machine", "Switch off the machine and look into the machine", "Leave it and walk away"]',
     'Switch off the machine and look into the machine'),

    (planer_test_id, 'When is it acceptable to plane stock less than 10 cm long?',
     '["When using a backing board", "When the stock is thick enough", "When the stock is wide enough", "Never"]',
     'When using a backing board'),

    (planer_test_id, 'What is the safest way to manage wood chips and debris around the planer?',
     '["Use a blower to clear them", "Brush them off while the machine is running", "Stand to the side and never in front", "Reach in and remove them if the machine is not running"]',
     'Stand to the side and never in front'),

    (planer_test_id, 'What should you do before planning a piece of wood?',
     '["Ensure all guards are in place", "Make sure the wood is damp", "Remove all personal protective equipment", "Loosen the cutter head"]',
     'Ensure all guards are in place'),

    (planer_test_id, 'What is the function of the feed rollers on a thickness planer?',
     '["To cut the wood", "To push the wood through the planer", "To collect dust", "None of the above"]',
     'To push the wood through the planer'),

    (planer_test_id, 'Which part of the thickness planer ensures that wood is fed smoothly?',
     '["Cutter head", "Infeed table", "Feed rollers", "Dust collection"]',
     'Feed rollers'),

    (planer_test_id, 'What prevents wood kickback in a thickness planer?',
     '["Properly adjusted pressure boards", "Sharp blades", "High feed speed", "Turning off the machine"]',
     'Properly adjusted pressure boards'),

    (planer_test_id, 'How should you position yourself relative to the thickness planer when operating it?',
     '["Directly in-line with the cutting path", "To the side of the machine", "Anywhere is fine", "Behind the output"]',
     'To the side of the machine'),

    (planer_test_id, 'How often should you adjust the pressure boards in the thickness planer?',
     '["Every day", "Every new project", "Weekly", "Never"]',
     'Every new project'),

    (planer_test_id, 'What should the minimum length be for a board to be planed safely?',
     '["20 cm", "30 cm", "50 cm", "80 cm"]',
     '30 cm');

END $$;

COMMIT;
