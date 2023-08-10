import { SupabaseVectorStore } from "https://esm.sh/v130/langchain@0.0.125/vectorstores/supabase";
import { Embeddings } from "https://esm.sh/v130/langchain@0.0.125/dist/embeddings/base.d.ts";
import { VectorStore } from "https://esm.sh/v130/langchain@0.0.125/dist/vectorstores/base.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Document } from "https://esm.sh/v130/langchain@0.0.125/document";
import { supabasePrivateKey, supabaseUrl } from "./env.ts";

const client = createClient(supabaseUrl, supabasePrivateKey, {
  auth: { persistSession: false },
});

const tableName = "documents";

// temporary clear DB
/*await client
  .from(tableName)
  .delete()
  .not("id", "in", "(1)");*/

const filterDocs = async (docs: Document[]): Promise<Document[]> => {
  // Fetch all rows from the DB where metadata.source matches the given source
  // Fetch all rows from db only if they have metadata.source === "https://github.com/unglud/gpt-embeddings"
  const { data: dbDocs, error } = await client
    .from(tableName)
    .select("id, content, metadata")
    .eq("metadata->>source", "https://github.com/unglud/gpt-embeddings");

  if (error) {
    console.error("Error fetching documents:", error);
    return docs;
  }

  // Create a copy of docs array to avoid mutation
  const processedDocs = [...docs];

  // Iterate over each document in DB
  for (const dbDoc of dbDocs) {
    // Find corresponding document in docs array
    const docIndex = processedDocs.findIndex((doc) =>
      doc.metadata.fileName === dbDoc.metadata.fileName
    );

    // If document is not found in docs array, remove it from DB
    if (docIndex === -1) {
      await client.from(tableName).delete().eq("id", dbDoc.id);
    } else {
      if (processedDocs[docIndex].pageContent === dbDoc.content) {
        // If document is found and content is the same, remove it from docs array
        processedDocs.splice(docIndex, 1);
      } else {
        // If document is found but content is different, remove it from DB
        await client.from(tableName).delete().eq("id", dbDoc.id);
      }
    }
  }

  // Return the final array with resulting documents
  return processedDocs;
};

export default async (
  embeddings: Embeddings,
  docs: Document[],
): Promise<VectorStore> => {
  const store = new SupabaseVectorStore(embeddings, {
    client,
    tableName,
    queryName: "match_documents",
  });
  const filteredDocs = await filterDocs(docs);

  console.log(`new documents to add to db`, filteredDocs);
  store.addDocuments(filteredDocs);

  return store;
};
