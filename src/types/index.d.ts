import * as dom from '@violentmonkey/dom';
import * as ui from '@violentmonkey/ui';
import { VChildren, DomNode } from '@gera2ld/jsx-dom';

declare global {
  const VM: typeof dom & typeof ui;

  namespace JSX {
    type Element = DomNode;
  }
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
