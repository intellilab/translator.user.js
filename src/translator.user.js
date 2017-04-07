// ==UserScript==
// @name translator
// @namespace https://lufei.so
// @supportURL https://github.com/intellilab/translator.user.js
// @description 划词翻译
// @version 1.5.5
// @run-at document-start
// @grant GM_addStyle
// @grant GM_xmlhttpRequest
// ==/UserScript==

const translator = initialize();
const entities = {
  '<': '&lt;',
  '&': '&amp;',
};
function htmlEntities(str) {
  return str && str.replace(/[<&]/g, char => entities[char]);
}
function render(data) {
  const { body, randKey, audio } = translator;
  body.innerHTML = '';
  const { basic, query, translation } = data;
  if (basic) {
    const { 'us-phonetic': us, 'uk-phonetic': uk, explains } = basic;
    const header = document.createElement('div');
    header.className = `${randKey} ${randKey}-header`;
    header.innerHTML = `\
<span>${htmlEntities(query)}</span>\
<span data-type="1">uk:[${uk}]</span>\
<span data-type="2">us:[${us}]</span>`;
    body.appendChild(header);
    header.addEventListener('click', (e) => {
      const { type } = e.target.dataset;
      if (type) {
        audio.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=${type}`;
      }
    });
    if (explains) {
      const ul = document.createElement('ul');
      ul.className = `${randKey} ${randKey}-detail`;
      for (let i = 0; i < explains.length; i += 1) {
        const li = document.createElement('li');
        li.className = randKey;
        li.innerHTML = explains[i];
        ul.appendChild(li);
      }
      body.appendChild(ul);
    }
  } else if (translation) {
    const div = document.createElement('div');
    div.className = randKey;
    div.innerHTML = translation[0];
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
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://fanyi.youdao.com/openapi.do?relatedUrl=http%3A%2F%2Ffanyi.youdao.com%2Fopenapi%3Fpath%3Dweb-mode&keyfrom=test&key=null&type=data&doctype=json&version=1.1&q=${encodeURIComponent(text)}`,
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
  const randKey = `it-${Math.random().toString(16).slice(2, 8)}`;
  const audio = document.createElement('audio');
  audio.autoplay = true;
  const panel = document.createElement('div');
  panel.className = `${randKey} ${randKey}-panel`;
  const panelBody = document.createElement('div');
  panelBody.className = `${randKey} ${randKey}-body`;
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

  GM_addStyle(`\
.${randKey} {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.${randKey}-panel {
  position: fixed;
  max-width: 300px;
  z-index: 10000;
}
.${randKey}-body {
  position: relative;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #eaeaea;
  line-height: 24px;
  color: #555;
  background-color: #fff;
  font-family: monospace, consolas;
  font-size: 14px;
  text-align: left;
  word-break: break-all;
}
.${randKey}-header {
  padding: 0 0 8px;
  border-bottom: 1px dashed #aaa;
  color: #333;
}
.${randKey}-header > [data-type] {
  margin-left: 8px;
  color: #7cbef0;
  cursor: pointer;
  font-size: 13px;
}
.${randKey}-detail {
  margin: 8px 0 0;
  line-height: 22px;
  list-style: none;
  font-size: 13px;
}
.${randKey}-detail > li {
  font-size: 13px;
  line-height: 26px;
}`);

  return {
    randKey,
    audio,
    panel,
    body: panelBody,
  };
}
