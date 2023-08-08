import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config();

const apiKey = env.OPENAI_KEY;

console.log("apiKey", apiKey);
