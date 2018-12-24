import './meta';
import { css } from './style.css';

const h = VM.createElement;

const translator = initialize();

function render(data) {
  const { body, audio } = translator;
  body.innerHTML = '';
  const { basic, query, translation } = data;
  if (basic) {
    const {
      explains,
      'us-phonetic': us,
      'uk-phonetic': uk,
    } = basic;
    const noPhonetic = '&hearts;';
    const handleClick = e => {
      const { type } = e.target.dataset;
      if (type) {
        audio.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=${type}`;
      }
    };
    const header = (
      <div className="header" onClick={handleClick}>
        <span>{query}</span>
        <a data-type="1" dangerouslySetInnerHTML={{ __html: `uk: [${uk || noPhonetic}]` }} />
        <a data-type="2" dangerouslySetInnerHTML={{ __html: `us: [${us || noPhonetic}]` }} />
        <a target="_blank" href={`http://dict.youdao.com/search?q=${encodeURIComponent(query)}`}>详情</a>
      </div>
    );
    body.append(header);
    if (explains) {
      const lis = [];
      for (const item of explains) {
        lis.push(<li dangerouslySetInnerHTML={{ __html: item }} />);
      }
      const ul = <ul className="detail">{lis}</ul>;
      body.append(ul);
    }
  } else if (translation) {
    const div = <div dangerouslySetInnerHTML={{ __html: translation[0] }} />;
    body.append(div);
  }
}

function translate(e) {
  const sel = window.getSelection();
  const text = sel.toString();
  if (/^\s*$/.test(text)) return;
  const { activeElement } = document;
  if (
    ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) < 0
    && !activeElement.contains(sel.getRangeAt(0).startContainer)
  ) return;
  const query = {
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
  const qs = Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://fanyi.youdao.com/openapi.do?${qs}`,
    onload(res) {
      const data = JSON.parse(res.responseText);
      if (!data.errorCode) {
        render(data);
        const { root, panel } = translator;
        const { innerWidth, innerHeight } = window;
        if (e.clientY > innerHeight * 0.5) {
          panel.style.top = 'auto';
          panel.style.bottom = `${innerHeight - e.clientY + 10}px`;
        } else {
          panel.style.top = `${e.clientY + 10}px`;
          panel.style.bottom = 'auto';
        }
        if (e.clientX > innerWidth * 0.5) {
          panel.style.left = 'auto';
          panel.style.right = `${innerWidth - e.clientX}px`;
        } else {
          panel.style.left = `${e.clientX}px`;
          panel.style.right = 'auto';
        }
        document.body.append(root);
      }
    },
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
  const audio = <audio autoplay />;
  const root = <div id="translator.user.js" />;
  const shadow = root.attachShadow({ mode: 'open' });
  const panel = <div className="panel" />;
  const panelBody = <div className="body" />;
  shadow.append(<style>{css}</style>, panel);
  panel.append(panelBody);
  const debouncedTranslate = debounce(translate);
  let isSelecting;
  document.addEventListener('mousedown', (e) => {
    isSelecting = false;
    if (e.target === root) return;
    root.remove();
    panelBody.innerHTML = '';
  }, true);
  document.addEventListener('mousemove', () => {
    isSelecting = true;
  }, true);
  document.addEventListener('mouseup', (e) => {
    if (panel.contains(e.target) || !isSelecting) return;
    debouncedTranslate(e);
  }, true);
  document.addEventListener('dblclick', (e) => {
    if (panel.contains(e.target)) return;
    debouncedTranslate(e);
  }, true);

  return {
    audio,
    root,
    panel,
    body: panelBody,
  };
}
