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
      source, phonetic, detailUrl, explains, translation,
    } = result;
    panel.append((
      <section className={styles.section}>
        <div className={styles.label}>{name}</div>
        <div className={styles.content}>
          <div className={styles.header}>
            <span>{source}</span>
            {phonetic?.map(({ html, url }) => (
              <a
                className={styles.phonetic}
                dangerouslySetInnerHTML={{ __html: html }}
                onClick={getPlayer(url)}
              />
            ))}
          </div>
          {explains && (
            <div>
              {explains.map(item => <div dangerouslySetInnerHTML={{ __html: item }} />)}
            </div>
          )}
          {detailUrl && <div><a target="_blank" rel="noopener noreferrer" href={detailUrl}>更多...</a></div>}
          {translation && (
            <div dangerouslySetInnerHTML={{ __html: translation.text }} />
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

function dumpQuery(query) {
  return Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
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
      const { basic, query } = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: `https://fanyi.youdao.com/openapi.do?${dumpQuery(payload)}`,
          responseType: 'json',
          onload(res) {
            const data = res.response;
            if (!data.errorCode) resolve(data);
            else reject();
          },
          onerror: reject,
        });
      });
      const {
        explains,
        'us-phonetic': us,
        'uk-phonetic': uk,
      } = basic;
      const noPhonetic = '&hearts;';
      return {
        source: query,
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
        detailUrl: `http://dict.youdao.com/search?q=${encodeURIComponent(query)}`,
        explains,
      };
    },
  },
  {
    name: 'bing',
    handle: async (source) => {
      const [data] = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: 'https://cn.bing.com/ttranslatev3',
          responseType: 'json',
          data: dumpQuery({
            fromLang: 'auto-detect',
            to: 'zh-Hans',
            text: source,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          onload(res) {
            if (res.status !== 200) return reject();
            resolve(res.response);
          },
          onerror: reject,
        });
      });
      const { text, to } = data.translations[0];
      return {
        source,
        translation: { text, to },
      };
    },
  },
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

  const results = {};
  session = results;
  providers.forEach(async provider => {
    results[provider.name] = await provider.handle(text);
    if (session === results) render(results, context);
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
    if (e.target === panel.host) return;
    panel.hide();
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
