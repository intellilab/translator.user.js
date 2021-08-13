import * as _VM from './vm';

declare global {
  const VM: typeof _VM;
}

interface TranslatorResponse {
  query?: string;
  phonetic?: Array<{ html: string; url: string; }>;
  explains?: string[];
  detailUrl?: string;
  translations?: string[];
}

interface TranslatorProvider {
  name: string;
  handle(text: string): Promise<TranslatorResponse>;
}
