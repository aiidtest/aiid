import { db } from '../db';
import { sql, cosineDistance, desc, gt, eq } from 'drizzle-orm';
import { reports, incidents, reportEmbeddings, incidentEmbeddings } from '../db/schema';
import { EmbeddingProvider } from '../types';

export interface SearchResult {
  [key: string]: unknown;
  similarity: number;
  text: string;
  metadata: {
    reportNumber?: number;
    incidentId?: number;
    title: string;
    url?: string;
    date?: Date;
    source?: string;
  };
}

export class VectorSearch {
  constructor(private embeddings: EmbeddingProvider) { }

  async searchReports(embedding: number[], limit = 5): Promise<SearchResult[]> {
    const similarity = sql<number>`1 - (${cosineDistance(reportEmbeddings.embedding, embedding)})`;

    return db
      .select({
        similarity,
        text: reportEmbeddings.chunkText,
        metadata: {
          reportNumber: reports.reportNumber,
          title: reports.title,
          url: reports.url,
          date: reports.datePublished,
          source: reports.sourceDomain
        }
      })
      .from(reportEmbeddings)
      .innerJoin(reports, eq(reports.reportNumber, reportEmbeddings.reportNumber))
      .where(gt(similarity, 0.7))
      .orderBy(desc(similarity))
      .limit(limit);
  }

  async searchIncidents(embedding: number[], limit = 5): Promise<SearchResult[]> {
    const similarity = sql<number>`1 - (${cosineDistance(incidentEmbeddings.embedding, embedding)})`;

    return db
      .select({
        similarity,
        text: incidentEmbeddings.chunkText,
        metadata: {
          incidentId: incidents.incidentId,
          title: incidents.title,
          date: incidents.date
        }
      })
      .from(incidentEmbeddings)
      .innerJoin(incidents, eq(incidents.incidentId, incidentEmbeddings.incidentId))
      .where(gt(similarity, 0.7))
      .orderBy(desc(similarity))
      .limit(limit);
  }

  async search(query: string, options: {
    limit?: number,
    searchReports?: boolean,
    searchIncidents?: boolean,
    minScore?: number
  } = {}): Promise<SearchResult[]> {
    const {
      limit = 5,
      searchReports = true,
      searchIncidents = true,
      minScore = 0.7
    } = options;

    const { embedding } = await this.embeddings.getEmbedding(query);

    const results: SearchResult[] = [];

    if (searchReports) {
      const reportResults = await this.searchReports(embedding, limit);
      results.push(...reportResults);
    }

    if (searchIncidents) {
      const incidentResults = await this.searchIncidents(embedding, limit);
      results.push(...incidentResults);
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}