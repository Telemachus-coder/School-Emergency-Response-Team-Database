// api/incident.js
export default async function handler(req, res) {
    // Set CORS headers (though vercel.json already handles it)
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
        
        // Validate
        if (!severity_code || !description) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['severity_code', 'description']
            });
        }

        // Validate severity
        const validSeverities = ['Yellow', 'Orange', 'Red'];
        if (!validSeverities.includes(severity_code)) {
            return res.status(400).json({ error: 'Invalid severity code' });
        }

        // Get Philippines time (UTC+8)
        const now = new Date();
        const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const incident_date = phTime.toISOString().split('T')[0];
        const incident_time = phTime.toTimeString().split(' ')[0];

        // Here you would insert into your database
        // Since you already have a database connection in your website,
        // you can use the same connection method
        
        console.log('📥 Incident received:', {
            date: incident_date,
            time: incident_time,
            severity: severity_code,
            description: description,
            section: 'Lemon',
            building: '17',
            floor: '1'
        });

        // Return success
        res.status(201).json({
            success: true,
            message: 'Incident recorded',
            data: {
                id: Date.now(), // temporary ID until you add database
                timestamp: `${incident_date} ${incident_time}`,
                severity: severity_code,
                location: {
                    section: 'Lemon',
                    building: '17',
                    floor: '1'
                }
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
