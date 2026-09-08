const db = require('./index');

async function seedDatabase() {
    console.log('🌱 Seeding CivicSolve database...');
    await db.initSchema();

    // Clear existing data safely
    const tables = [
        'notifications', 'comments', 'impact_metrics', 'progress_updates',
        'solutions', 'tasks', 'team_members', 'teams', 'matches',
        'challenge_skills', 'challenges', 'user_skills', 'skills', 'users'
    ];

    for (const table of tables) {
        try {
            await db.query(`DELETE FROM ${table}`);
        } catch (e) {
            // table might not exist yet or empty
        }
    }

    // 1. Skills
    const skills = [
        [1, 'Hydrology', 'Civil & Environmental'],
        [2, 'Drainage Design', 'Civil & Infrastructure'],
        [3, 'GIS', 'Spatial Analysis'],
        [4, 'Urban Planning', 'Urban Development'],
        [5, 'Civil Engineering', 'Engineering'],
        [6, 'AutoCAD', 'Design Tools'],
        [7, 'Waste Management', 'Environmental'],
        [8, 'Environmental Engineering', 'Engineering'],
        [9, 'Community Engagement', 'Social & Public Policy'],
        [10, 'Transportation Engineering', 'Civil & Infrastructure'],
        [11, 'Road Safety', 'Transportation'],
        [12, 'Traffic Analysis', 'Transportation'],
        [13, 'Water Resources', 'Civil & Environmental'],
        [14, 'Pipeline Systems', 'Mechanical & Civil'],
        [15, 'Sanitation', 'Public Health'],
        [16, 'Public Health', 'Healthcare & Civic'],
        [17, 'Municipal Engineering', 'Civil & Infrastructure'],
        [18, 'Accessibility Design', 'Urban Design'],
        [19, 'Field Implementation', 'Industry & Execution'],
        [20, 'Municipal Projects', 'Government Liaison']
    ];

    for (const [id, name, cat] of skills) {
        await db.query(`INSERT INTO skills (id, name, category) VALUES ($1, $2, $3)`, [id, name, cat]);
    }

    // 2. Users
    const users = [
        [1, 'Kavitha Rajan', 'citizen@civicsolve.local', 'citizen', 'Velachery Residents Welfare Association', 'Chennai', 'Community volunteer and local civic coordinator in South Chennai.'],
        [2, 'Arjun Kumar', 'student@civicsolve.local', 'student', 'Government Engineering College, Guindy', 'Chennai', 'Final year Civil Engineering student specializing in geospatial mapping and stormwater drainage design.'],
        [3, 'Dr. Meena Raman', 'expert@civicsolve.local', 'expert', 'Centre for Water Resources, Anna University', 'Chennai', 'Associate Professor with 14+ years research in urban hydrology, watershed modeling, and flood mitigation.'],
        [4, 'Ravi Infrastructure Solutions', 'industry@civicsolve.local', 'industry', 'Ravi Infra Projects Ltd.', 'Chennai', 'Specialist municipal infrastructure contractor with expertise in culvert construction and stormwater maintenance.'],
        [5, 'Priya S', 'priya.student@civicsolve.local', 'student', 'Coimbatore Institute of Technology', 'Coimbatore', 'Environmental Engineering student passionate about decentralized solid waste segregation and circular economy.'],
        [6, 'Dr. K. Senthil Nathan', 'senthil.expert@civicsolve.local', 'expert', 'National Institute of Technology, Trichy', 'Tiruchirappalli', 'Senior Consultant in municipal water supply networks and acoustic pipeline leak detection.'],
        [7, 'CivicSolve Admin', 'admin@civicsolve.local', 'admin', 'Smart City Mission Innovation Cell', 'Tamil Nadu', 'Demonstration administrator for civic challenge moderation and team facilitation.']
    ];

    for (const [id, name, email, role, inst, loc, bio] of users) {
        await db.query(`INSERT INTO users (id, name, email, role, institution, location, bio) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [id, name, email, role, inst, loc, bio]);
    }

    // 3. User Skills
    const userSkills = [
        // Arjun Kumar
        [2, 5, 'Advanced'], // Civil Engineering
        [2, 3, 'Advanced'], // GIS
        [2, 2, 'Advanced'], // Drainage Design
        [2, 6, 'Advanced'], // AutoCAD
        // Dr. Meena Raman
        [3, 1, 'Expert'],   // Hydrology
        [3, 2, 'Expert'],   // Drainage Design
        [3, 13, 'Expert'],  // Water Resources
        [3, 4, 'Advanced'], // Urban Planning
        // Ravi Infrastructure
        [4, 2, 'Expert'],   // Drainage Design
        [4, 19, 'Expert'],  // Field Implementation
        [4, 20, 'Advanced'],// Municipal Projects
        [4, 17, 'Advanced'],// Municipal Engineering
        // Priya S
        [5, 8, 'Advanced'], // Environmental Engineering
        [5, 7, 'Advanced'], // Waste Management
        [5, 9, 'Intermediate'], // Community Engagement
        [5, 3, 'Intermediate'], // GIS
        // Dr. Senthil Nathan
        [6, 13, 'Expert'],  // Water Resources
        [6, 14, 'Expert'],  // Pipeline Systems
        [6, 5, 'Advanced']  // Civil Engineering
    ];

    for (const [uId, sId, prof] of userSkills) {
        await db.query(`INSERT INTO user_skills (user_id, skill_id, proficiency) VALUES ($1, $2, $3)`, [uId, sId, prof]);
    }

    // 4. Challenges (8 realistic challenges)
    const challenges = [
        [1, 'Recurring Urban Flooding Near Residential Area', 'During heavy rainfall, the main transit road and surrounding residential streets in Velachery experience severe waterlogging. Water remains stagnant for 4 to 6 hours after rainfall, affecting pedestrians, school transit, and ground-floor homes. Need a sustainable drainage and runoff redirection strategy.', 'Urban Infrastructure / Flood Management', 'Chennai', 'High', 'Team Formed', 1],
        [2, 'Decentralized Waste Segregation and Organic Composting', 'Multiple residential wards lack source segregation enforcement, causing mixed waste to choke local landfills and stormwater grates. Need community engagement and ward-level bio-composting layout.', 'Waste Management & Environment', 'Coimbatore', 'Medium', 'Submitted', 1],
        [3, 'Pedestrian Road Safety and Speed Calming Near School Zone', 'Blind turn and absence of pedestrian refuge crossings near the government higher secondary school lead to frequent near-miss collisions during morning rush hours.', 'Transportation & Road Safety', 'Madurai', 'High', 'Submitted', 1],
        [4, 'Underground Drinking Water Pipeline Leakage & Pressure Loss', 'Aging cast iron municipal supply lines have undetected underground fractures, leading to contaminated back-siphonage and low terminal water pressure.', 'Water Resources & Supply', 'Tiruchirappalli', 'High', 'Submitted', 1],
        [5, 'Public Sanitation Facility Maintenance & Hygiene Monitoring', 'Community toilet complex suffers from inconsistent water supply, clogged plumbing lines, and lack of accountability in scheduled maintenance.', 'Public Health & Sanitation', 'Salem', 'Medium', 'Submitted', 1],
        [6, 'Stormwater Drain Siltation & Commercial Culvert Blockage', 'Micro-catchment drain connecting to canal is heavily silted with construction debris and solid plastic waste, causing backflow during sudden showers.', 'Urban Infrastructure / Drainage', 'Chennai', 'High', 'Submitted', 1],
        [7, 'Urban Lake Ecological Restoration & Inflow Cleansing', 'Periyakulam lake inlet channels receive untreated greywater and surface runoff, depleting dissolved oxygen and threatening local bird habitats.', 'Environmental Conservation', 'Erode', 'Medium', 'Submitted', 1],
        [8, 'Universal Pedestrian Accessibility & Sidewalk Regularization', 'Footpaths along commercial avenue have unramped height variations, utility pole obstructions, and broken slabs preventing wheelchair accessibility.', 'Urban Planning & Accessibility', 'Bengaluru', 'Low', 'Submitted', 1]
    ];

    for (const [id, title, desc, cat, loc, sev, status, subBy] of challenges) {
        await db.query(`INSERT INTO challenges (id, title, description, category, location, severity, status, submitted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, title, desc, cat, loc, sev, status, subBy]);
    }

    // 5. Challenge Skills
    const challengeSkills = [
        [1, 1], [1, 2], [1, 3], [1, 4], // Flooding (Hydrology, Drainage Design, GIS, Urban Planning)
        [2, 7], [2, 8], [2, 9],         // Waste (Waste Mgmt, Env Eng, Community)
        [3, 10], [3, 11], [3, 12],       // Road Safety
        [4, 13], [4, 14], [4, 5],        // Water leakage
        [5, 15], [5, 16], [5, 5],        // Sanitation
        [6, 2], [6, 3], [6, 17],         // Stormwater Siltation
        [7, 8], [7, 1], [7, 13],         // Lake Restoration
        [8, 4], [8, 10], [8, 18]         // Accessibility
    ];

    for (const [cId, sId] of challengeSkills) {
        await db.query(`INSERT INTO challenge_skills (challenge_id, skill_id) VALUES ($1, $2)`, [cId, sId]);
    }

    // 6. Matches for Hero Challenge (1)
    const matches = [
        [1, 1, 2, 92, 'Exceptional match: Arjun has hands-on GIS spatial analysis and Civil Engineering Drainage Design coursework with Chennai local topography familiarity.', 'Accepted'],
        [2, 1, 3, 88, 'Senior domain authority: Dr. Meena is an authority in urban hydrology and flood modeling with over a decade of stormwater research in Chennai.', 'Accepted'],
        [3, 1, 4, 81, 'Practical implementation partner: Ravi Infrastructure provides on-ground culvert clearing machinery, engineering workforce, and municipal project experience.', 'Accepted'],
        [4, 1, 5, 65, 'Moderate overlap: Environmental Engineering and GIS skills, but secondary focus on solid waste and Coimbatore base.', 'Suggested']
    ];

    for (const [id, cId, uId, score, reason, status] of matches) {
        await db.query(`INSERT INTO matches (id, challenge_id, user_id, score, reason, status) VALUES ($1, $2, $3, $4, $5, $6)`, [id, cId, uId, score, reason, status]);
    }

    // 7. Teams
    await db.query(`INSERT INTO teams (id, challenge_id, name, status) VALUES (1, 1, 'CivicSolve Flood Response Team', 'Active')`);

    // 8. Team Members
    const teamMembers = [
        [1, 2, 'Field Analysis & GIS Mapping'],
        [1, 3, 'Hydrology & Technical Review Lead'],
        [1, 4, 'Field Implementation Partner']
    ];
    for (const [tId, uId, role] of teamMembers) {
        await db.query(`INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)`, [tId, uId, role]);
    }

    // 9. Tasks (6 realistic tasks for Hero Team)
    const tasks = [
        [1, 1, 'Collect rainfall and historical flood elevation data', 'Compile 5-year precipitation data and local water stagnation logs from municipal ward office.', 2, 'Completed', 'Day 3'],
        [2, 1, 'Map affected streets and low-lying points with GIS', 'Plot contour elevation profiles and identify the three critical depression nodes along Main Avenue.', 2, 'Completed', 'Day 5'],
        [3, 1, 'Inspect existing stormwater drain network & discharge culvert', 'Conduct visual and ultrasonic inspection of the 600mm conduit connecting to Buckingham canal.', 4, 'Completed', 'Day 7'],
        [4, 1, 'Identify critical blockage points and silt accumulation depths', 'Quantify desiltation volume and map plastic choke points obstructing the cross-drain culverts.', 4, 'In Progress', 'Day 10'],
        [5, 1, 'Develop decentralized drainage intervention & gradient proposal', 'Draft hydraulic calculation report for auxiliary culvert bypass and surface absorption grating.', 3, 'In Progress', 'Day 12'],
        [6, 1, 'Prepare pilot implementation and municipal submission dossier', 'Formulate budget estimate, 400m pilot schedule, and safety clearances for municipal corporation review.', 3, 'Pending', 'Day 15']
    ];
    for (const [id, tId, title, desc, assigned, status, due] of tasks) {
        await db.query(`INSERT INTO tasks (id, team_id, title, description, assigned_to, status, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [id, tId, title, desc, assigned, status, due]);
    }

    // 10. Solutions
    await db.query(`INSERT INTO solutions (id, challenge_id, team_id, title, description, status) VALUES (1, 1, 1, 'GIS-Guided Decentralized Stormwater Drainage & Blockage Clearance Intervention', 'A three-phase intervention combining high-priority desiltation of three choke points, installation of two high-capacity perforated intake grates at elevation depressions, and a 400m auxiliary gravity bypass to prevent stormwater backflow during intense monsoons.', 'Ready for Pilot Review')`);

    // 11. Progress Updates
    const updates = [
        [1, 1, 1, 'Field Survey & Hydrological Assessment Completed', 'Field mapping revealed 3 critical junction dips with accumulated debris reducing flow capacity by 40%.', 35, 2],
        [2, 1, 1, 'Hydraulic Inflow Modeling Finalized', 'Dr. Meena validated peak runoff capacity. Recommended 300mm auxiliary gradient bypass to relieve pressure.', 55, 3],
        [3, 1, 1, 'Pilot Engineering Proposal Drafted', 'Complete engineering specification and contractor estimates prepared for pilot demonstration.', 68, 4]
    ];
    for (const [id, cId, tId, title, desc, pct, by] of updates) {
        await db.query(`INSERT INTO progress_updates (id, challenge_id, team_id, title, description, percentage, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [id, cId, tId, title, desc, pct, by]);
    }

    // 12. Impact Metrics (Labeled Demo / Pilot Data)
    const metrics = [
        [1, 1, 'Average Waterlogging Duration (Heavy Rain)', '5.0', '2.0', '3.0', 'hours'],
        [2, 1, 'Flooded Residential Surface Area', '2.4', '1.2', '1.5', 'km²'],
        [3, 1, 'Monthly Civic Flooding Complaints', '12', '4', '7', 'incidents/month']
    ];
    for (const [id, cId, name, base, tgt, curr, unit] of metrics) {
        await db.query(`INSERT INTO impact_metrics (id, challenge_id, metric_name, baseline_value, target_value, current_value, unit) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [id, cId, name, base, tgt, curr, unit]);
    }

    // 13. Comments
    const comments = [
        [1, 1, 2, 'I mapped the affected residential streets and identified three critical low-lying junctions where water pools first.'],
        [2, 1, 3, 'The peak rainfall pattern indicates the existing culvert diameter is insufficient by approximately 35%. I will review the discharge rate calculations.'],
        [3, 1, 4, 'We can evaluate the proposed intervention for a 400m pilot section once the hydraulic clearances are finalized.']
    ];
    for (const [id, tId, uId, content] of comments) {
        await db.query(`INSERT INTO comments (id, team_id, user_id, content) VALUES ($1, $2, $3, $4)`, [id, tId, uId, content]);
    }

    // 14. Notifications
    const notifications = [
        [1, 1, 'CivicSolve AI completed analysis of your reported urban flooding problem.', 1],
        [2, 1, 'CivicSolve Flood Response Team has been formed and commenced field analysis.', 0],
        [3, 2, 'You were matched (92%) to the Chennai Urban Flooding challenge based on your GIS and Drainage Design skills.', 1],
        [4, 3, 'Collaboration invitation accepted for CivicSolve Flood Response Team.', 1]
    ];
    for (const [id, uId, msg, read] of notifications) {
        await db.query(`INSERT INTO notifications (id, user_id, message, read) VALUES ($1, $2, $3, $4)`, [id, uId, msg, read]);
    }

    console.log('✅ CivicSolve database seeded successfully with 8 challenges, hero flood response team, tasks, and pilot impact metrics.');
}

if (require.main === module) {
    seedDatabase().then(() => process.exit(0)).catch(err => {
        console.error('Seeding error:', err);
        process.exit(1);
    });
}

module.exports = { seedDatabase };
