import { safeStorageName, supabase } from "./core"
import type { AssetUploader, ClientAsset } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

const BUCKET = "project-assets"

function mapAsset(r: any): ClientAsset {
  return {
    id: r.id,
    clientId: r.client_id,
    projectId: r.project_id ?? undefined,
    name: r.name,
    storagePath: r.storage_path,
    mime: r.mime ?? undefined,
    sizeBytes: r.size_bytes ?? 0,
    uploadedBy: (r.uploaded_by ?? "client") as AssetUploader,
    createdAt: r.created_at,
  }
}

export async function fetchAssets(clientId?: string): Promise<ClientAsset[]> {
  let q = supabase.from("client_assets").select("*").order("created_at", { ascending: false })
  if (clientId) q = q.eq("client_id", clientId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapAsset)
}

export async function fetchAssetsByProject(projectId: string): Promise<ClientAsset[]> {
  const { data, error } = await supabase
    .from("client_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapAsset)
}

/**
 * Upload a client-supplied asset. Storage RLS keys on the first path segment
 * being the owner's uid, so the path MUST start with `${clientId}/`.
 */
export async function uploadAsset(
  clientId: string,
  file: File,
  opts: { projectId?: string; uploadedBy?: AssetUploader } = {},
): Promise<ClientAsset> {
  const storagePath = `${clientId}/${Date.now()}-${safeStorageName(file.name)}`
  const { error: storageErr } = await supabase.storage.from(BUCKET).upload(storagePath, file, { upsert: false })
  if (storageErr) throw storageErr
  const { data, error } = await supabase
    .from("client_assets")
    .insert({
      client_id: clientId,
      project_id: opts.projectId ?? null,
      name: file.name,
      storage_path: storagePath,
      mime: file.type || null,
      size_bytes: file.size,
      uploaded_by: opts.uploadedBy ?? "client",
    })
    .select()
    .single()
  if (error) throw error
  return mapAsset(data)
}

export async function deleteAsset(asset: ClientAsset): Promise<void> {
  await supabase.storage.from(BUCKET).remove([asset.storagePath])
  const { error } = await supabase.from("client_assets").delete().eq("id", asset.id)
  if (error) throw error
}

/** Private bucket → time-limited signed URL for download/preview. */
export async function getAssetSignedUrl(asset: ClientAsset, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(asset.storagePath, expiresIn)
  if (error) return null
  return data?.signedUrl ?? null
}
