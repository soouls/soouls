import { sql } from 'drizzle-orm';
import { db } from './src/client';

async function main() {
  console.log('Running manual migration...');

  try {
    await db.execute(
      sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_waitlist_user" boolean DEFAULT false NOT NULL`,
    );
    console.log('Added is_waitlist_user to users table');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "theme_preference" text DEFAULT 'aurora',
        ADD COLUMN IF NOT EXISTS "preferences" jsonb,
        ADD COLUMN IF NOT EXISTS "mascot" text DEFAULT 'Lumi',
        ADD COLUMN IF NOT EXISTS "marketing_email_opt_in" boolean DEFAULT true NOT NULL,
        ADD COLUMN IF NOT EXISTS "marketing_whatsapp_opt_in" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "transactional_email_opt_in" boolean DEFAULT true NOT NULL,
        ADD COLUMN IF NOT EXISTS "transactional_whatsapp_opt_in" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "welcome_email_sent_at" timestamp,
        ADD COLUMN IF NOT EXISTS "welcome_whatsapp_sent_at" timestamp,
        ADD COLUMN IF NOT EXISTS "last_secure_access_sent_at" timestamp
    `);
    console.log('Synced user profile/settings columns');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      ALTER TABLE "clusters"
        ADD COLUMN IF NOT EXISTS "color" text DEFAULT '#F59E0B',
        ADD COLUMN IF NOT EXISTS "icon" text DEFAULT 'sparkles',
        ADD COLUMN IF NOT EXISTS "metadata" jsonb,
        ADD COLUMN IF NOT EXISTS "is_pinned" boolean DEFAULT false NOT NULL
    `);
    console.log('Synced cluster AI metadata columns');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "entry_canvases" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "entry_id" uuid NOT NULL REFERENCES "journal_entries"("id") ON DELETE CASCADE,
        "canvas_title" text NOT NULL,
        "cards" jsonb NOT NULL,
        "connections" jsonb NOT NULL,
        "cluster_insight" text,
        "generation_metadata" jsonb,
        "last_edited" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "entry_canvases_entry_id_unique" UNIQUE("entry_id")
      )
    `);
    await db.execute(sql`
      ALTER TABLE "entry_canvases"
        ADD COLUMN IF NOT EXISTS "user_id" uuid,
        ADD COLUMN IF NOT EXISTS "entry_id" uuid,
        ADD COLUMN IF NOT EXISTS "canvas_title" text,
        ADD COLUMN IF NOT EXISTS "cards" jsonb,
        ADD COLUMN IF NOT EXISTS "connections" jsonb,
        ADD COLUMN IF NOT EXISTS "cluster_insight" text,
        ADD COLUMN IF NOT EXISTS "generation_metadata" jsonb,
        ADD COLUMN IF NOT EXISTS "last_edited" timestamp DEFAULT now(),
        ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now()
    `);
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'entry_canvases_entry_id_unique'
        ) THEN
          ALTER TABLE "entry_canvases"
          ADD CONSTRAINT "entry_canvases_entry_id_unique" UNIQUE ("entry_id");
        END IF;
      END $$;
    `);
    console.log('Synced entry canvas table/columns');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "waitlist_users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "phone_number" text,
        "source" text DEFAULT 'survey' NOT NULL,
        "claimed_at" timestamp,
        "claimed_by_user_id" uuid,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "waitlist_users_email_unique" UNIQUE("email")
      )
    `);
    console.log('Created waitlist_users table');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_users_claimed_by_user_id_users_id_fk'
        ) THEN
          ALTER TABLE "waitlist_users" ADD CONSTRAINT "waitlist_users_claimed_by_user_id_users_id_fk" 
          FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log('Added foreign key constraint');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "razorpay_customer_id" text,
        ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'free' NOT NULL,
        ADD COLUMN IF NOT EXISTS "plan_type" text DEFAULT 'free' NOT NULL,
        ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp,
        ADD COLUMN IF NOT EXISTS "current_period_end" timestamp,
        ADD COLUMN IF NOT EXISTS "cancel_at_period_end" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "payment_provider" text
    `);
    console.log('Added subscription columns to users table');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider_subscription_id" text NOT NULL UNIQUE,
        "provider" text NOT NULL,
        "status" text NOT NULL,
        "plan_type" text NOT NULL,
        "current_period_start" timestamp NOT NULL,
        "current_period_end" timestamp NOT NULL,
        "cancel_at_period_end" boolean DEFAULT false NOT NULL,
        "canceled_at" timestamp,
        "ended_at" timestamp,
        "trial_start" timestamp,
        "trial_end" timestamp,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('Created subscriptions table');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "subscription_id" uuid REFERENCES "subscriptions"("id") ON DELETE SET NULL,
        "provider_payment_id" text NOT NULL UNIQUE,
        "provider" text NOT NULL,
        "amount" integer NOT NULL,
        "currency" text NOT NULL,
        "status" text NOT NULL,
        "receipt_url" text,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('Created payments table');
  } catch (e) {
    console.warn(e.message);
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "razorpay_webhooks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "razorpay_event_id" text NOT NULL UNIQUE,
        "event_type" text NOT NULL,
        "status" text DEFAULT 'success' NOT NULL,
        "payload" jsonb,
        "processed_at" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('Created razorpay_webhooks table');
  } catch (e) {
    console.warn(e.message);
  }

  console.log('Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
