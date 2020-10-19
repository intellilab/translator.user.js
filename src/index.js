import { request } from './util';
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
  return e => {
    e.preventDefault();
    play(url);
  };
}

function render(results, { event, panel }) {
  panel.clear();
  for (const [name, result] of Object.entries(results)) {
    const {
      query, phonetic, detailUrl, explains, translations,
    } = result;
    panel.append((
      <section className={styles.section}>
        <div className={styles.label}>{name}</div>
        <div className={styles.content}>
          {!!(query || phonetic?.length) && (
            <div>
              {query && <span>{query}</span>}
              {phonetic?.map(({ html, url }) => (
                <a
                  className={styles.phonetic}
                  dangerouslySetInnerHTML={{ __html: html }}
                  onClick={getPlayer(url)}
                />
              ))}
            </div>
          )}
          {explains && (
            <div>
              {explains.map(item => (
                <div className={styles.item} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </div>
          )}
          {detailUrl && <div><a target="_blank" rel="noopener noreferrer" href={detailUrl}>更多...</a></div>}
          {translations && (
            <div>
              {translations.map(item => (
                <div className={styles.item} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </div>
          )}
        </div>
      </section>
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
  {
    name: 'youdao',
    handle: async (text) => {
      const payload = {
        type: 'data',
        doctype: 'json',
        version: '1.1',
        relatedUrl: 'http://fanyi.youdao.com/',
        keyfrom: 'fanyiweb',
        key: null,
        translate: 'on',
        q: text,
        ts: Date.now(),
      };
      const result = await request({
        url: 'https://fanyi.youdao.com/openapi.do',
        params: payload,
        responseType: 'json',
      });
      if (result.errorCode) throw result;
      const { basic, query, translation } = result;
      if (basic) {
        const noPhonetic = '&hearts;';
        const {
          explains,
          'us-phonetic': us,
          'uk-phonetic': uk,
        } = basic;
        return {
          query,
          phonetic: [
            {
              html: `UK: [${uk || noPhonetic}]`,
              url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=1`,
            },
            {
              html: `US: [${us || noPhonetic}]`,
              url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=2`,
            },
          ],
          explains,
          detailUrl: `http://dict.youdao.com/search?q=${encodeURIComponent(query)}`,
        };
      }
      if (translation?.[0]) {
        return {
          translations: translation,
        };
      }
    },
  },
  bingProvider,
  googleProvider,
];

let session;
function translate(context) {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (/^\s*$/.test(text)) return;
  const { activeElement } = document;
  if (
    ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) < 0
    && !activeElement.contains(sel.getRangeAt(0).startContainer)
  ) return;

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
  panel.body.style.padding = '0 8px';
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
