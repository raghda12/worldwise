import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vzpgrivrvzjhufphahyk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cGdyaXZydnpqaHVmcGhhaHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzA4NjksImV4cCI6MjA4NzQwNjg2OX0.11QEY5YAmQfqDTciTsA6FLnMw243-_SRFavkKEBkFxM";

export const supabase = createClient(supabaseUrl, supabaseKey);
