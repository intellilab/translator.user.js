import { provider as youdaoProvider } from './youdao';
import { provider as bingProvider } from './bing';
import { provider as googleProvider } from './google';
import styles, { stylesheet } from './style.module.css';

const React = VM;
let audio;

function play(url) {
  if (!audio) audio = <audio autoPlay />;
  audio.src = url;
}

function getPlayer(url) {
  return () => {
    play(url);
  };
}

function handleOpenUrl(e) {
  const { href } = e.target.dataset;
  const a = <a href={href} target="_blank" rel="noopener noreferrer" />;
  a.click();
}

function render(results, { event, panel }) {
  panel.clear();
  for (const [name, result] of Object.entries(results)) {
    const {
      query, phonetic, detailUrl, explains, translations,
    } = result;
    panel.append((
      <panel.id className={styles.section}>
        <panel.id className={styles.label}>{name}</panel.id>
        <panel.id className={styles.content}>
          {!!(query || phonetic?.length) && (
            <panel.id className={styles.block}>
              {query && <panel.id>{query}</panel.id>}
              {phonetic?.map(({ html, url }) => (
                <panel.id
                  className={`${styles.phonetic} ${styles.link}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                  onClick={getPlayer(url)}
                />
              ))}
            </panel.id>
          )}
          {explains && (
            <panel.id className={styles.block}>
              {explains.map(item => (
                <panel.id className={styles.item} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </panel.id>
          )}
          {detailUrl && (
            <panel.id className={styles.block}>
              <panel.id className={styles.link} data-href={detailUrl} onClick={handleOpenUrl}>
                更多...
              </panel.id>
            </panel.id>
          )}
          {translations && (
            <panel.id className={styles.block}>
              {translations.map(item => (
                <panel.id className={styles.item} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </panel.id>
          )}
        </panel.id>
      </panel.id>
    ));
  }
  const { wrapper } = panel;
  const { innerWidth, innerHeight } = window;
  const { clientX, clientY } = event;
  if (clientY > innerHeight * 0.5) {
    wrapper.style.top = 'auto';
    wrapper.style.bottom = `${innerHeight - clientY + 10}px`;
  } else {
    wrapper.style.top = `${clientY + 10}px`;
    wrapper.style.bottom = 'auto';
  }
  if (clientX > innerWidth * 0.5) {
    wrapper.style.left = 'auto';
    wrapper.style.right = `${innerWidth - clientX}px`;
  } else {
    wrapper.style.left = `${clientX}px`;
    wrapper.style.right = 'auto';
  }
  panel.show();
}

const providers = [
  youdaoProvider,
  bingProvider,
  googleProvider,
];

function getSelectionText() {
  const { activeElement } = document;
  let text;
  if (['input', 'textarea'].includes(activeElement.tagName.toLowerCase())) {
    text = activeElement.value.slice(activeElement.selectionStart, activeElement.selectionEnd);
  } else {
    const sel = window.getSelection();
    text = sel.toString();
  }
  return text.trim();
}

let session;
function translate(context) {
  const text = getSelectionText();
  if (/^\s*$/.test(text)) return;
  context.source = text;
  const results = {};
  session = results;
  providers.forEach(async provider => {
    const result = await provider.handle(text);
    if (!result || session !== results) return;
    results[provider.name] = result;
    render(results, context);
  });
}

function debounce(func, delay) {
  let timer;
  function exec(...args) {
    timer = null;
    func(...args);
  }
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(exec, delay, ...args);
  };
}

function initialize() {
  const panel = VM.getPanel({ css: stylesheet, shadow: false });
  const panelStyle = panel.body.style;
  panelStyle.maxHeight = '50vh';
  panelStyle.padding = '0 8px';
  panelStyle.overflow = 'auto';
  panelStyle.overscrollBehavior = 'contain';
  const debouncedTranslate = debounce(event => translate({ event, panel }));
  let isSelecting;
  document.addEventListener('mousedown', (e) => {
    isSelecting = false;
    if (panel.body.contains(e.target)) return;
    panel.hide();
    session = null;
  }, true);
  document.addEventListener('mousemove', () => {
    isSelecting = true;
  }, true);
  document.addEventListener('mouseup', (e) => {
    if (panel.body.contains(e.target) || !isSelecting) return;
    debouncedTranslate(e);
  }, true);
  document.addEventListener('dblclick', (e) => {
    if (panel.body.contains(e.target)) return;
    debouncedTranslate(e);
  }, true);
}

initialize();
