// api/log-incident.js
import { Neon } from '@neondatabase/serverless';

const sql = Neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { severity_code, description } = await request.json();
    
    if (!severity_code || !['Red', 'Orange', 'Yellow'].includes(severity_code)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid severity_code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      INSERT INTO emergency_incidents (
        incident_date, 
        incident_time, 
        severity_code, 
        section, 
        building, 
        floor, 
        description
      ) VALUES (
        CURRENT_DATE,
        CURRENT_TIME,
        ${severity_code},
        'Lemon',
        '17',
        '1',
        ${description || null}
      )
      RETURNING id, created_at
    `;
    
    console.log(`Incident logged: ID ${result[0].id}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      incident_id: result[0].id,
      created_at: result[0].created_at 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to log incident' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
