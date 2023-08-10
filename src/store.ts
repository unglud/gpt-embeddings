import { SupabaseVectorStore } from "https://esm.sh/v130/langchain@0.0.125/vectorstores/supabase";
import { Embeddings } from "https://esm.sh/v130/langchain@0.0.125/dist/embeddings/base.d.ts";
import { VectorStore } from "https://esm.sh/v130/langchain@0.0.125/dist/vectorstores/base.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabasePrivateKey, supabaseUrl } from "./env.ts";

const client = createClient(supabaseUrl, supabasePrivateKey, {
  auth: { persistSession: false },
});

const tableName = "documents";

// temporary clear DB
await client
  .from(tableName)
  .delete()
  .not("id", "in", "(1)");

export default (embeddings: Embeddings): VectorStore =>
  new SupabaseVectorStore(embeddings, {
    client,
    tableName,
    queryName: "match_documents",
  });
