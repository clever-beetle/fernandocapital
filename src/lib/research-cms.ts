import { db } from "@/db";
import {
  researchArticles,
  type ArticleStatus,
  type ResearchArticleRecord,
  type ResearchSourceItem,
} from "@/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { isSafeHttpUrl } from "@/lib/safe-markdown";

export const RESEARCH_CATEGORIES = [
  "01. Equity & Company Research",
  "02. Market Intelligence",
  "03. Economic Insights",
  "04. Financial Data & Tools",
  "05. Financial Knowledge",
] as const;

export const ARTICLE_STATUSES: ArticleStatus[] = [
  "draft",
  "review",
  "published",
  "archived",
];

export interface ArticleInputPayload {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[] | string;
  status?: ArticleStatus;
  featuredImage?: string | null;
  sources?: ResearchSourceItem[];
  methodology: string;
  author: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  approvedBy?: string | null;
  humanConfirmed?: boolean;
}

export interface ValidatedArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  featuredImage: string | null;
  sources: ResearchSourceItem[];
  methodology: string;
  author: string;
  seoTitle: string | null;
  seoDescription: string | null;
  approvedBy: string | null;
  humanConfirmed: boolean;
}

export interface ArticleStatusCounts {
  all: number;
  draft: number;
  review: number;
  published: number;
  archived: number;
}

/**
 * Generates a URL-safe lowercase slug from a title or custom slug string.
 */
export function normalizeSlug(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

/**
 * Strips any control characters and trims strings to a maximum length.
 */
function cleanText(val: unknown, maxLength: number): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes structured source items.
 */
export function validateSources(
  rawSources: unknown
): { ok: true; sources: ResearchSourceItem[] } | { ok: false; error: string } {
  if (rawSources === undefined || rawSources === null || rawSources === "") {
    return { ok: true, sources: [] };
  }
  if (!Array.isArray(rawSources)) {
    return { ok: false, error: "Format daftar sumber referensi tidak valid." };
  }
  if (rawSources.length > 25) {
    return { ok: false, error: "Maksimal 25 sumber referensi per artikel." };
  }

  const cleaned: ResearchSourceItem[] = [];
  for (let i = 0; i < rawSources.length; i++) {
    const item = rawSources[i] as Record<string, unknown> | null;
    if (!item || typeof item !== "object") {
      return { ok: false, error: `Sumber referensi ke-${i + 1} tidak valid.` };
    }
    const title = cleanText(item.title, 200);
    const rawPublisher = cleanText(item.publisher, 160);
    const url = cleanText(item.url, 500);
    const publishedDate = cleanText(
      item.publishedDate ?? (item as Record<string, unknown>).publishedAt,
      60
    );
    const accessedDate = cleanText(
      item.accessedDate ?? (item as Record<string, unknown>).accessedAt,
      60
    );

    // Skip completely empty rows
    if (!title && !rawPublisher && !url) continue;

    if (!title) {
      return {
        ok: false,
        error: `Sumber referensi ke-${i + 1} wajib mencantumkan judul referensi.`,
      };
    }
    if (url && !isSafeHttpUrl(url)) {
      return {
        ok: false,
        error: `URL pada sumber referensi "${title}" harus menggunakan protokol https:// atau http:// yang valid.`,
      };
    }

    let publisher = rawPublisher;
    if (!publisher) {
      if (url && url.startsWith("http")) {
        try {
          publisher = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          publisher = "Sumber Resmi";
        }
      } else {
        publisher = "Sumber Resmi";
      }
    }

    cleaned.push({
      title,
      publisher,
      url,
      publishedDate: publishedDate || "-",
      accessedDate: accessedDate || "-",
    });
  }

  return { ok: true, sources: cleaned };
}

/**
 * Validates article creation or update input on the server.
 */
export function validateArticleInput(
  raw: unknown
):
  | { ok: true; data: ValidatedArticleData }
  | { ok: false; error: string; errors: string[] } {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      error: "Payload artikel tidak valid.",
      errors: ["Payload artikel tidak valid."],
    };
  }
  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  const title = cleanText(obj.title, 240);
  if (title.length < 5) {
    errors.push("Judul artikel wajib diisi (minimal 5 karakter).");
  }

  const rawSlugSource =
    typeof obj.slug === "string" && obj.slug.trim().length > 0 ? obj.slug : title;
  const slug = normalizeSlug(rawSlugSource);
  if (!slug || slug.length < 3) {
    errors.push("Slug artikel tidak valid (minimal 3 karakter alfanumerik).");
  }

  const excerpt = cleanText(obj.excerpt, 600);
  if (excerpt.length < 15) {
    errors.push("Ringkasan (excerpt) wajib diisi (minimal 15 karakter).");
  }

  const content = cleanText(obj.content, 100000);
  if (content.length < 30) {
    errors.push("Isi artikel (content) wajib diisi (minimal 30 karakter).");
  }

  const category = cleanText(obj.category, 100);
  if (
    !category ||
    !RESEARCH_CATEGORIES.includes(category as (typeof RESEARCH_CATEGORIES)[number])
  ) {
    errors.push("Kategori / Pilar riset tidak valid atau belum dipilih.");
  }

  const methodology = cleanText(obj.methodology, 4000);
  if (methodology.length < 10) {
    errors.push("Metodologi riset wajib dicantumkan untuk menjaga kredibilitas publikasi.");
  }

  const rawAuthor = obj.author !== undefined ? cleanText(obj.author, 120) : "Fernando Capital Editorial Board";
  const author = rawAuthor;
  if (author.length < 2) {
    errors.push("Nama penulis / editor wajib diisi.");
  }

  let status: ArticleStatus = "draft";
  if (obj.status !== undefined) {
    if (
      typeof obj.status !== "string" ||
      !ARTICLE_STATUSES.includes(obj.status as ArticleStatus)
    ) {
      errors.push("Status artikel tidak valid.");
    } else {
      status = obj.status as ArticleStatus;
    }
  }

  let tags: string[] = [];
  if (Array.isArray(obj.tags)) {
    tags = obj.tags
      .map((t) => cleanText(t, 40))
      .filter(Boolean)
      .slice(0, 12);
  } else if (typeof obj.tags === "string") {
    tags = obj.tags
      .split(",")
      .map((t) => cleanText(t, 40))
      .filter(Boolean)
      .slice(0, 12);
  }

  let featuredImage: string | null = null;
  if (typeof obj.featuredImage === "string" && obj.featuredImage.trim()) {
    const candidateImg = cleanText(obj.featuredImage, 500);
    if (!isSafeHttpUrl(candidateImg)) {
      errors.push(
        "Featured image harus berupa path lokal (/...) atau URL https:// yang valid."
      );
    } else {
      featuredImage = candidateImg;
    }
  }

  const sourcesResult = validateSources(obj.sources);
  if (!sourcesResult.ok) {
    errors.push(sourcesResult.error);
  }

  const seoTitle = obj.seoTitle ? cleanText(obj.seoTitle, 240) : null;
  const seoDescription = obj.seoDescription ? cleanText(obj.seoDescription, 320) : null;
  const approvedBy = obj.approvedBy ? cleanText(obj.approvedBy, 120) : null;
  const humanConfirmed = obj.humanConfirmed === true;

  if (status === "published" && !humanConfirmed) {
    errors.push(
      "Publikasi artikel wajib disertai konfirmasi eksplisit Editor (30% Human Oversight)."
    );
  }

  if (errors.length > 0) {
    return {
      ok: false,
      error: errors[0],
      errors,
    };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      status,
      featuredImage,
      sources: sourcesResult.ok ? sourcesResult.sources : [],
      methodology,
      author,
      seoTitle,
      seoDescription,
      approvedBy,
      humanConfirmed,
    },
  };
}

/**
 * Enforces editorial workflow status transition rules and prevents duplicate publication.
 */
export function validateStatusTransition(
  currentStatus: ArticleStatus,
  nextStatus: ArticleStatus,
  options?: { humanConfirmed?: boolean; isExplicitPublishAction?: boolean }
): { ok: true } | { ok: false; error: string } {
  if (
    currentStatus === "published" &&
    nextStatus === "published" &&
    options?.isExplicitPublishAction
  ) {
    return {
      ok: false,
      error: "Artikel ini sudah berstatus Published (Terbit). Publikasi ganda dicegah.",
    };
  }

  if (nextStatus === "published" && !options?.humanConfirmed) {
    return {
      ok: false,
      error:
        "Persetujuan eksplisit Editor (Human Oversight) wajib diberikan sebelum menerbitkan artikel.",
    };
  }

  if (currentStatus === "archived" && nextStatus === "published") {
    return {
      ok: false,
      error:
        "Artikel yang diarsipkan harus dikembalikan ke status Draft atau Review terlebih dahulu sebelum diterbitkan ulang.",
    };
  }

  return { ok: true };
}

// ============================================================================
// In-Memory Test Store Support (ONLY used when CMS_TEST_IN_MEMORY === "1"
// so automated tests never mutate a production or unidentified database)
// Stored on globalThis so Next.js route bundles share the same store in-process.
// ============================================================================
interface GlobalCmsTestStore {
  articles: ResearchArticleRecord[];
  nextId: number;
}

const globalForCmsTest = globalThis as unknown as {
  __fcCmsTestStore?: GlobalCmsTestStore;
};

function getInMemoryStore(): GlobalCmsTestStore {
  if (!globalForCmsTest.__fcCmsTestStore) {
    globalForCmsTest.__fcCmsTestStore = {
      articles: [],
      nextId: 1,
    };
  }
  return globalForCmsTest.__fcCmsTestStore;
}

function isTestInMemoryMode(): boolean {
  return process.env.CMS_TEST_IN_MEMORY === "1";
}

export function resetInMemoryArticlesForTest(): void {
  const store = getInMemoryStore();
  store.articles.length = 0;
  store.nextId = 1;
}

function isMissingTableError(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message || err || "").toLowerCase();
  const code = String((err as { code?: string })?.code || "");
  return (
    code === "42P01" ||
    (msg.includes("research_articles") &&
      (msg.includes("does not exist") || msg.includes("relation") || msg.includes("dummy.com")))
  );
}

// ============================================================================
// Repository Operations (PostgreSQL via Drizzle + Safe Unmigrated Fallback)
// ============================================================================

export async function getArticleStatsForAdmin(): Promise<{
  counts: ArticleStatusCounts;
  migrationPending: boolean;
}> {
  if (isTestInMemoryMode()) {
    const store = getInMemoryStore();
    const counts: ArticleStatusCounts = {
      all: store.articles.length,
      draft: store.articles.filter((a) => a.status === "draft").length,
      review: store.articles.filter((a) => a.status === "review").length,
      published: store.articles.filter((a) => a.status === "published").length,
      archived: store.articles.filter((a) => a.status === "archived").length,
    };
    return { counts, migrationPending: false };
  }

  try {
    const rows = await db
      .select({
        status: researchArticles.status,
        count: sql<number>`count(*)::int`,
      })
      .from(researchArticles)
      .groupBy(researchArticles.status);

    const counts: ArticleStatusCounts = {
      all: 0,
      draft: 0,
      review: 0,
      published: 0,
      archived: 0,
    };

    for (const r of rows) {
      const c = Number(r.count) || 0;
      counts.all += c;
      if (r.status in counts) {
        counts[r.status as ArticleStatus] = c;
      }
    }
    return { counts, migrationPending: false };
  } catch (err) {
    if (isMissingTableError(err)) {
      return {
        counts: { all: 0, draft: 0, review: 0, published: 0, archived: 0 },
        migrationPending: true,
      };
    }
    return {
      counts: { all: 0, draft: 0, review: 0, published: 0, archived: 0 },
      migrationPending: true,
    };
  }
}

export async function listArticlesForAdmin(params?: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  articles: ResearchArticleRecord[];
  items: ResearchArticleRecord[];
  total: number;
  page: number;
  pageSize: number;
  counts: ArticleStatusCounts;
  stats: ArticleStatusCounts;
  migrationPending: boolean;
}> {
  const page = Math.max(1, Number(params?.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(params?.pageSize) || 10));
  const search = (params?.search || "").trim().toLowerCase();
  const statusFilter = (params?.status || "").trim();
  const categoryFilter = (params?.category || "").trim();

  if (isTestInMemoryMode()) {
    const store = getInMemoryStore();
    const { counts } = await getArticleStatsForAdmin();
    const filtered = store.articles
      .filter((a) => {
        if (statusFilter && statusFilter !== "all" && a.status !== statusFilter) return false;
        if (categoryFilter && categoryFilter !== "all" && a.category !== categoryFilter)
          return false;
        if (search) {
          const hay = `${a.title} ${a.slug} ${a.excerpt} ${a.author}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const start = (page - 1) * pageSize;
    const sliced = filtered.slice(start, start + pageSize);
    return {
      articles: sliced,
      items: sliced,
      total: filtered.length,
      page,
      pageSize,
      counts,
      stats: counts,
      migrationPending: false,
    };
  }

  try {
    const { counts, migrationPending } = await getArticleStatsForAdmin();
    if (migrationPending) {
      return {
        articles: [],
        items: [],
        total: 0,
        page,
        pageSize,
        counts,
        stats: counts,
        migrationPending: true,
      };
    }

    const conditions = [];
    if (statusFilter && statusFilter !== "all" && ARTICLE_STATUSES.includes(statusFilter as ArticleStatus)) {
      conditions.push(eq(researchArticles.status, statusFilter as ArticleStatus));
    }
    if (categoryFilter && categoryFilter !== "all") {
      conditions.push(eq(researchArticles.category, categoryFilter));
    }
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(researchArticles.title, pattern),
          ilike(researchArticles.slug, pattern),
          ilike(researchArticles.excerpt, pattern),
          ilike(researchArticles.author, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(researchArticles)
      .where(whereClause);
    const total = Number(countRows[0]?.count) || 0;

    const articles = await db
      .select()
      .from(researchArticles)
      .where(whereClause)
      .orderBy(desc(researchArticles.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      articles,
      items: articles,
      total,
      page,
      pageSize,
      counts,
      stats: counts,
      migrationPending: false,
    };
  } catch (err) {
    if (isMissingTableError(err)) {
      const emptyCounts = { all: 0, draft: 0, review: 0, published: 0, archived: 0 };
      return {
        articles: [],
        items: [],
        total: 0,
        page,
        pageSize,
        counts: emptyCounts,
        stats: emptyCounts,
        migrationPending: true,
      };
    }
    throw err;
  }
}

export async function createArticle(
  rawInput: unknown
): Promise<
  | { ok: true; article: ResearchArticleRecord }
  | { ok: false; status: number; error: string; errors?: string[] }
> {
  const validated = validateArticleInput(rawInput);
  if (!validated.ok) {
    return {
      ok: false,
      status: 400,
      error: validated.error,
      errors: validated.errors,
    };
  }
  const data = validated.data;
  const now = new Date();
  const isPublishing = data.status === "published";

  if (isTestInMemoryMode()) {
    const store = getInMemoryStore();
    const duplicate = store.articles.find((a) => a.slug === data.slug);
    if (duplicate) {
      return {
        ok: false,
        status: 409,
        error: `Slug "${data.slug}" sudah digunakan oleh artikel lain. Gunakan judul atau slug yang unik.`,
      };
    }

    const record: ResearchArticleRecord = {
      id: store.nextId++,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags,
      status: data.status,
      featuredImage: data.featuredImage,
      sources: data.sources,
      methodology: data.methodology,
      author: data.author,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      createdAt: now,
      updatedAt: now,
      approvedAt: isPublishing ? now : null,
      approvedBy: isPublishing ? data.approvedBy || data.author : null,
      publishedAt: isPublishing ? now : null,
    };
    store.articles.push(record);
    return { ok: true, article: record };
  }

  try {
    const existing = await db
      .select({ id: researchArticles.id })
      .from(researchArticles)
      .where(eq(researchArticles.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      return {
        ok: false,
        status: 409,
        error: `Slug "${data.slug}" sudah digunakan oleh artikel lain. Gunakan judul atau slug yang unik.`,
      };
    }

    const inserted = await db
      .insert(researchArticles)
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags: data.tags,
        status: data.status,
        featuredImage: data.featuredImage,
        sources: data.sources,
        methodology: data.methodology,
        author: data.author,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        createdAt: now,
        updatedAt: now,
        approvedAt: isPublishing ? now : null,
        approvedBy: isPublishing ? data.approvedBy || data.author : null,
        publishedAt: isPublishing ? now : null,
      })
      .returning();

    return { ok: true, article: inserted[0] };
  } catch (err) {
    const code = String((err as { code?: string })?.code || "");
    if (code === "23505") {
      return {
        ok: false,
        status: 409,
        error: `Slug "${data.slug}" sudah digunakan oleh artikel lain.`,
      };
    }
    if (isMissingTableError(err)) {
      return {
        ok: false,
        status: 503,
        error:
          "Tabel research_articles belum dimigrasikan pada database. Jalankan migrasi SQL pada branch database terlebih dahulu.",
      };
    }
    console.error("[ResearchCMS] Create article failed");
    return { ok: false, status: 500, error: "Gagal menyimpan artikel ke database." };
  }
}

export async function updateArticle(
  id: number,
  rawInput: unknown,
  options?: { isExplicitPublishAction?: boolean }
): Promise<
  | { ok: true; article: ResearchArticleRecord }
  | { ok: false; status: number; error: string; errors?: string[] }
> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, status: 400, error: "ID artikel tidak valid." };
  }

  let currentArticle: ResearchArticleRecord | undefined;
  if (isTestInMemoryMode()) {
    currentArticle = getInMemoryStore().articles.find((a) => a.id === id);
  } else {
    try {
      const rows = await db
        .select()
        .from(researchArticles)
        .where(eq(researchArticles.id, id))
        .limit(1);
      currentArticle = rows[0];
    } catch (err) {
      if (isMissingTableError(err)) {
        return {
          ok: false,
          status: 503,
          error: "Tabel research_articles belum dimigrasikan pada database.",
        };
      }
      return { ok: false, status: 500, error: "Gagal membaca data artikel." };
    }
  }

  if (!currentArticle) {
    return { ok: false, status: 404, error: "Artikel tidak ditemukan." };
  }

  const inputObj = (rawInput && typeof rawInput === "object" ? rawInput : {}) as Record<
    string,
    unknown
  >;

  const isStatusOnlyPublishRequest =
    inputObj.status === "published" &&
    inputObj.title === undefined &&
    inputObj.content === undefined &&
    inputObj.excerpt === undefined;

  const isExplicitPublish =
    Boolean(options?.isExplicitPublishAction) || isStatusOnlyPublishRequest;

  const mergedPayload = {
    title: inputObj.title ?? currentArticle.title,
    slug: inputObj.slug ?? currentArticle.slug,
    excerpt: inputObj.excerpt ?? currentArticle.excerpt,
    content: inputObj.content ?? currentArticle.content,
    category: inputObj.category ?? currentArticle.category,
    tags: inputObj.tags ?? currentArticle.tags,
    status: inputObj.status ?? currentArticle.status,
    featuredImage:
      inputObj.featuredImage !== undefined
        ? inputObj.featuredImage
        : currentArticle.featuredImage,
    sources: inputObj.sources ?? currentArticle.sources,
    methodology: inputObj.methodology ?? currentArticle.methodology,
    author: inputObj.author ?? currentArticle.author,
    seoTitle:
      inputObj.seoTitle !== undefined ? inputObj.seoTitle : currentArticle.seoTitle,
    seoDescription:
      inputObj.seoDescription !== undefined
        ? inputObj.seoDescription
        : currentArticle.seoDescription,
    approvedBy:
      inputObj.approvedBy !== undefined ? inputObj.approvedBy : currentArticle.approvedBy,
    humanConfirmed:
      inputObj.humanConfirmed === true ||
      (currentArticle.status === "published" &&
        inputObj.status === "published" &&
        !isExplicitPublish),
  };

  const validated = validateArticleInput(mergedPayload);
  if (!validated.ok) {
    return {
      ok: false,
      status: 400,
      error: validated.error,
      errors: validated.errors,
    };
  }
  const data = validated.data;

  const transitionCheck = validateStatusTransition(currentArticle.status, data.status, {
    humanConfirmed: data.humanConfirmed,
    isExplicitPublishAction: isExplicitPublish,
  });
  if (!transitionCheck.ok) {
    return { ok: false, status: 400, error: transitionCheck.error };
  }

  const now = new Date();
  const transitioningToPublished =
    currentArticle.status !== "published" && data.status === "published";

  const approvedAt = transitioningToPublished
    ? now
    : data.status === "published"
      ? currentArticle.approvedAt || now
      : currentArticle.approvedAt;
  const approvedBy = transitioningToPublished
    ? data.approvedBy || data.author
    : data.status === "published"
      ? currentArticle.approvedBy || data.author
      : currentArticle.approvedBy;
  const publishedAt = transitioningToPublished
    ? now
    : data.status === "published"
      ? currentArticle.publishedAt || now
      : currentArticle.publishedAt;

  if (isTestInMemoryMode()) {
    const store = getInMemoryStore();
    const slugConflict = store.articles.find(
      (a) => a.slug === data.slug && a.id !== id
    );
    if (slugConflict) {
      return {
        ok: false,
        status: 409,
        error: `Slug "${data.slug}" sudah digunakan oleh artikel lain.`,
      };
    }

    const updated: ResearchArticleRecord = {
      ...currentArticle,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags,
      status: data.status,
      featuredImage: data.featuredImage,
      sources: data.sources,
      methodology: data.methodology,
      author: data.author,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      updatedAt: now,
      approvedAt,
      approvedBy,
      publishedAt,
    };

    const idx = store.articles.findIndex((a) => a.id === id);
    store.articles[idx] = updated;
    return { ok: true, article: updated };
  }

  try {
    const slugConflict = await db
      .select({ id: researchArticles.id })
      .from(researchArticles)
      .where(and(eq(researchArticles.slug, data.slug), sql`${researchArticles.id} <> ${id}`))
      .limit(1);

    if (slugConflict.length > 0) {
      return {
        ok: false,
        status: 409,
        error: `Slug "${data.slug}" sudah digunakan oleh artikel lain.`,
      };
    }

    const rows = await db
      .update(researchArticles)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags: data.tags,
        status: data.status,
        featuredImage: data.featuredImage,
        sources: data.sources,
        methodology: data.methodology,
        author: data.author,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        updatedAt: now,
        approvedAt,
        approvedBy,
        publishedAt,
      })
      .where(eq(researchArticles.id, id))
      .returning();

    return { ok: true, article: rows[0] };
  } catch (err) {
    const code = String((err as { code?: string })?.code || "");
    if (code === "23505") {
      return {
        ok: false,
        status: 409,
        error: `Slug "${data.slug}" sudah digunakan oleh artikel lain.`,
      };
    }
    console.error("[ResearchCMS] Update article failed");
    return { ok: false, status: 500, error: "Gagal memperbarui artikel di database." };
  }
}

export async function deleteArticle(
  id: number
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, status: 400, error: "ID artikel tidak valid." };
  }

  if (isTestInMemoryMode()) {
    const store = getInMemoryStore();
    const idx = store.articles.findIndex((a) => a.id === id);
    if (idx === -1) {
      return { ok: false, status: 404, error: "Artikel tidak ditemukan." };
    }
    store.articles.splice(idx, 1);
    return { ok: true };
  }

  try {
    const deleted = await db
      .delete(researchArticles)
      .where(eq(researchArticles.id, id))
      .returning({ id: researchArticles.id });

    if (deleted.length === 0) {
      return { ok: false, status: 404, error: "Artikel tidak ditemukan." };
    }
    return { ok: true };
  } catch (err) {
    if (isMissingTableError(err)) {
      return {
        ok: false,
        status: 503,
        error: "Tabel research_articles belum dimigrasikan pada database.",
      };
    }
    console.error("[ResearchCMS] Delete article failed");
    return { ok: false, status: 500, error: "Gagal menghapus artikel." };
  }
}

/**
 * PUBLIC QUERY: Returns ONLY published articles (status === 'published'),
 * ordered by publishedAt descending. Never exposes draft, review, or archived articles.
 */
export async function getPublishedArticles(limit = 12): Promise<ResearchArticleRecord[]> {
  if (isTestInMemoryMode()) {
    return getInMemoryStore()
      .articles.filter((a) => a.status === "published")
      .sort(
        (a, b) =>
          (b.publishedAt?.getTime() || b.updatedAt.getTime()) -
          (a.publishedAt?.getTime() || a.updatedAt.getTime())
      )
      .slice(0, limit);
  }

  try {
    const rows = await db
      .select()
      .from(researchArticles)
      .where(eq(researchArticles.status, "published"))
      .orderBy(desc(researchArticles.publishedAt), desc(researchArticles.createdAt))
      .limit(limit);
    return rows;
  } catch {
    return [];
  }
}

/**
 * PUBLIC QUERY: Returns a single article by slug ONLY if status === 'published'.
 * Returns null for draft, review, archived, or non-existent slugs (triggering a 404 publicly).
 */
export async function getPublishedArticleBySlug(
  slug: string
): Promise<ResearchArticleRecord | null> {
  const cleanedSlug = normalizeSlug(slug);
  if (!cleanedSlug) return null;

  if (isTestInMemoryMode()) {
    const found = getInMemoryStore().articles.find(
      (a) => a.slug === cleanedSlug && a.status === "published"
    );
    return found || null;
  }

  try {
    const rows = await db
      .select()
      .from(researchArticles)
      .where(
        and(
          eq(researchArticles.slug, cleanedSlug),
          eq(researchArticles.status, "published")
        )
      )
      .limit(1);
    return rows[0] || null;
  } catch {
    return null;
  }
}
