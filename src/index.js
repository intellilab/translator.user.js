import { css } from './style.css';

function render(data, panel, audio) {
  const { basic, query, translation } = data;
  panel.clear();
  if (basic) {
    const {
      explains,
      'us-phonetic': us,
      'uk-phonetic': uk,
    } = basic;
    const noPhonetic = '&hearts;';
    const handleClick = (e) => {
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
        <a target="_blank" rel="noopener noreferrer" href={`http://dict.youdao.com/search?q=${encodeURIComponent(query)}`}>详情</a>
      </div>
    );
    panel.append(header);
    if (explains) {
      const lis = [];
      for (const item of explains) {
        lis.push(<li dangerouslySetInnerHTML={{ __html: item }} />);
      }
      const ul = <ul className="detail">{lis}</ul>;
      panel.append(ul);
    }
  } else if (translation) {
    const div = <div dangerouslySetInnerHTML={{ __html: translation[0] }} />;
    panel.append(div);
  }
}

function translate(e, panel, audio) {
  const sel = window.getSelection();
  const text = sel.toString();
  if (/^\s*$/.test(text)) return;
  const { activeElement } = document;
  if (
    ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) < 0
    && !activeElement.contains(sel.getRangeAt(0).startContainer)
  ) return;

  /**
   * 采用 Bing 翻译句子
   * PS: 对比了一下有道发现各有千秋或许某个版本会使用有道翻译(不是词典)句子
    */
  if (/\s/.test(text)) {
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://cn.bing.com/ttranslatev3',
      data: `fromLang=auto-detect&to=zh-Hans&text=${text}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      onload(res) {
        if (res.status !== 200) return;
        const data = JSON.parse(res.responseText);
        // 与有道词典结果格式保持一致
        render({
          translation: [data[0].translations[0].text],
        }, panel, audio);
        const { wrapper } = panel;
        const { innerWidth, innerHeight } = window;
        if (e.clientY > innerHeight * 0.5) {
          wrapper.style.top = 'auto';
          wrapper.style.bottom = `${innerHeight - e.clientY + 10}px`;
        } else {
          wrapper.style.top = `${e.clientY + 10}px`;
          wrapper.style.bottom = 'auto';
        }
        if (e.clientX > innerWidth * 0.5) {
          wrapper.style.left = 'auto';
          wrapper.style.right = `${innerWidth - e.clientX}px`;
        } else {
          wrapper.style.left = `${e.clientX}px`;
          wrapper.style.right = 'auto';
        }
        panel.show();
      },
    });
  } else {
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
          render(data, panel, audio);
          const { wrapper } = panel;
          const { innerWidth, innerHeight } = window;
          if (e.clientY > innerHeight * 0.5) {
            wrapper.style.top = 'auto';
            wrapper.style.bottom = `${innerHeight - e.clientY + 10}px`;
          } else {
            wrapper.style.top = `${e.clientY + 10}px`;
            wrapper.style.bottom = 'auto';
          }
          if (e.clientX > innerWidth * 0.5) {
            wrapper.style.left = 'auto';
            wrapper.style.right = `${innerWidth - e.clientX}px`;
          } else {
            wrapper.style.left = `${e.clientX}px`;
            wrapper.style.right = 'auto';
          }
          panel.show();
        }
      },
    });
  }
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
  const audio = <audio autoPlay />;
  const panel = VM.getPanel({ css });
  const debouncedTranslate = debounce(e => translate(e, panel, audio));
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
