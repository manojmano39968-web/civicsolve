-- CivicSolve Demo Seed Data
-- Realistic SIH Demonstration Data

-- 1. Skills
INSERT INTO skills (id, name, category) VALUES
(1, 'Hydrology', 'Civil & Environmental'),
(2, 'Drainage Design', 'Civil & Infrastructure'),
(3, 'GIS', 'Spatial Analysis'),
(4, 'Urban Planning', 'Urban Development'),
(5, 'Civil Engineering', 'Engineering'),
(6, 'AutoCAD', 'Design Tools'),
(7, 'Waste Management', 'Environmental'),
(8, 'Environmental Engineering', 'Engineering'),
(9, 'Community Engagement', 'Social & Public Policy'),
(10, 'Transportation Engineering', 'Civil & Infrastructure'),
(11, 'Road Safety', 'Transportation'),
(12, 'Traffic Analysis', 'Transportation'),
(13, 'Water Resources', 'Civil & Environmental'),
(14, 'Pipeline Systems', 'Mechanical & Civil'),
(15, 'Sanitation', 'Public Health'),
(16, 'Public Health', 'Healthcare & Civic'),
(17, 'Municipal Engineering', 'Civil & Infrastructure'),
(18, 'Accessibility Design', 'Urban Design'),
(19, 'Field Implementation', 'Industry & Execution'),
(20, 'Municipal Projects', 'Government Liaison')
ON CONFLICT (id) DO NOTHING;

-- 2. Users (Fictional Demo Personas)
INSERT INTO users (id, name, email, role, institution, location, bio) VALUES
(1, 'Kavitha Rajan', 'citizen@civicsolve.local', 'citizen', 'Velachery Residents Welfare Association', 'Chennai', 'Community volunteer and local civic coordinator in South Chennai.'),
(2, 'Arjun Kumar', 'student@civicsolve.local', 'student', 'Government Engineering College, Guindy', 'Chennai', 'Final year Civil Engineering student specializing in geospatial mapping and stormwater drainage design.'),
(3, 'Dr. Meena Raman', 'expert@civicsolve.local', 'expert', 'Centre for Water Resources, Anna University', 'Chennai', 'Associate Professor with 14+ years research in urban hydrology, watershed modeling, and flood mitigation.'),
(4, 'Ravi Infrastructure Solutions', 'industry@civicsolve.local', 'industry', 'Ravi Infra Projects Ltd.', 'Chennai', 'Specialist municipal infrastructure contractor with expertise in culvert construction and stormwater maintenance.'),
(5, 'Priya S', 'priya.student@civicsolve.local', 'student', 'Coimbatore Institute of Technology', 'Coimbatore', 'Environmental Engineering student passionate about decentralized solid waste segregation and circular economy.'),
(6, 'Dr. K. Senthil Nathan', 'senthil.expert@civicsolve.local', 'expert', 'National Institute of Technology, Trichy', 'Tiruchirappalli', 'Senior Consultant in municipal water supply networks and acoustic pipeline leak detection.'),
(7, 'CivicSolve Admin', 'admin@civicsolve.local', 'admin', 'Smart City Mission Innovation Cell', 'Tamil Nadu', 'Demonstration administrator for civic challenge moderation and team facilitation.')
ON CONFLICT (id) DO NOTHING;

-- 3. User Skills (Proficiencies)
INSERT INTO user_skills (user_id, skill_id, proficiency) VALUES
-- Arjun Kumar (Student)
(2, 5, 'Advanced'),     -- Civil Engineering
(2, 3, 'Advanced'),     -- GIS
(2, 2, 'Intermediate'), -- Drainage Design
(2, 6, 'Advanced'),     -- AutoCAD
-- Dr. Meena Raman (Expert)
(3, 1, 'Expert'),       -- Hydrology
(3, 2, 'Expert'),       -- Drainage Design
(3, 13, 'Expert'),      -- Water Resources
(3, 4, 'Advanced'),     -- Urban Planning
-- Ravi Infrastructure (Industry)
(4, 2, 'Expert'),       -- Drainage Design
(4, 19, 'Expert'),      -- Field Implementation
(4, 20, 'Advanced'),    -- Municipal Projects
(4, 17, 'Advanced'),    -- Municipal Engineering
-- Priya S (Student)
(5, 8, 'Advanced'),     -- Environmental Engineering
(5, 7, 'Advanced'),     -- Waste Management
(5, 9, 'Intermediate'), -- Community Engagement
(5, 3, 'Intermediate'), -- GIS
-- Dr. Senthil Nathan (Expert)
(6, 13, 'Expert'),      -- Water Resources
(6, 14, 'Expert'),      -- Pipeline Systems
(6, 5, 'Advanced')      -- Civil Engineering
ON CONFLICT DO NOTHING;

-- 4. Challenges (8-12 Realistic Civic Challenges)
INSERT INTO challenges (id, title, description, category, location, severity, status, submitted_by) VALUES
(1, 'Recurring Urban Flooding Near Residential Area', 'During heavy rainfall, the main transit road and surrounding residential streets in Velachery experience severe waterlogging. Water remains stagnant for 4 to 6 hours after rainfall, affecting pedestrians, school transit, and ground-floor homes. Need a sustainable drainage and runoff redirection strategy.', 'Urban Infrastructure / Flood Management', 'Chennai', 'High', 'Team Formed', 1),
(2, 'Decentralized Waste Segregation and Organic Composting', 'Multiple residential wards lack source segregation enforcement, causing mixed waste to choke local landfills and stormwater grates. Need community engagement and ward-level bio-composting layout.', 'Waste Management & Environment', 'Coimbatore', 'Medium', 'Submitted', 1),
(3, 'Pedestrian Road Safety and Speed Calming Near School Zone', 'Blind turn and absence of pedestrian refuge crossings near the government higher secondary school lead to frequent near-miss collisions during morning rush hours.', 'Transportation & Road Safety', 'Madurai', 'High', 'Submitted', 1),
(4, 'Underground Drinking Water Pipeline Leakage & Pressure Loss', 'Aging cast iron municipal supply lines have undetected underground fractures, leading to contaminated back-siphonage and low terminal water pressure.', 'Water Resources & Supply', 'Tiruchirappalli', 'High', 'Submitted', 1),
(5, 'Public Sanitation Facility Maintenance & Hygiene Monitoring', 'Community toilet complex suffers from inconsistent water supply, clogged plumbing lines, and lack of accountability in scheduled maintenance.', 'Public Health & Sanitation', 'Salem', 'Medium', 'Submitted', 1),
(6, 'Stormwater Drain Siltation & Commercial Culvert Blockage', 'Micro-catchment drain connecting to canal is heavily silted with construction debris and solid plastic waste, causing backflow during sudden showers.', 'Urban Infrastructure / Drainage', 'Chennai', 'High', 'Submitted', 1),
(7, 'Urban Lake Ecological Restoration & Inflow Cleansing', 'Periyakulam lake inlet channels receive untreated greywater and surface runoff, depleting dissolved oxygen and threatening local bird habitats.', 'Environmental Conservation', 'Erode', 'Medium', 'Submitted', 1),
(8, 'Universal Pedestrian Accessibility & Sidewalk Regularization', 'Footpaths along commercial avenue have unramped height variations, utility pole obstructions, and broken slabs preventing wheelchair accessibility.', 'Urban Planning & Accessibility', 'Bengaluru', 'Low', 'Submitted', 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Challenge Required Skills
INSERT INTO challenge_skills (challenge_id, skill_id) VALUES
-- Flooding in Chennai
(1, 1), -- Hydrology
(1, 2), -- Drainage Design
(1, 3), -- GIS
(1, 4), -- Urban Planning
-- Waste in Coimbatore
(2, 7), (2, 8), (2, 9),
-- Road Safety in Madurai
(3, 10), (3, 11), (3, 12),
-- Water Leakage in Trichy
(4, 13), (4, 14), (4, 5),
-- Public Toilet in Salem
(5, 15), (5, 16), (5, 5),
-- Stormwater Blockage in Chennai
(6, 2), (6, 3), (6, 17),
-- Lake Restoration in Erode
(7, 8), (7, 1), (7, 13),
-- Accessibility in Bengaluru
(8, 4), (8, 10), (8, 18)
ON CONFLICT DO NOTHING;

-- 6. Matches for Hero Challenge (1)
INSERT INTO matches (id, challenge_id, user_id, score, reason, status) VALUES
(1, 1, 2, 92, 'Exceptional match: Arjun has hands-on GIS spatial analysis and Civil Engineering Drainage Design coursework with Chennai local topography familiarity.', 'Accepted'),
(2, 1, 3, 88, 'Strong domain alignment: Dr. Meena is an authority in urban hydrology and flood modeling with over a decade of local stormwater research in Chennai.', 'Accepted'),
(3, 1, 4, 81, 'Practical implementation match: Ravi Infrastructure provides on-ground culvert clearing machinery, engineering workforce, and municipal project experience.', 'Accepted'),
(4, 1, 5, 64, 'Moderate overlap: Environmental Engineering and GIS skills, but secondary domain focus on solid waste and Coimbatore base.', 'Suggested')
ON CONFLICT (id) DO NOTHING;

-- 7. Team for Hero Challenge (1)
INSERT INTO teams (id, challenge_id, name, status) VALUES
(1, 1, 'CivicSolve Flood Response Team', 'Active')
ON CONFLICT (id) DO NOTHING;

-- 8. Team Members
INSERT INTO team_members (team_id, user_id, role) VALUES
(1, 2, 'Field Analysis & GIS Mapping'),
(1, 3, 'Hydrology & Technical Review Lead'),
(1, 4, 'Field Implementation Partner')
ON CONFLICT DO NOTHING;

-- 9. Tasks for Hero Team (6 Realistic Tasks)
INSERT INTO tasks (id, team_id, title, description, assigned_to, status, due_date) VALUES
(1, 1, 'Collect rainfall and historical flood elevation data', 'Compile 5-year precipitation data and local water stagnation logs from municipal ward office.', 2, 'Completed', 'Day 3'),
(2, 1, 'Map affected streets and low-lying points with GIS', 'Plot contour elevation profiles and identify the three critical depression nodes along Main Avenue.', 2, 'Completed', 'Day 5'),
(3, 1, 'Inspect existing stormwater drain network & discharge culvert', 'Conduct visual and ultrasonic inspection of the 600mm conduit connecting to Buckingham canal.', 4, 'Completed', 'Day 7'),
(4, 1, 'Identify critical blockage points and silt accumulation depths', 'Quantify desiltation volume and map plastic choke points obstructing the cross-drain culverts.', 4, 'In Progress', 'Day 10'),
(5, 1, 'Develop decentralized drainage intervention & gradient proposal', 'Draft hydraulic calculation report for auxiliary culvert bypass and surface absorption grating.', 3, 'In Progress', 'Day 12'),
(6, 1, 'Prepare pilot implementation and municipal submission dossier', 'Formulate budget estimate, 400m pilot schedule, and safety clearances for municipal corporation review.', 3, 'Pending', 'Day 15')
ON CONFLICT (id) DO NOTHING;

-- 10. Solutions
INSERT INTO solutions (id, challenge_id, team_id, title, description, status) VALUES
(1, 1, 1, 'GIS-Guided Decentralized Stormwater Drainage & Blockage Clearance Intervention', 'A three-phase intervention combining high-priority desiltation of three choke points, installation of two high-capacity perforated intake grates at elevation depressions, and a 400m auxiliary gravity bypass to prevent stormwater backflow during intense monsoons.', 'Ready for Pilot Review')
ON CONFLICT (id) DO NOTHING;

-- 11. Progress Updates
INSERT INTO progress_updates (id, challenge_id, team_id, title, description, percentage, created_by) VALUES
(1, 1, 1, 'Field Survey & Hydrological Assessment Completed', 'Field mapping revealed 3 critical junction dips with accumulated debris reducing flow capacity by 40%.', 35, 2),
(2, 1, 1, 'Hydraulic Inflow Modeling Finalized', 'Dr. Meena validated peak runoff capacity. Recommended 300mm auxiliary gradient bypass to relieve pressure.', 55, 3),
(3, 1, 1, 'Pilot Engineering Proposal Drafted', 'Complete engineering specification and contractor estimates prepared for pilot demonstration.', 68, 4)
ON CONFLICT (id) DO NOTHING;

-- 12. Impact Metrics (Demo / Pilot Data)
INSERT INTO impact_metrics (id, challenge_id, metric_name, baseline_value, target_value, current_value, unit) VALUES
(1, 1, 'Average Waterlogging Duration (Heavy Rainfall)', '5.0', '2.0', '3.0', 'hours'),
(2, 1, 'Flooded Residential Surface Area', '2.4', '1.2', '1.5', 'km²'),
(3, 1, 'Monthly Civic Flooding Complaints', '12', '4', '7', 'incidents/month')
ON CONFLICT (id) DO NOTHING;

-- 13. Comments / Team Discussion
INSERT INTO comments (id, team_id, user_id, content) VALUES
(1, 1, 2, 'I mapped the affected residential streets and identified three critical low-lying junctions where water pools first.'),
(2, 1, 3, 'The peak rainfall pattern indicates the existing culvert diameter is insufficient by approximately 35%. I will review the discharge rate calculations.'),
(3, 1, 4, 'We can evaluate the proposed intervention for a 400m pilot section once the hydraulic clearances are finalized.')
ON CONFLICT (id) DO NOTHING;

-- 14. Notifications
INSERT INTO notifications (id, user_id, message, read) VALUES
(1, 1, 'CivicSolve AI completed analysis of your reported urban flooding problem.', true),
(2, 1, 'CivicSolve Flood Response Team has been formed and commenced field analysis.', false),
(3, 2, 'You were matched (92%) to the Chennai Urban Flooding challenge based on your GIS and Drainage Design skills.', true),
(4, 3, 'Collaboration invitation accepted for CivicSolve Flood Response Team.', true)
ON CONFLICT (id) DO NOTHING;
