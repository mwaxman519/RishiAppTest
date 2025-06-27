import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for serverless Neon connections
neonConfig.webSocketConstructor = ws;

console.log("Connecting to database...");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log("Pushing schema changes to database...");

// Push the schema to the database
try {
  await pool.query(`
    -- Create brands table if it doesn't exist
    CREATE TABLE IF NOT EXISTS brands (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      primary_color TEXT,
      secondary_color TEXT,
      organization_id UUID REFERENCES organizations(id),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create kit_templates table if it doesn't exist
    CREATE TABLE IF NOT EXISTS kit_templates (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      organization_id UUID REFERENCES organizations(id),
      brand_id UUID REFERENCES brands(id),
      components JSONB,
      instructions TEXT,
      approval_status TEXT DEFAULT 'pending',
      approved_by_id UUID REFERENCES users(id),
      approval_date TIMESTAMP,
      approval_notes TEXT,
      requested_by_id UUID REFERENCES users(id),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create kits table if it doesn't exist
    CREATE TABLE IF NOT EXISTS kits (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      template_id UUID REFERENCES kit_templates(id),
      location_id UUID REFERENCES locations(id),
      status TEXT NOT NULL DEFAULT 'available',
      organization_id UUID REFERENCES organizations(id),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create activity_types table
    CREATE TABLE IF NOT EXISTS activity_types (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      organization_id UUID REFERENCES organizations(id),
      is_system_defined BOOLEAN NOT NULL DEFAULT false,
      metadata_schema JSONB,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create activities table
    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type_id UUID NOT NULL REFERENCES activity_types(id),
      location_id UUID REFERENCES locations(id),
      organization_id UUID NOT NULL REFERENCES organizations(id),
      brand_id UUID REFERENCES brands(id),
      created_by_id UUID NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      all_day BOOLEAN NOT NULL DEFAULT false,
      recurrence_rule TEXT,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      metadata JSONB,
      requirements JSONB,
      budget DECIMAL(10,2),
      priority TEXT DEFAULT 'medium',
      notes TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create activity_assignments table
    CREATE TABLE IF NOT EXISTS activity_assignments (
      id UUID PRIMARY KEY,
      activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id),
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      checked_in_at TIMESTAMP,
      checked_out_at TIMESTAMP,
      feedback TEXT,
      rating INTEGER,
      special_instructions TEXT,
      compensation DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create activity_kits table
    CREATE TABLE IF NOT EXISTS activity_kits (
      id UUID PRIMARY KEY,
      activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      kit_template_id UUID REFERENCES kit_templates(id),
      kit_instance_id UUID REFERENCES kits(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'needed',
      assigned_to_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert default activity types with UUID IDs
    INSERT INTO activity_types (id, name, description, is_system_defined, active)
    VALUES 
      (gen_random_uuid(), 'Event', 'Standard events such as promotions, sampling, or trade shows', true, true),
      (gen_random_uuid(), 'Secret Shopping', 'Covert assessment of retail or service experiences', true, true),
      (gen_random_uuid(), 'Merchandising', 'Stocking, arranging, and maintaining products in retail spaces', true, true),
      (gen_random_uuid(), 'Logistics', 'Transportation, inventory movement, and supply chain activities', true, true),
      (gen_random_uuid(), 'Training', 'Educational and skill development sessions', true, true),
      (gen_random_uuid(), 'Other', 'Miscellaneous activities that don''t fit other categories', true, true)
    ON CONFLICT DO NOTHING;
  `);
  
  console.log("Schema changes successfully pushed to database!");
} catch (error) {
  console.error("Error pushing schema changes:", error);
  process.exit(1);
} finally {
  // Close connection
  await pool.end();
}

process.exit(0);