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
    const userColumns = [
      { name: 'theme_preference', type: 'text', default: "'aurora'" },
      { name: 'preferences', type: 'jsonb' },
      { name: 'mascot', type: 'text', default: "'Lumi'" },
      { name: 'is_waitlist_user', type: 'boolean', default: 'false', notNull: true },
      { name: 'marketing_email_opt_in', type: 'boolean', default: 'true', notNull: true },
      { name: 'marketing_whatsapp_opt_in', type: 'boolean', default: 'false', notNull: true },
      { name: 'transactional_email_opt_in', type: 'boolean', default: 'true', notNull: true },
      { name: 'transactional_whatsapp_opt_in', type: 'boolean', default: 'false', notNull: true },
      { name: 'welcome_email_sent_at', type: 'timestamp' },
      { name: 'welcome_whatsapp_sent_at', type: 'timestamp' },
      { name: 'last_secure_access_sent_at', type: 'timestamp' },
    ];

    for (const col of userColumns) {
      try {
        await db.execute(
          sql.raw(`
          ALTER TABLE "users" 
          ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} 
          ${col.default ? `DEFAULT ${col.default}` : ''} 
          ${col.notNull ? 'NOT NULL' : ''};
        `),
        );
      } catch (err) {
        console.warn(
          `[AppService] Could not add column ${col.name} to users table:`,
          (err as Error).message,
        );
      }
    }

    const clusterColumns = [
      { name: 'color', type: 'text', default: "'#F59E0B'" },
      { name: 'icon', type: 'text', default: "'sparkles'" },
      { name: 'metadata', type: 'jsonb' },
      { name: 'is_pinned', type: 'boolean', default: 'false', notNull: true },
    ];

    for (const col of clusterColumns) {
      try {
        await db.execute(
          sql.raw(`
          ALTER TABLE "clusters" 
          ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} 
          ${col.default ? `DEFAULT ${col.default}` : ''} 
          ${col.notNull ? 'NOT NULL' : ''};
        `),
        );
      } catch (err) {
        console.warn(
          `[AppService] Could not add column ${col.name} to clusters table:`,
          (err as Error).message,
        );
      }
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
        );
      `);
    } catch (err) {
      console.warn('[AppService] Could not create entry_canvases table:', (err as Error).message);
    }

    const canvasColumns = [
      { name: 'user_id', type: 'uuid' },
      { name: 'entry_id', type: 'uuid' },
      { name: 'canvas_title', type: 'text' },
      { name: 'cards', type: 'jsonb' },
      { name: 'connections', type: 'jsonb' },
      { name: 'cluster_insight', type: 'text' },
      { name: 'generation_metadata', type: 'jsonb' },
      { name: 'last_edited', type: 'timestamp', default: 'now()' },
      { name: 'updated_at', type: 'timestamp', default: 'now()' },
    ];

    for (const col of canvasColumns) {
      try {
        await db.execute(
          sql.raw(`
          ALTER TABLE "entry_canvases" 
          ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} 
          ${col.default ? `DEFAULT ${col.default}` : ''};
        `),
        );
      } catch (err) {
        console.warn(
          `[AppService] Could not add column ${col.name} to entry_canvases table:`,
          (err as Error).message,
        );
      }
    }

    try {
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
    } catch (err) {
      console.warn(
        '[AppService] Could not add unique constraint to entry_canvases:',
        (err as Error).message,
      );
    }
  }
}
