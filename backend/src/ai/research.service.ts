import { Injectable, Logger } from '@nestjs/common';
import { You } from '@youdotcom-oss/sdk';

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);
  private readonly apiKey = 'ydc-sk-28678f2ee7ed9ef4-D1Zgvnxbfz33vYLeVfzQMDC5WKS4p552-9d42cf09';
  private you: You;

  constructor() {
    this.you = new You({
      apiKeyAuth: this.apiKey,
    });
  }

  async search(query: string): Promise<{ results: any[]; rawData: any }> {
    this.logger.log(`Performing research search for: ${query}`);

    try {
      const result = await this.you.search({
        query: query,
      });

      const formattedResults: Array<{
        title: string;
        url: string;
        description: string;
        snippets: string[];
      }> = [];
      
      // Extract web results if available
      if (result.results?.web) {
        for (const webResult of result.results.web) {
          formattedResults.push({
            title: webResult.title || '',
            url: webResult.url || '',
            description: webResult.description || '',
            snippets: webResult.snippets || [],
          });
        }
      }

      this.logger.log(`Found ${formattedResults.length} research results`);

      return {
        results: formattedResults,
        rawData: result,
      };
    } catch (error) {
      this.logger.error(`Error performing research: ${error.message}`);
      throw error;
    }
  }

  async enrichWithAI(query: string, searchResults: any[]): Promise<string> {
    // Format search results for AI processing
    const resultsContext = searchResults
      .map((result, index) => {
        return `**[${index + 1}] ${result.title}**\nURL: ${result.url}\n${result.snippets.join(' ')}\n`;
      })
      .join('\n---\n\n');

    return resultsContext;
  }
}
