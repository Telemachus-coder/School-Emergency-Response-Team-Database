// api/incident.js
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { severity_code, description } = req.body;
        
        // Validate required fields
        if (!severity_code || !description) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['severity_code', 'description'],
                received: req.body
            });
        }

        // Validate severity code (matching your CHECK constraint)
        const validSeverities = ['Red', 'Orange', 'Yellow'];
        if (!validSeverities.includes(severity_code)) {
            return res.status(400).json({ 
                error: 'Invalid severity code',
                valid: validSeverities,
                received: severity_code
            });
        }

        // Get current date and time in Philippines (UTC+8)
        const now = new Date();
        const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const incident_date = phTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const incident_time = phTime.toTimeString().split(' ')[0]; // HH:MM:SS

        // Connect to NeonDB
        const sql = neon(process.env.DATABASE_URL);

        // Insert into database with FIXED values matching your schema
        const result = await sql`
            INSERT INTO emergency_incidents 
            (incident_date, incident_time, severity_code, section, building, floor, description)
            VALUES (
                ${incident_date}, 
                ${incident_time}, 
                ${severity_code}, 
                'Lemon',           -- Fixed section from your CHECK constraint
                '17',               -- Fixed building from your CHECK constraint
                '1',                -- Fixed floor from your CHECK constraint
                ${description}      -- 'minor', 'major', or 'critical'
            )
            RETURNING id, created_at
        `;

        // Log success
        console.log('✅ Incident recorded in NeonDB:', {
            id: result[0].id,
            severity: severity_code,
            date: incident_date,
            time: incident_time,
            location: 'Lemon, Building 17, Floor 1',
            description: description,
            created_at: result[0].created_at
        });

        // Return success with all details
        res.status(201).json({
            success: true,
            message: 'Emergency incident recorded successfully',
            incident_id: result[0].id,
            timestamp: `${incident_date} ${incident_time}`,
            data: {
                severity: severity_code,
                section: 'Lemon',
                building: '17',
                floor: '1',
                description: description
            }
        });

    } catch (error) {
        console.error('❌ Database error:', error);
        
        // Check for specific database errors
        if (error.code === '23514') { // CHECK constraint violation
            return res.status(400).json({ 
                error: 'Invalid data format',
                details: 'Value violates check constraint',
                message: error.message
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to record incident',
            details: error.message 
        });
    }
}
