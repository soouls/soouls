import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

type EnvReport = {
  bucket: string;
  endpoint: string;
  publicUrl: string;
  accessKeyIdPresent: boolean;
  secretKeyPresent: boolean;
};

function requiredEnv(): EnvReport {
  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : '');
  const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';

  return {
    bucket,
    endpoint,
    publicUrl,
    accessKeyIdPresent: Boolean(accessKeyId),
    secretKeyPresent: Boolean(secretAccessKey),
  };
}

function getClient() {
  return new S3Client({
    region: 'auto',
    endpoint:
      process.env.CLOUDFLARE_R2_ENDPOINT ||
      (process.env.R2_ACCOUNT_ID
        ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      secretAccessKey:
        process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    },
  });
}

function printHeader(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const report = requiredEnv();
  printHeader('R2 ENV CHECK');
  console.table({
    bucket: report.bucket || '[missing]',
    endpoint: report.endpoint || '[missing]',
    publicUrl: report.publicUrl || '[missing]',
    accessKeyIdPresent: report.accessKeyIdPresent,
    secretKeyPresent: report.secretKeyPresent,
  });

  const missing: string[] = [];
  if (!report.bucket) missing.push('R2_BUCKET_NAME (or CLOUDFLARE_R2_BUCKET_NAME)');
  if (!report.endpoint) missing.push('CLOUDFLARE_R2_ENDPOINT or R2_ACCOUNT_ID');
  if (!report.publicUrl) missing.push('R2_PUBLIC_URL (or CLOUDFLARE_R2_PUBLIC_URL)');
  if (!report.accessKeyIdPresent) missing.push('R2_ACCESS_KEY_ID');
  if (!report.secretKeyPresent) missing.push('R2_SECRET_ACCESS_KEY');
  if (missing.length > 0) {
    console.error('\nMissing required env vars:');
    for (const key of missing) console.error(`- ${key}`);
    process.exit(1);
  }

  const s3 = getClient();
  const bucket = report.bucket;

  printHeader('BUCKET LIST CHECK');
  try {
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 20 }));
    console.log(`Object count sampled: ${listed.Contents?.length ?? 0}`);
    for (const object of listed.Contents ?? []) {
      console.log(`- ${object.Key} (${object.Size ?? 0} bytes)`);
    }
  } catch (error) {
    console.error('Failed to list bucket objects:', error);
    process.exit(1);
  }

  const probeKey = `healthcheck/${Date.now()}-r2-inspect.txt`;
  const probeBody = Buffer.from(`soouls-r2-probe ${new Date().toISOString()}`, 'utf8');
  const probeContentType = 'text/plain; charset=utf-8';

  printHeader('PUT OBJECT CHECK');
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: probeKey,
        Body: probeBody,
        ContentType: probeContentType,
      }),
    );
    console.log(`Uploaded probe object: ${probeKey}`);
  } catch (error) {
    console.error('Failed to upload probe object:', error);
    process.exit(1);
  }

  printHeader('HEAD OBJECT CHECK');
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: probeKey }));
    console.log('HeadObject OK');
    console.table({
      contentType: head.ContentType || '[empty]',
      contentLength: head.ContentLength ?? 0,
      etag: head.ETag || '[empty]',
      lastModified: head.LastModified?.toISOString() || '[empty]',
    });
  } catch (error) {
    console.error('Failed to head probe object:', error);
    process.exit(1);
  }

  printHeader('PUBLIC URL CHECK');
  const normalizedBase = report.publicUrl.replace(/\/+$/, '');
  const publicProbeUrl = `${normalizedBase}/${probeKey}`;
  try {
    const response = await fetch(publicProbeUrl, { method: 'GET' });
    const body = await response.text();
    console.table({
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type') || '[missing]',
      cacheControl: response.headers.get('cache-control') || '[missing]',
    });
    if (!response.ok) {
      console.error(`Public URL is not reachable: ${publicProbeUrl}`);
      process.exit(1);
    }
    if (!body.includes('soouls-r2-probe')) {
      console.error('Public URL response body did not match probe payload.');
      process.exit(1);
    }
    console.log(`Public URL OK: ${publicProbeUrl}`);
  } catch (error) {
    console.error('Failed to fetch public URL for probe object:', error);
    process.exit(1);
  }

  printHeader('CLEANUP');
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: probeKey }));
    console.log(`Deleted probe object: ${probeKey}`);
  } catch (error) {
    console.warn('Could not delete probe object (safe to remove manually):', error);
  }

  printHeader('DB STALE MEDIA URL QUERY');
  console.log(
    [
      'Run this SQL on your app DB to detect stale/mismatched media refs:',
      '',
      'select id, media_url, created_at',
      'from journal_entries',
      'where media_url is not null',
      "  and (media_url not like 'https://%'",
      "       or media_url not like (coalesce(current_setting('app.r2_public_url', true), '%')))",
      'order by created_at desc',
      'limit 200;',
    ].join('\n'),
  );

  console.log('\nR2 inspection completed successfully.');
}

main().catch((error) => {
  console.error('Unexpected R2 inspection error:', error);
  process.exit(1);
});
