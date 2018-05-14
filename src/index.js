import './meta';
import { css, classMap } from './style.css';

GM_addStyle(css);
const translator = initialize();

function createElement(tagName, props, attrs) {
  const el = document.createElement(tagName);
  if (props) {
    Object.keys(props).forEach(key => {
      el[key] = props[key];
    });
  }
  if (attrs) {
    Object.keys(attrs).forEach(key => {
      el.setAttribute(key, attrs[key]);
    });
  }
  return el;
}

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
    const header = createElement('div', { className: classMap.header });
    header.appendChild(createElement('span', { textContent: query }));
    header.appendChild(createElement('a', { innerHTML: `uk: [${uk || noPhonetic}]` }, { 'data-type': 1 }));
    header.appendChild(createElement('a', { innerHTML: `us: [${us || noPhonetic}]` }, { 'data-type': 2 }));
    header.appendChild(createElement('a', { textContent: '详情' }, { target: '_blank', href: `http://dict.youdao.com/search?q=${encodeURIComponent(query)}` }));
    body.appendChild(header);
    header.addEventListener('click', (e) => {
      const { type } = e.target.dataset;
      if (type) {
        audio.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=${type}`;
      }
    });
    if (explains) {
      const ul = createElement('ul', { className: classMap.detail });
      for (let i = 0; i < explains.length; i += 1) {
        const li = createElement('li', { innerHTML: explains[i] });
        ul.appendChild(li);
      }
      body.appendChild(ul);
    }
  } else if (translation) {
    const div = createElement('div', { innerHTML: translation[0] });
    body.appendChild(div);
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
        const { panel } = translator;
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
        document.body.appendChild(panel);
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
  const audio = createElement('audio', { autoplay: true });
  const panel = createElement('div', { className: classMap.panel });
  const panelBody = createElement('div', { className: classMap.body });
  panel.appendChild(panelBody);
  const debouncedTranslate = debounce(translate);
  let isSelecting;
  document.addEventListener('mousedown', (e) => {
    isSelecting = false;
    if (panel.contains(e.target)) return;
    if (panel.parentNode) panel.parentNode.removeChild(panel);
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
    panel,
    body: panelBody,
  };
}
