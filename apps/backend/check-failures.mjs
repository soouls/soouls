import postgres from 'postgres';

async function main() {
  const sql = postgres(
    'postgresql://neondb_owner:npg_MrSnAKQ23DGF@ep-aged-feather-a1jp54mb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  );
  const res =
    await sql`SELECT * FROM message_deliveries WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5`;
  console.log(res);
  await sql.end();
}
main();
