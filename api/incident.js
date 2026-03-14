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
                received: req.body
            });
        }

        // Validate severity code
        const validSeverities = ['Yellow', 'Orange', 'Red'];
        if (!validSeverities.includes(severity_code)) {
            return res.status(400).json({ 
                error: 'Invalid severity code. Must be Yellow, Orange, or Red' 
            });
        }

        // Get current date and time in Philippines (UTC+8)
        const now = new Date();
        const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const incident_date = phTime.toISOString().split('T')[0];
        const incident_time = phTime.toTimeString().split(' ')[0];

        // Connect to NeonDB
        const sql = neon(process.env.DATABASE_URL);

        // Insert into database with FIXED values
        const result = await sql`
            INSERT INTO emergency_incidents 
            (incident_date, incident_time, severity_code, section, building, floor, description)
            VALUES (
                ${incident_date}, 
                ${incident_time}, 
                ${severity_code}, 
                'Lemon', 
                '17', 
                '1', 
                ${description}
            )
            RETURNING id
        `;

        // Log success
        console.log('✅ Incident recorded:', {
            id: result[0].id,
            severity: severity_code,
            time: `${incident_date} ${incident_time}`,
            location: 'Lemon, Building 17, Floor 1'
        });

        // Return success
        res.status(201).json({
            success: true,
            message: 'Incident recorded successfully',
            incident_id: result[0].id,
            timestamp: `${incident_date} ${incident_time}`,
            location: {
                section: 'Lemon',
                building: '17',
                floor: '1'
            }
        });

    } catch (error) {
        console.error('❌ Database error:', error);
        res.status(500).json({ 
            error: 'Failed to record incident',
            details: error.message 
        });
    }
}
