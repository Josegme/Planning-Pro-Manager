-- M015: Subscription model — 2 free events then paid
-- Adds subscription columns to organizations table

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free_trial'
    CHECK (subscription_status IN ('free_trial', 'active', 'cancelled')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_event_limit integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS mercado_pago_preference_id text,
  ADD COLUMN IF NOT EXISTS subscription_updated_at timestamptz DEFAULT now();

-- Index for status lookups
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status
  ON organizations (subscription_status);

-- RLS: organizations already has policies; the new columns inherit them.
-- Organizations can read their own subscription status via existing SELECT policy.
-- Only service_role can UPDATE subscription_status (payment webhook will use service key).
