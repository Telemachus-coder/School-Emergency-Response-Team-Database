// api/incident.js
export default async function handler(req, res) {
    // Allow requests from your ESP32
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

        // Get current date and time in Philippines (UTC+8)
        const now = new Date();
        const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const incident_date = phTime.toISOString().split('T')[0];
        const incident_time = phTime.toTimeString().split(' ')[0];

        // Prepare the data with FIXED values
        const incidentData = {
            incident_date: incident_date,
            incident_time: incident_time,
            severity_code: severity_code,
            section: 'Lemon',
            building: '17',
            floor: '1',
            description: description
        };

        console.log('Received incident:', incidentData);

        // Return success
        res.status(201).json({
            success: true,
            message: 'Incident received',
            data: incidentData
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
