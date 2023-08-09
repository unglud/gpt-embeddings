/*import { config } from "https://deno.land/x/dotenv/mod.ts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";*/
import { GithubRepoLoader } from "langchain/document_loaders/web/github";

const loader = new GithubRepoLoader(
  "https://github.com/unglud/gpt-embeddings",
  { ignorePaths: [".run"] },
);
const docs = await loader.load();
console.log({ docs });

/*const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(
  "You are a helpful assistant that translates {input_language} to {output_language}.",
);
const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{text}");

const prompt = ChatPromptTemplate.fromPromptMessages([
  systemMessagePrompt,
  humanMessagePrompt,
]);

const env = config();
const openAIApiKey = env.OPENAI_KEY;

const llm = new ChatOpenAI({
  openAIApiKey,
  temperature: 0.9,
});

const chain = new LLMChain({
  llm,
  prompt,
  memory: new BufferMemory(),
  verbose: true,
});

const response = await chain.call({
  input_language: "English",
  output_language: "French",
  text: "I love programming",
});

console.log(`result`, response);*/
