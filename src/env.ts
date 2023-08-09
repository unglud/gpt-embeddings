import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config();

export const openAIApiKey = env.OPENAI_KEY;
export const supabasePrivateKey = env.SUPABASE_PRIVATE_KEY;
export const supabaseUrl = env.SUPABASE_URL;
