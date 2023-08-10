import {
  GithubRepoLoader,
} from "https://esm.sh/v130/langchain@0.0.125/document_loaders/web/github";
import { Document } from "https://esm.sh/v130/langchain@0.0.125/document";

const githubUrl = "https://github.com/unglud/gpt-embeddings";
const loader = new GithubRepoLoader(
  githubUrl,
  {
    ignorePaths: [".run", ".gitignore", "deno.json", "deno.lock"],
  },
);

export default async (): Promise<Document[]> =>
  await loader.load().then((docs: Document[]) =>
    docs.map((doc: Document) => {
      doc.metadata = { fileName: doc.metadata.source, source: githubUrl };
      return doc;
    })
  );
