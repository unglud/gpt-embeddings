import { config } from "https://deno.land/x/dotenv/mod.ts";
import { OpenAI } from "https://esm.sh/langchain/llms/openai";
// import { PromptTemplate } from "https://esm.sh/langchain/prompts";
import { BufferMemory } from "https://esm.sh/langchain/memory";
import { ConversationChain } from "https://esm.sh/langchain/chains";

const env = config();
const openAIApiKey = env.OPENAI_KEY;

const llm = new OpenAI({
  openAIApiKey,
  temperature: 0.9,
});

const memory = new BufferMemory();

const chain = new ConversationChain({
  llm,
  memory,
  verbose: true,
});

await chain.call({ input: "Hi! I'm Jim." });
const res2 = await chain.call({ input: "What's my name?" });

console.log(`result`, res2);
