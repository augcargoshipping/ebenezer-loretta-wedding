import { promises as fs } from "fs"
import path from "path"
import { del, get, list, put } from "@vercel/blob"
import type { RsvpStoreData, RsvpSubmission } from "./rsvpTypes"

const ENTRIES_PREFIX = "ebenezer-loretta-rsvp/entries/"
const LOCAL_DATA_PATH = path.join(process.cwd(), "data", "rsvps.json")

const emptyStore = (): RsvpStoreData => ({ submissions: [] })

function isVercelRuntime() {
  return Boolean(process.env.VERCEL)
}

function hasBlobCredentials() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

function blobStoreEnabled() {
  if (isVercelRuntime()) return hasBlobCredentials()
  return process.env.RSVP_STORAGE === "blob" && hasBlobCredentials()
}

async function runWithStoreFallback<T>(blobOperation: () => Promise<T>, localOperation: () => Promise<T>): Promise<T> {
  if (!blobStoreEnabled()) return localOperation()

  try {
    return await blobOperation()
  } catch (error) {
    console.error("RSVP blob storage failed:", error)
    if (isVercelRuntime()) throw error
    return localOperation()
  }
}

function blobAccess() {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private"
}

function sortSubmissions(submissions: RsvpSubmission[]) {
  return [...submissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function dedupeSubmissions(submissions: RsvpSubmission[]) {
  const byId = new Map<string, RsvpSubmission>()
  for (const submission of submissions) byId.set(submission.id, submission)
  return sortSubmissions([...byId.values()])
}

async function readLocalStore(): Promise<RsvpStoreData> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_PATH, "utf8")
    const parsed = JSON.parse(raw) as RsvpStoreData
    if (!Array.isArray(parsed.submissions)) return emptyStore()
    return parsed
  } catch {
    return emptyStore()
  }
}

async function writeLocalStore(data: RsvpStoreData) {
  await fs.mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true })
  await fs.writeFile(LOCAL_DATA_PATH, JSON.stringify(data, null, 2), "utf8")
}

async function readBlobJson(pathname: string): Promise<unknown | null> {
  const result = await get(pathname, { access: blobAccess(), useCache: false })
  if (!result || result.statusCode !== 200 || !result.stream) return null
  const raw = await new Response(result.stream).text()
  if (!raw.trim()) return null
  return JSON.parse(raw) as unknown
}

async function listBlobSubmissions(): Promise<RsvpSubmission[]> {
  const submissions: RsvpSubmission[] = []
  let cursor: string | undefined

  do {
    const page = await list({
      prefix: ENTRIES_PREFIX,
      limit: 1000,
      cursor,
    })

    for (const blob of page.blobs) {
      try {
        const parsed = await readBlobJson(blob.pathname)
        if (parsed && typeof parsed === "object") submissions.push(parsed as RsvpSubmission)
      } catch (error) {
        console.error(`Failed to read RSVP entry ${blob.pathname}:`, error)
      }
    }

    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  return dedupeSubmissions(submissions)
}

async function writeBlobSubmission(submission: RsvpSubmission) {
  await put(`${ENTRIES_PREFIX}${submission.id}.json`, JSON.stringify(submission), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json",
  })
}

async function clearBlobSubmissions() {
  let cursor: string | undefined

  do {
    const page = await list({
      prefix: ENTRIES_PREFIX,
      limit: 1000,
      cursor,
    })

    if (page.blobs.length > 0) {
      await del(page.blobs.map((blob) => blob.pathname))
    }

    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
}

export async function listRsvpSubmissions(): Promise<RsvpSubmission[]> {
  return runWithStoreFallback(listBlobSubmissions, async () => {
    const store = await readLocalStore()
    return sortSubmissions(store.submissions)
  })
}

export async function addRsvpSubmission(name: string, attending: boolean, message: string): Promise<RsvpSubmission> {
  const submission: RsvpSubmission = {
    id: crypto.randomUUID(),
    name,
    attending,
    message,
    createdAt: new Date().toISOString(),
  }

  return runWithStoreFallback(
    async () => {
      await writeBlobSubmission(submission)
      return submission
    },
    async () => {
      const store = await readLocalStore()
      store.submissions.push(submission)
      await writeLocalStore(store)
      return submission
    },
  )
}

export async function clearRsvpSubmissions(): Promise<void> {
  return runWithStoreFallback(clearBlobSubmissions, async () => {
    await writeLocalStore(emptyStore())
  })
}
