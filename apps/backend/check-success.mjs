import postgres from 'postgres';
async function main() {
  const sql = postgres('postgresql://neondb_owner:npg_MrSnAKQ23DGF@ep-aged-feather-a1jp54mb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  const res = await sql`SELECT status, COUNT(*) FROM message_deliveries GROUP BY status`;
  console.log(res);
  
  const latestFailures = await sql`SELECT * FROM message_deliveries WHERE status = 'failed' ORDER BY created_at DESC LIMIT 1`;
  if (latestFailures.length > 0) {
    console.log("Latest failure error:", latestFailures[0].error_message);
  }
  await sql.end();
}
main();
