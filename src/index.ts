import { openAIApiKey } from "./env.ts";
import getStore from "./store.ts";
import loadGitHub from "./loaders/github.ts";

import { OpenAI } from "https://esm.sh/v130/langchain@0.0.125/llms/openai";
import { OpenAIEmbeddings } from "https://esm.sh/v130/langchain@0.0.125/embeddings/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "https://esm.sh/v130/langchain@0.0.125/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "https://esm.sh/v130/langchain@0.0.125/schema/runnable";
import { StringOutputParser } from "https://esm.sh/v130/langchain@0.0.125/schema/output_parser";
import { Document } from "https://esm.sh/v130/langchain@0.0.125/document";
import { BaseCallbackHandler } from "https://esm.sh/v130/langchain@0.0.125/callbacks";
import { Serialized } from "https://esm.sh/v130/langchain@0.0.125/load/serializable";
import {
  AgentAction,
  AgentFinish,
  ChainValues,
} from "https://esm.sh/v130/langchain@0.0.125/schema";

const docs = await loadGitHub();
//console.log("docs", docs);

const model = new OpenAI({ openAIApiKey });
const embeddings = new OpenAIEmbeddings({ openAIApiKey });

// Load the docs into the vector getStore.ts
const vectorStore = await getStore(embeddings, docs);
const retriever = vectorStore.asRetriever({ verbose: false });

const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(
  "Answer the question based only on the following context:\n{context}",
);
const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(
  "Question: {question}",
);

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  systemMessagePrompt,
  humanMessagePrompt,
]);

type ConversationalRetrievalQAChainInput = {
  question: string;
  //chat_history: [string, string][];
};

const standaloneQuestionChain = RunnableSequence.from([
  {
    question: (input: ConversationalRetrievalQAChainInput) => input.question,
    //chat_history: (input: ConversationalRetrievalQAChainInput) => formatChatHistory(input.chat_history),
  },
  PromptTemplate.fromTemplate(
    /*Chat History:
{chat_history}*/
    `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.
    
Follow Up Input: {question}
Standalone question:`,
  ),
  model,
  new StringOutputParser(),
]);

const combineDocumentsFn = (docs: Document[], separator = "\n\n") => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join(separator);
};

const answerChain = RunnableSequence.from([
  {
    context: retriever.pipe(combineDocumentsFn),
    question: new RunnablePassthrough(),
  },
  chatPrompt,
  model,
]);

const conversationalRetrievalQAChain = standaloneQuestionChain.pipe(
  answerChain,
);

export class MyCallbackHandler extends BaseCallbackHandler {
  name = "MyCallbackHandler";

  handleChainStart(chain: Serialized) {
    console.log(`Entering new ${chain.id} chain...`, chain);
  }

  handleChainEnd(_output: ChainValues) {
    console.log("Finished chain.", _output);
  }

  handleAgentAction(action: AgentAction) {
    console.log(action.log);
  }

  handleToolEnd(output: string) {
    console.log(output);
  }

  handleText(text: string) {
    console.log(text);
  }

  handleAgentEnd(action: AgentFinish) {
    console.log(action.log);
  }
}

const result = await conversationalRetrievalQAChain.invoke({
  question: "Extract storage to different file",
  //chat_history: [],
}, { callbacks: [new MyCallbackHandler()] });
console.log(result);
