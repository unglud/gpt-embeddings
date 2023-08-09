import { openAIApiKey } from "./env.ts";
import store from "./store.ts";
/*import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";*/
import { GithubRepoLoader } from "https://esm.sh/v130/langchain@0.0.125/document_loaders/web/github";
import { Document } from "https://esm.sh/v130/langchain@0.0.125/document";
import { OpenAIEmbeddings } from "https://esm.sh/v130/langchain@0.0.125/embeddings/openai";

const githubUrl = "https://github.com/unglud/gpt-embeddings";
const loader = new GithubRepoLoader(
  githubUrl,
  { ignorePaths: [".run"] },
);
const docs = await loader.load().then((docs: [Document]) =>
  docs.map((doc: Document) => {
    doc.metadata = { fileName: doc.metadata.source, source: githubUrl };
    return doc;
  })
);
//console.log(docs);

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
/*const documentRes = await embeddings.embedDocuments(
  docs.map((doc: Document) => doc.pageContent),
);

console.log(`documentRes`, documentRes);*/

// Load the docs into the vector store.ts
const vectorStore = store(embeddings);
await vectorStore.addDocuments(docs);

// Search for the most similar document
const resultOne = await vectorStore.similaritySearch("embeddings", 2);

console.log(resultOne);

/*const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(
  "You are a helpful assistant that translates {input_language} to {output_language}.",
);
const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate("{text}");

const prompt = ChatPromptTemplate.fromPromptMessages([
  systemMessagePrompt,
  humanMessagePrompt,
]);

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
