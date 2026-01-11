-- Add indexes for scale optimization (millions of users)
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ai_score ON public.leads(ai_score DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON public.scheduled_posts(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_ai_automations_user_id ON public.ai_automations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_automations_type ON public.ai_automations(type);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);

-- Add business_records table for record keeping with AI oversight
CREATE TABLE public.business_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL, -- 'expense', 'income', 'transaction', 'note', 'meeting', 'task'
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2),
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_summary TEXT,
  ai_insights TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add social_interactions table for auto lead tracking from DMs/comments
CREATE TABLE public.social_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'facebook', 'tiktok', 'instagram', 'twitter', 'linkedin'
  interaction_type TEXT NOT NULL, -- 'dm', 'comment', 'mention', 'inquiry'
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  message_content TEXT,
  sentiment TEXT, -- 'positive', 'neutral', 'negative'
  ai_extracted_data JSONB DEFAULT '{}',
  converted_to_lead BOOLEAN DEFAULT false,
  lead_id UUID REFERENCES public.leads(id),
  source_post_id TEXT,
  interaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add business_profile table for AI consultant context
CREATE TABLE public.business_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  industry TEXT,
  location TEXT,
  country TEXT,
  city TEXT,
  target_audience TEXT,
  main_products TEXT[],
  competitors TEXT[],
  business_goals TEXT[],
  monthly_budget DECIMAL(12,2),
  employee_count INTEGER,
  founded_year INTEGER,
  website TEXT,
  ai_swot_analysis JSONB, -- {strengths:[], weaknesses:[], opportunities:[], threats:[]}
  ai_recommendations JSONB,
  last_ai_analysis TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add campaign_tracking table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'awareness', 'engagement', 'conversion', 'retention'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  platforms TEXT[],
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  goals JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  ai_performance_score INTEGER,
  ai_insights TEXT,
  metrics JSONB DEFAULT '{}', -- {impressions, clicks, conversions, roi}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on new tables
ALTER TABLE public.business_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_records
CREATE POLICY "Users can view their own business records"
ON public.business_records FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business records"
ON public.business_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business records"
ON public.business_records FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business records"
ON public.business_records FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social_interactions
CREATE POLICY "Users can view their own social interactions"
ON public.social_interactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social interactions"
ON public.social_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social interactions"
ON public.social_interactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social interactions"
ON public.social_interactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for business_profile
CREATE POLICY "Users can view their own business profile"
ON public.business_profile FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business profile"
ON public.business_profile FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
ON public.business_profile FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profile"
ON public.business_profile FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for campaigns
CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for new tables
CREATE INDEX idx_business_records_user_id ON public.business_records(user_id);
CREATE INDEX idx_business_records_date ON public.business_records(date DESC);
CREATE INDEX idx_business_records_type ON public.business_records(record_type);

CREATE INDEX idx_social_interactions_user_id ON public.social_interactions(user_id);
CREATE INDEX idx_social_interactions_platform ON public.social_interactions(platform);
CREATE INDEX idx_social_interactions_type ON public.social_interactions(interaction_type);
CREATE INDEX idx_social_interactions_date ON public.social_interactions(interaction_date DESC);

CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Add triggers for updated_at
CREATE TRIGGER update_business_records_updated_at
BEFORE UPDATE ON public.business_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_profile_updated_at
BEFORE UPDATE ON public.business_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();