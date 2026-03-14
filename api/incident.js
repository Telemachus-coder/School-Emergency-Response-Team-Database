// api/incident.js (Pages Router)
import { Neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      incident_date, 
      incident_time, 
      severity_code, 
      section, 
      building, 
      floor, 
      description 
    } = req.body;

    const sql = Neon(process.env.DATABASE_URL);
    
    const result = await sql`
      INSERT INTO incidents (
        incident_date, 
        incident_time, 
        severity_code, 
        section, 
        building, 
        floor, 
        description
      ) VALUES (
        ${incident_date}::date,
        ${incident_time}::time,
        ${severity_code},
        ${section},
        ${building},
        ${floor},
        ${description}
      )
      RETURNING *;
    `;

    res.status(201).json({ 
      success: true, 
      message: 'Incident logged successfully',
      data: result[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to log incident',
      details: error.message 
    });
  }
}
