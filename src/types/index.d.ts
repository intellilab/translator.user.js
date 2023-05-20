import { DomNode } from '@gera2ld/jsx-dom';

declare global {
  namespace JSX {
    type Element = DomNode;
  }
}

interface TranslatorResponse {
  query?: string;
  phonetic?: Array<{ html: string; url: string }>;
  explains?: string[];
  detailUrl?: string;
  translations?: string[];
}

interface TranslatorProvider {
  name: string;
  handle(text: string): Promise<TranslatorResponse>;
}
