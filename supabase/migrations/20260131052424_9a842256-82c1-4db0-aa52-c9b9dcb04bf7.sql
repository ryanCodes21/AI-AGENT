-- Add unique constraint for user_id and platform combination in social_accounts
ALTER TABLE public.social_accounts 
ADD CONSTRAINT social_accounts_user_platform_unique UNIQUE (user_id, platform);