import { openAIApiKey } from "./env.ts";
import getStore from "./store.ts";
import loadGitHub from "./loaders/github.ts";

import { OpenAI } from "https://esm.sh/v130/langchain@0.0.125/llms/openai";
import { OpenAIEmbeddings } from "https://esm.sh/v130/langchain@0.0.125/embeddings/openai";
import { RetrievalQAChain } from "https://esm.sh/v130/langchain@0.0.125/chains";

const docs = await loadGitHub();
//console.log("docs", docs);

const model = new OpenAI({ openAIApiKey });
const embeddings = new OpenAIEmbeddings({ openAIApiKey });

// Load the docs into the vector getStore.ts
const vectorStore = getStore(embeddings);
await vectorStore.addDocuments(docs);

// Initialize a retriever wrapper around the vector store
const vectorStoreRetriever = vectorStore.asRetriever();

// Create a chain that uses the OpenAI LLM and vector store.
const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
const res = await chain.call({
  query: "embeddings",
});

console.log(`res`, res);
