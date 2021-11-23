import * as dom from '@violentmonkey/dom';
import * as ui from '@violentmonkey/ui';

declare global {
  const VM: typeof dom & typeof ui;
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
