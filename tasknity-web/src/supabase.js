import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL= "https://zsangtjxipvxbwmdmzoy.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYW5ndGp4aXB2eGJ3bWRtem95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk4NjEsImV4cCI6MjA4MDI2NTg2MX0.Au7p0GmMwbraGu9LjhIejff76boX-WLs7j-VtwUk0Mw"
);

