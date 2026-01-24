from supabase import create_client, Client
from app.core.config import settings

# Regular client for public operations
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Admin client with service role key (bypasses RLS)
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
