import { SupabaseVectorStore } from "https://esm.sh/v130/langchain@0.0.125/vectorstores/supabase";
import { Embeddings } from "https://esm.sh/v130/langchain@0.0.125/dist/embeddings/base.d.ts";
import { VectorStore } from "https://esm.sh/v130/langchain@0.0.125/dist/vectorstores/base.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.32.0";
import { supabasePrivateKey, supabaseUrl } from "./env.ts";

const client = createClient(supabaseUrl, supabasePrivateKey, {
  auth: { persistSession: false },
});

export default (embeddings: Embeddings): VectorStore =>
  new SupabaseVectorStore(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });
