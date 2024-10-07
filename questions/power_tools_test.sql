BEGIN;

DO $$
DECLARE
    powertools_test_id INT;
BEGIN
    -- First, let's create the new Power Tools Safety Test
    INSERT INTO tests (name, display_order) 
    VALUES ('Power Tools Safety Test', (SELECT COALESCE(MAX(display_order), 0) + 1 FROM tests))
    RETURNING id INTO powertools_test_id;

    -- Now, let's insert the questions for the Power Tools Safety Test
    INSERT INTO questions (test_id, question_text, answers, correct_answer) VALUES
    (powertools_test_id, 'What adjustment must be made to ensure the drill bit is securely in place before drilling?',
     '["Tighten the bit using the drill chuck", "Use a wrench to tighten the bit", "Apply hand pressure on the bit", "Rotate the drill at maximum speed"]',
     'Tighten the bit using the drill chuck'),

    (powertools_test_id, 'What safety mechanism helps prevent accidental start-ups of a cordless drill?',
     '["Trigger with a forward/reverse switch", "A safety catch in the chuck", "A manual lock over the drill bit", "None of the above"]',
     'Trigger with a forward/reverse switch'),

    (powertools_test_id, 'Why should the cord remain clear of the drilling area during operation?',
     '["To prevent tripping hazards", "To avoid damaging the power cord", "To ensure the drill spins faster", "To allow the cord to cool"]',
     'To avoid damaging the power cord'),

    (powertools_test_id, 'When using a hand drill, what personal protective equipment is required?',
     '["Earplugs", "Eye protection", "Gloves and boots", "Helmet"]',
     'Eye protection'),

    (powertools_test_id, 'Before starting drilling, what should you do with long hair?',
     '["Leave it as it is, it won''t cause any issues", "Use a cap to cover it", "Tie it back to prevent it from being caught in the drill", "Style it under a hat"]',
     'Tie it back to prevent it from being caught in the drill'),

    (powertools_test_id, 'Why should you not hold onto a drill bit while it stops rotating?',
     '["It will get hot and could burn you", "It might detach unexpectedly", "It could catch and injure you", "It needs to cool while free"]',
     'It could catch and injure you'),

    (powertools_test_id, 'What part of the drill holds bits in place?',
     '["Trigger", "Drill chuck", "Power cord", "Battery compartment"]',
     'Drill chuck'),

    (powertools_test_id, 'What is the function of the trigger on a corded drill?',
     '["To change the drill bit", "To adjust the drill speed", "To start the drill", "To secure the battery"]',
     'To start the drill'),

    (powertools_test_id, 'What distance should the bit extend past the collet when changing a router bit?',
     '["At least 10mm", "At least 5mm", "Up to 15mm (1/2'')", "It should not extend beyond the collet"]',
     'Up to 15mm (1/2'')'),

    (powertools_test_id, 'What safety equipment is specifically required due to the router''s noise level?',
     '["Special gloves", "Ear and eye protection", "Knee pads", "Face shield"]',
     'Ear and eye protection'),

    (powertools_test_id, 'What procedure ensures the router is safe to handle after use?',
     '["Leave it on the table", "Ensure the bit has fully stopped rotating", "Turn it off and disconnect the plug", "Unplug only"]',
     'Ensure the bit has fully stopped rotating'),

    (powertools_test_id, 'Where should both of your hands be while operating the router?',
     '["On the table", "Away from the router", "Firmly on the router handles", "One on the router, one on the wood"]',
     'Firmly on the router handles'),

    (powertools_test_id, 'What should be checked before using the router to verify readiness?',
     '["Sharpness of the blade", "Router bit security and area clearance", "Correct wrench size", "Speed setting"]',
     'Router bit security and area clearance');

END $$;

COMMIT;
