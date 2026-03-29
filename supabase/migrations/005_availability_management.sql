-- ============================================
-- Availability Management
-- Pause items/users + blocked date ranges
-- ============================================

-- Add pause columns
ALTER TABLE public.items ADD COLUMN is_paused boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN is_paused boolean NOT NULL DEFAULT false;

-- Create item_unavailabilities table
CREATE TABLE public.item_unavailabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_unavail_dates CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_item_unavailabilities_item ON public.item_unavailabilities(item_id);
CREATE INDEX idx_item_unavailabilities_dates ON public.item_unavailabilities(start_date, end_date);
CREATE INDEX idx_items_paused ON public.items(is_paused);

-- Enable RLS
ALTER TABLE public.item_unavailabilities ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read unavailabilities (needed for booking calendar)
CREATE POLICY "Unavailabilities are publicly readable" ON public.item_unavailabilities
  FOR SELECT USING (true);

-- RLS: item owner can insert
CREATE POLICY "Owners can create unavailabilities" ON public.item_unavailabilities
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM public.items WHERE id = item_id)
  );

-- RLS: item owner can delete
CREATE POLICY "Owners can delete unavailabilities" ON public.item_unavailabilities
  FOR DELETE USING (
    auth.uid() IN (SELECT owner_id FROM public.items WHERE id = item_id)
  );
