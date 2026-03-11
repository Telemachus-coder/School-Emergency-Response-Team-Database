import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    // Allow CORS for debugging (optional)
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const connectionString = process.env.NEON_CONNECTION_STRING;
    
    if (!connectionString) {
        console.error("Missing NEON_CONNECTION_STRING");
        return res.status(500).json({ error: "Database connection string not configured" });
    }
    
    const sql = neon(connectionString);
    
    try {
        // Test query to check connection and table
        const result = await sql`SELECT * FROM emergency_incidents ORDER BY created_at DESC LIMIT 5`;
        res.status(200).json(result);
    } catch (error) {
        console.error("Database error:", error);
        // Send detailed error (remove in production)
        res.status(500).json({ 
            error: error.message,
            hint: "Check table name, columns, and database connection"
        });
    }
}
