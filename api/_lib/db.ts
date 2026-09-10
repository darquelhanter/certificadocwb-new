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
  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id BIGSERIAL PRIMARY KEY,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS whatsapp_messages_phone_idx ON whatsapp_messages (phone, created_at)`;
  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_pauses (
      phone TEXT PRIMARY KEY,
      paused_until TIMESTAMPTZ NOT NULL
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Recent chat history for one WhatsApp number, oldest first — used to give
// the support bot short-term memory across a customer's messages.
export async function getConversationHistory(phone: string, limit = 12): Promise<ChatMessage[]> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT role, content FROM whatsapp_messages
    WHERE phone = ${phone}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return (rows as any[]).reverse().map((r) => ({ role: r.role, content: r.content }));
}

export async function appendConversationMessage(phone: string, role: 'user' | 'assistant', content: string): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`INSERT INTO whatsapp_messages (phone, role, content) VALUES (${phone}, ${role}, ${content})`;
}

// Used to tell the bot's own outgoing message (echoed back by Evolution API
// as a fromMe:true event) apart from a message the admin actually typed —
// if it doesn't match what we just sent, a human took over the conversation.
export async function getLastAssistantMessage(phone: string): Promise<string | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`
    SELECT content FROM whatsapp_messages
    WHERE phone = ${phone} AND role = 'assistant'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return (rows as any[])[0]?.content ?? null;
}

export async function pausePhone(phone: string, hours: number): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO whatsapp_pauses (phone, paused_until)
    VALUES (${phone}, now() + (${hours}::text || ' hours')::interval)
    ON CONFLICT (phone) DO UPDATE SET paused_until = EXCLUDED.paused_until
  `;
}

export async function isPhonePaused(phone: string): Promise<boolean> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT 1 FROM whatsapp_pauses WHERE phone = ${phone} AND paused_until > now()`;
  return (rows as any[]).length > 0;
}
