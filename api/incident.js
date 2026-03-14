import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { severity_code, description } = req.body;
        
        // Validate required fields
        if (!severity_code || !description) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['severity_code', 'description']
            });
        }

        // Validate severity code
        const validSeverities = ['Yellow', 'Orange', 'Red'];
        if (!validSeverities.includes(severity_code)) {
            return res.status(400).json({ 
                error: 'Invalid severity code',
                valid: validSeverities
            });
        }

        // Connect to NeonDB
        const sql = neon(process.env.DATABASE_URL);

        // Insert into database
        const result = await sql`
            INSERT INTO emergency_incidents 
            (incident_date, incident_time, severity_code, section, building, floor, description)
            VALUES (
                CURRENT_DATE,
                CURRENT_TIME,
                ${severity_code},
                'Lemon',
                '17',
                '1',
                ${description}
            )
            RETURNING id
        `;

        // Return success
        res.status(201).json({
            success: true,
            message: 'Incident recorded successfully',
            incident_id: result[0].id
        });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
