import { Injectable, type OnModuleInit } from '@nestjs/common';
import { db, sql } from '@soouls/database/client';
import { isVercelRuntime } from './runtime';

@Injectable()
export class AppService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    // Skip DDL migrations on Vercel serverless — they timeout the cold start.
    // These columns already exist in production; run migrations via a dedicated script instead.
    if (isVercelRuntime) {
      console.log('[AppService] Skipping DDL migrations on Vercel serverless runtime.');
      return;
    }
    await this.ensureUserProfileColumns();
  }

  getHello(): string {
    return 'Hello World! rudra singh';
  }

  private async ensureUserProfileColumns(): Promise<void> {
    await db.execute(sql`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "theme_preference" text DEFAULT 'aurora',
        ADD COLUMN IF NOT EXISTS "preferences" jsonb,
        ADD COLUMN IF NOT EXISTS "mascot" text DEFAULT 'Lumi',
        ADD COLUMN IF NOT EXISTS "is_waitlist_user" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "marketing_email_opt_in" boolean DEFAULT true NOT NULL,
        ADD COLUMN IF NOT EXISTS "marketing_whatsapp_opt_in" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "transactional_email_opt_in" boolean DEFAULT true NOT NULL,
        ADD COLUMN IF NOT EXISTS "transactional_whatsapp_opt_in" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "welcome_email_sent_at" timestamp,
        ADD COLUMN IF NOT EXISTS "welcome_whatsapp_sent_at" timestamp,
        ADD COLUMN IF NOT EXISTS "last_secure_access_sent_at" timestamp
    `);

    await db.execute(sql`
      ALTER TABLE "clusters"
        ADD COLUMN IF NOT EXISTS "color" text DEFAULT '#F59E0B',
        ADD COLUMN IF NOT EXISTS "icon" text DEFAULT 'sparkles',
        ADD COLUMN IF NOT EXISTS "metadata" jsonb,
        ADD COLUMN IF NOT EXISTS "is_pinned" boolean DEFAULT false NOT NULL
    `);

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
  }
}
