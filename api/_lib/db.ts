// Shared Postgres access for the leads CRM. Uses Neon's serverless driver —
// Vercel's Postgres storage integration injects DATABASE_URL (and a few
// aliases) automatically once a database is attached to this project.
import { neon } from '@neondatabase/serverless';

function getSql() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED;

  if (!connectionString) {
    throw new Error('Nenhuma variável de conexão com o banco de dados foi encontrada (DATABASE_URL).');
  }

  return neon(connectionString);
}

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      city TEXT,
      interest_type TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableEnsured = true;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  city: string | null;
  interestType: string | null;
  message: string | null;
  status: string;
  date: string;
}

export interface NewLeadInput {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  interestType?: string | null;
  message?: string | null;
}

export async function insertLead(input: NewLeadInput): Promise<void> {
  if (!input.id || !input.name || !input.phone) {
    throw new Error('id, name e phone são obrigatórios para salvar um lead.');
  }
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO leads (id, name, email, phone, city, interest_type, message, status)
    VALUES (${input.id}, ${input.name}, ${input.email || null}, ${input.phone}, ${input.city || null}, ${input.interestType || null}, ${input.message || null}, 'pending')
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function listLeads(): Promise<LeadRecord[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return (rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    city: r.city,
    interestType: r.interest_type,
    message: r.message,
    status: r.status,
    date: r.created_at,
  }));
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
}

export async function deleteLead(id: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`DELETE FROM leads WHERE id = ${id}`;
}
