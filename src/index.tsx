import { provider as youdaoProvider } from './youdao';
import { provider as bingProvider } from './bing';
import { provider as googleProvider } from './google';
import styles, { stylesheet } from './style.module.css';
import { TranslatorProvider, TranslatorResponse } from './types';

let audio: HTMLAudioElement;
let mouse: { clientX: number; clientY: number };
let query: string;
let hoverTimer: NodeJS.Timeout;

const panel = VM.getPanel({ shadow: false });
panel.setMovable(true);
const button = VM.getHostElement(false);
const buttonEl = button.root as HTMLElement;
buttonEl.className = styles.buttonRoot;
buttonEl.append(
  <div
    className={styles.button}
    onMouseOver={handlePrepare}
    onMouseOut={handleCancel}
  />
);

// Insert CSS after panel
GM_addStyle(stylesheet);

function play(url: string) {
  audio ||= (<audio autoPlay />) as HTMLAudioElement;
  audio.src = url;
}

function handleOpenUrl(e: MouseEvent) {
  const { href } = (e.target as HTMLAnchorElement).dataset;
  const a = (
    <a href={href} target="_blank" rel="noopener noreferrer" />
  ) as HTMLAnchorElement;
  a.click();
}

function handleTranslate() {
  hoverTimer = null;
  button.hide();
  translate();
}

function handlePrepare() {
  if (!hoverTimer) {
    hoverTimer = setTimeout(handleTranslate, 800);
  }
}

function handleCancel() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
}

let policy: ReturnType<
  typeof window.trustedTypes.createPolicy<{ createHTML: (p: string) => string }>
>;

function safeHTML(html: string) {
  if (typeof window.trustedTypes === 'undefined') return html;
  policy ||= window.trustedTypes.createPolicy('VMTrustedHTML', {
    createHTML: (p) => p,
  });
  return policy.createHTML(html);
}

function render(results: Record<string, TranslatorResponse>) {
  panel.clear();
  for (const [name, result] of Object.entries(results)) {
    const { query: q, phonetic, detailUrl, explains, translations } = result;
    panel.append(
      <panel.id className={styles.section}>
        <panel.id className={styles.label}>{name}</panel.id>
        <panel.id
          className={styles.content}
          onMouseDown={(e: MouseEvent) => e.stopPropagation()}
        >
          {!!(q || phonetic?.length) && (
            <panel.id className={styles.block}>
              {q && <panel.id>{q}</panel.id>}
              {phonetic?.map(({ html, url }) => (
                <panel.id
                  className={`${styles.phonetic} ${styles.link}`}
                  dangerouslySetInnerHTML={{ __html: safeHTML(html) }}
                  onClick={() => play(url)}
                />
              ))}
            </panel.id>
          )}
          {explains && (
            <panel.id className={styles.block}>
              {explains.map((item) => (
                <panel.id
                  className={styles.item}
                  dangerouslySetInnerHTML={{ __html: safeHTML(item) }}
                />
              ))}
            </panel.id>
          )}
          {detailUrl && (
            <panel.id className={styles.block}>
              <panel.id
                className={styles.link}
                data-href={detailUrl}
                onClick={handleOpenUrl}
              >
                更多...
              </panel.id>
            </panel.id>
          )}
          {translations && (
            <panel.id className={styles.block}>
              {translations.map((item) => (
                <panel.id
                  className={styles.item}
                  dangerouslySetInnerHTML={{ __html: safeHTML(item) }}
                />
              ))}
            </panel.id>
          )}
        </panel.id>
      </panel.id>
    );
  }
  const { wrapper } = panel;
  Object.assign(wrapper.style, getPosition());
  panel.show();
}

function getPosition() {
  const { innerWidth, innerHeight } = window;
  const { clientX, clientY } = mouse;
  const style = {
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
  };
  if (clientY > innerHeight * 0.5) {
    style.bottom = `${innerHeight - clientY + 10}px`;
  } else {
    style.top = `${clientY + 10}px`;
  }
  if (clientX > innerWidth * 0.5) {
    style.right = `${innerWidth - clientX}px`;
  } else {
    style.left = `${clientX}px`;
  }
  return style;
}

const providers: TranslatorProvider[] = [
  youdaoProvider,
  bingProvider,
  googleProvider,
];

function getSelectionText() {
  const { activeElement } = document;
  let text: string;
  if (['input', 'textarea'].includes(activeElement.tagName.toLowerCase())) {
    const inputEl = activeElement as HTMLInputElement;
    text = inputEl.value.slice(inputEl.selectionStart, inputEl.selectionEnd);
  } else {
    const sel = window.getSelection();
    text = sel.toString();
  }
  return text.trim();
}

let session: Record<string, unknown>;
function translate() {
  const results: Record<string, TranslatorResponse> = {};
  session = results;
  providers.forEach(async (provider) => {
    const result = await provider.handle(query);
    if (!result || session !== results) return;
    results[provider.name] = result;
    render(results);
  });
}

function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timer: NodeJS.Timeout;
  function exec(...args: T) {
    timer = null;
    func(...args);
  }
  return (...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(exec, delay, ...args);
  };
}

function initialize() {
  panel.body.classList.add(styles.panelBody);
  const debouncedTranslate = debounce((event: MouseEvent) => {
    mouse = {
      clientX: event.clientX,
      clientY: event.clientY,
    };
    query = getSelectionText();
    if (!/\w/.test(query)) return;
    Object.assign(buttonEl.style, getPosition());
    button.show();
  }, 0);
  document.addEventListener(
    'mousedown',
    (e) => {
      if (panel.body.contains(e.target as HTMLElement)) return;
      panel.hide();
      button.hide();
      session = null;
    },
    true
  );
  document.addEventListener(
    'mouseup',
    (e) => {
      if (panel.body.contains(e.target as HTMLElement)) return;
      debouncedTranslate(e);
    },
    true
  );
}

initialize();
