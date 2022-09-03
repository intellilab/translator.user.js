
// ==UserScript==
// @name        translator
// @namespace   https://lufei.so
// @supportURL  https://github.com/intellilab/translator.user.js
// @description 划词翻译
// @version     1.6.9
// @require     https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom@2,npm/@violentmonkey/ui@^0.7.6
// @include     *
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
'use strict';

function request({
  method = 'GET',
  url,
  params,
  responseType,
  data,
  headers
}) {
  return new Promise((resolve, reject) => {
    if (params) {
      const sep = url.includes('?') ? '&' : '?';
      url += sep + new URLSearchParams(params).toString();
    }

    GM_xmlhttpRequest({
      method,
      url,
      responseType,
      data,
      headers,

      onload(res) {
        if (res.status >= 300) return reject();
        resolve(res.response);
      },

      onerror: reject
    });
  });
}

/**
 * @type import('./types').TranslatorProvider
 */

const provider$2 = {
  name: '有道翻译',
  handle: async text => {
    const payload = {
      type: 'data',
      doctype: 'json',
      version: '1.1',
      relatedUrl: 'http://fanyi.youdao.com/',
      keyfrom: 'fanyiweb',
      key: null,
      translate: 'on',
      q: text,
      ts: Date.now()
    };
    const result = await request({
      url: 'https://fanyi.youdao.com/openapi.do',
      params: payload,
      responseType: 'json'
    });
    if (result.errorCode) throw result;
    const {
      basic,
      query,
      translation
    } = result;

    if (basic) {
      const noPhonetic = '&hearts;';
      const {
        explains,
        'us-phonetic': us,
        'uk-phonetic': uk
      } = basic;
      return {
        query,
        phonetic: [{
          html: `UK: [${uk || noPhonetic}]`,
          url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=1`
        }, {
          html: `US: [${us || noPhonetic}]`,
          url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(query)}&type=2`
        }],
        explains,
        detailUrl: `http://dict.youdao.com/search?q=${encodeURIComponent(query)}`
      };
    }

    if (translation != null && translation[0]) {
      return {
        translations: translation
      };
    }
  }
};

const LANG_EN$1 = 'en';
const LANG_ZH_HANS = 'zh-Hans';

async function translate$2(text, to) {
  const data = await request({
    method: 'POST',
    url: 'https://cn.bing.com/ttranslatev3',
    responseType: 'json',
    data: new URLSearchParams({
      fromLang: 'auto-detect',
      to,
      text
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const {
    detectedLanguage,
    translations
  } = data;
  return {
    language: {
      from: detectedLanguage.language,
      to
    },
    translations: translations.map(item => item.text)
  };
}

const provider$1 = {
  name: 'bing',
  handle: async source => {
    let data = await translate$2(source, LANG_ZH_HANS);
    if (data.language.from === LANG_ZH_HANS) data = await translate$2(source, LANG_EN$1);
    return data;
  }
};

const LANG_EN = 'en';
const LANG_ZH_CN = 'zh-CN';

async function translate$1(text, to) {
  var _data$;

  const data = await request({
    url: 'https://translate.google.cn/translate_a/single',
    params: {
      q: text,
      client: 'gtx',
      sl: 'auto',
      tl: to,
      dt: 'at'
    },
    responseType: 'json'
  });
  const language = {
    from: data[8][0][0],
    to
  };
  const translations = (_data$ = data[5]) == null ? void 0 : _data$.map(item => {
    var _item$, _item$$;

    return (_item$ = item[2]) == null ? void 0 : (_item$$ = _item$[0]) == null ? void 0 : _item$$[0];
  }).filter(Boolean);
  return {
    language,
    translations
  };
}

const provider = {
  name: 'Google 翻译',
  handle: async source => {
    let data = await translate$1(source, LANG_ZH_CN);
    if (data.language.from === LANG_ZH_CN) data = await translate$1(source, LANG_EN);
    return data;
  }
};

var styles = {"panelBody":"tr_panelBody_uPv5J","link":"tr_link_8q0rg","section":"tr_section_dq9Hm","block":"tr_block_YfbpH","label":"tr_label_cbK-U","content":"tr_content_E18UP","phonetic":"tr_phonetic_0jmK4","item":"tr_item_YNO6j","buttonRoot":"tr_buttonRoot_jYn-I","button":"tr_button_jq3AX","rotate":"tr_rotate_TfJeY"};
var stylesheet=".tr_panelBody_uPv5J{box-shadow:0 0 10px #222;max-height:50vh;overflow:auto;overscroll-behavior:contain;padding:0;width:360px}.tr_link_8q0rg{color:#7cbef0;cursor:pointer;position:relative}.tr_link_8q0rg:hover{text-decoration:underline}.tr_section_dq9Hm{display:block;font-size:12px;line-height:1.2}.tr_section_dq9Hm:not(:first-child){border-top:1px solid #eee}.tr_block_YfbpH{display:block}.tr_label_cbK-U{background:#bbb;border-bottom-right-radius:4px;color:#fff;display:inline-block;font-size:12px;line-height:1.4;padding:0 2px;position:sticky;top:0}.tr_content_E18UP{display:block;padding:8px}.tr_content_E18UP>*{display:block}.tr_content_E18UP>:not(:first-child){margin-top:4px}.tr_phonetic_0jmK4{display:inline-block;margin-left:8px}.tr_item_YNO6j{display:block}.tr_item_YNO6j~.tr_item_YNO6j{margin-top:4px}.tr_buttonRoot_jYn-I{position:fixed;text-align:center;z-index:10000}.tr_button_jq3AX{background:#fe8;background:url(\"data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+PHBhdGggZD0iTTMxMC40NjMgNzI0LjExaDg3LjUxMWM2LjM0NCAwIDEwLjg5OS02LjE4IDguOTQ3LTEyLjM2MkwzNjMuMzI4IDU3Ny4zOWMtMi43NjYtOC42MjEtMTUuMTI4LTguNzg0LTE3Ljg5MyAwbC00My45MTkgMTM0LjM1OGMtMi4xMTQgNi4xODEgMi40NCAxMi4zNjIgOC45NDcgMTIuMzYyeiIgZmlsbD0iIzY0QjVGNiIvPjxwYXRoIGQ9Ik01NzkuMTggMzUxLjQ1M0gxMjguNDQ0Yy00Ny4xNzIgMC04NS44ODUgMzguNzE0LTg1Ljg4NSA4NS44ODV2NTAwLjgzNGMwIDQ3LjE3MiAzOC43MTMgODUuODg2IDg1Ljg4NSA4NS44ODZoNDUwLjczNGM0Ny4xNzIgMCA4NS44ODUtMzguNzE0IDg1Ljg4NS04NS44ODZWNDM3LjMzOGMwLTQ3LjMzNC0zOC41NS04NS44ODUtODUuODg1LTg1Ljg4NXptLTU0LjE2NyA1NjIuMzJjLTQuNzE3IDUuNjkzLTExLjIyNCA5LjU5Ny0xOS4wMzEgMTEuMjI0LTIuNzY2LjY1LTUuNTMuODEzLTguMTM0LjgxMy00LjcxNyAwLTkuMTA5LS44MTMtMTMuMzM4LTIuNjAyLTEwLjczNS00LjU1NS0xNC40NzctMTIuMi0xNS43NzgtMTguMjE4bC0zNy45LTExNy40NDJjLTEuOTUyLTYuMDE4LTcuNjQ1LTEwLjI0Ny0xMy45ODktMTAuMjQ3aC0xMjguOTljLTQuNzE3IDAtOC43ODQgMi45MjctMTAuMjQ4IDcuMzJsLTM5LjM2NCAxMjAuMjA2Yy0zLjQxNiA3LjMyLTguOTQ2IDEzLjAxMy0xNi41OTEgMTYuNzU0LTcuODA4IDMuNzQxLTE1LjQ1MyA0Ljg4LTIyLjkzNiAzLjA5LTExLjA2LTIuMTE0LTE2Ljc1NC04LjYyLTE5LjM1Ni0xMy41LTIuOTI4LTUuMDQzLTUuMzY4LTEzLjk5LjgxMy0yNi42NzdsMTI5LjE1My0zOTQuOTQxYzguMjk2LTIwLjk4NCAyMy43NDktMzEuNzIgNDUuMDU3LTMxLjcyaC4zMjZjMjAuNDk1LjQ4OSAzNi4xMSAxMS4wNjIgNDUuMDU3IDMwLjU4MWwuNDg4IDEuMTM5IDEyOC42NjUgMzk5LjgyMWMzLjA5IDkuMTEgMS42MjYgMTcuNzMtMy45MDQgMjQuNHoiIGZpbGw9IiM2NEI1RjYiLz48cGF0aCBkPSJNOTE4LjE2NSA0My42OThoLTQxMy4xNmMtNTcuNTgyIDAtMTA0LjU5IDQ3LjAxLTEwNC41OSAxMDQuNTkxdjEyNy44NTJjMCAxMC40MSA4LjQ1OCAxOC43MDYgMTguNzA1IDE4LjcwNmgxMTEuOTExYzE1Ljc3OSAwIDMxLjA2OSAxLjk1MiA0NS44NyA1Ljg1NmE2NzAuNDEyIDY3MC40MTIgMCAwIDEtMTIuMTk5LTQ2LjUyMWgtNTYuMjhjLTEyLjItMS4zMDEtMTguODctMTEuMDYxLTIwLjAwOC0yOS4xMTYgMS4xMzktMTcuODkzIDcuODA4LTI3LjY1MyAyMC4wMDctMjkuMTE3aDE3NC4zNzNjLTYuMDE4LTE3Ljg5My05Ljc2LTMzLjE4My0xMC44OTgtNDUuNzA4LTIuNDQtMTUuMTI3IDMuMDktMjUuNTM3IDE2LjQyOS0zMS4wNjggMTUuNzc4LTQuMjMgMjcuMzI3IDAgMzQuNDg0IDEyLjUyNSAyLjQ0IDguMjk2IDYuMDE4IDIwLjgyIDEwLjg5OCAzNy40MTIgMy41NzkgMTIuNTI1IDYuMDE5IDIxLjQ3MSA3LjMyIDI3LjAwMmgxNDUuNDJjMTUuNzc3IDEuNDY0IDI0LjIzNiAxMS4wNiAyNS4zNzQgMjkuMTE2IDAgMTguMDU2LTcuOTcgMjcuNjUzLTIzLjU4NiAyOS4xMTdoLTM2LjI3M2MtNC44OCAwLTcuMzIuNjUtNy4zMiAyLjExNC0xNi45MTcgODUuODg1LTQ3LjgyMiAxNTYuOTY4LTkyLjcxNyAyMTMuNzM3IDM2LjI3NCAyOS4xMTYgODIuMzA3IDU0LjY1NCAxMzguMSA3Ni43NzYgMTUuNzc4IDUuNTMgMjEuMTQ2IDE3Ljg5MyAxNi40MjkgMzcuNDEyLTYuMDE5IDE1LjEyOC0xOC4yMTkgMjAuMDA4LTM2LjI3NCAxNC40NzctNTcuMjU3LTIwLjAwNy0xMDguODItNDYuNTIxLTE1NC42OS03OS4zNzlWNjk3Ljc2YzAgMTAuNDEgOC40NTggMTguNzA2IDE4LjcwNSAxOC43MDZIOTE4LjQ5YzU3LjU4MyAwIDEwNC41OTItNDcuMDA5IDEwNC41OTItMTA0LjU5MVYxNDguMjg5Yy0uMTYzLTU3LjU4Mi00Ny4zMzUtMTA0LjU5LTEwNC45MTctMTA0LjU5eiIgZmlsbD0iIzFFODhFNSIvPjxwYXRoIGQ9Ik03NzYuOTc1IDI1NC4xODJoLTE0NC4yOGMtNi4wMTkgMC0xMC40MSA1LjY5My04Ljk0NyAxMS4zODYgNi42NyAyNC44ODcgMTUuMjkgNDguOTYxIDI1Ljg2MyA3Mi4wNi40ODggMS4xMzggMS4zMDIgMi4xMTQgMi4yNzggMy4wOSAyMy4yNiAyMC4zMzIgNDEuNDc4IDQ2LjUyIDUyLjIxNCA3Ni4xMjUgMTAuNTczIDEuMzAxIDYuMDE4LjgxMyAxNi41OTEgMi4xMTUgMzEuNzItNDguNjM2IDUzLjM1My05OS44NzQgNjUuMDY1LTE1My41NTIgMS4zMDEtNS44NTYtMy4wOS0xMS4yMjQtOC43ODQtMTEuMjI0eiIgZmlsbD0iIzFFODhFNSIvPjwvc3ZnPg==\") 50% /70% no-repeat #fff;border:1px solid #888;border-radius:50%;box-sizing:initial;display:block;height:32px;line-height:32px;width:32px}.tr_button_jq3AX:hover{animation-duration:.5s;animation-iteration-count:infinite;animation-name:tr_rotate_TfJeY;animation-timing-function:linear}@keyframes tr_rotate_TfJeY{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}";

let audio;
let mouse;
let query;
let hoverTimer;
const panel = VM.getPanel({
  shadow: false,
  style: stylesheet
});
panel.setMovable(true);
const button = VM.getHostElement(false);
const buttonEl = button.root;
buttonEl.className = styles.buttonRoot;
buttonEl.append(VM.hm("div", {
  className: styles.button,
  onMouseOver: handlePrepare,
  onMouseOut: handleCancel
}));

function play(url) {
  audio || (audio = VM.hm("audio", {
    autoPlay: true
  }));
  audio.src = url;
}

function handleOpenUrl(e) {
  const {
    href
  } = e.target.dataset;
  const a = VM.hm("a", {
    href: href,
    target: "_blank",
    rel: "noopener noreferrer"
  });
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

let policy;

function safeHTML(html) {
  if (typeof window.trustedTypes === 'undefined') return html;
  policy || (policy = window.trustedTypes.createPolicy('VMTrustedHTML', {
    createHTML: p => p
  }));
  return policy.createHTML(html);
}

function render(results) {
  panel.clear();

  for (const [name, result] of Object.entries(results)) {
    const {
      query: q,
      phonetic,
      detailUrl,
      explains,
      translations
    } = result;
    panel.append(VM.hm(panel.id, {
      className: styles.section
    }, VM.hm(panel.id, {
      className: styles.label
    }, name), VM.hm(panel.id, {
      className: styles.content,
      onMouseDown: e => e.stopPropagation()
    }, !!(q || phonetic != null && phonetic.length) && VM.hm(panel.id, {
      className: styles.block
    }, q && VM.hm(panel.id, null, q), phonetic == null ? void 0 : phonetic.map(({
      html,
      url
    }) => VM.hm(panel.id, {
      className: `${styles.phonetic} ${styles.link}`,
      dangerouslySetInnerHTML: {
        __html: safeHTML(html)
      },
      onClick: () => play(url)
    }))), explains && VM.hm(panel.id, {
      className: styles.block
    }, explains.map(item => VM.hm(panel.id, {
      className: styles.item,
      dangerouslySetInnerHTML: {
        __html: safeHTML(item)
      }
    }))), detailUrl && VM.hm(panel.id, {
      className: styles.block
    }, VM.hm(panel.id, {
      className: styles.link,
      "data-href": detailUrl,
      onClick: handleOpenUrl
    }, "\u66F4\u591A...")), translations && VM.hm(panel.id, {
      className: styles.block
    }, translations.map(item => VM.hm(panel.id, {
      className: styles.item,
      dangerouslySetInnerHTML: {
        __html: safeHTML(item)
      }
    }))))));
  }

  const {
    wrapper
  } = panel;
  Object.assign(wrapper.style, getPosition());
  panel.show();
}

function getPosition() {
  const {
    innerWidth,
    innerHeight
  } = window;
  const {
    clientX,
    clientY
  } = mouse;
  const style = {
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto'
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

const providers = [provider$2, provider$1, provider];

function getSelectionText() {
  const {
    activeElement
  } = document;
  let text;

  if (['input', 'textarea'].includes(activeElement.tagName.toLowerCase())) {
    const inputEl = activeElement;
    text = inputEl.value.slice(inputEl.selectionStart, inputEl.selectionEnd);
  } else {
    const sel = window.getSelection();
    text = sel.toString();
  }

  return text.trim();
}

let session;

function translate() {
  const results = {};
  session = results;
  providers.forEach(async provider => {
    const result = await provider.handle(query);
    if (!result || session !== results) return;
    results[provider.name] = result;
    render(results);
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
  panel.body.classList.add(styles.panelBody);
  const debouncedTranslate = debounce(event => {
    mouse = {
      clientX: event.clientX,
      clientY: event.clientY
    };
    query = getSelectionText();
    if (!query || !/\w/.test(query) && query.length < 3) return;
    Object.assign(buttonEl.style, getPosition());
    button.show();
  }, 0);
  document.addEventListener('mousedown', e => {
    if (panel.body.contains(e.target)) return;
    panel.hide();
    button.hide();
    session = null;
  }, true);
  document.addEventListener('mouseup', e => {
    if (panel.body.contains(e.target)) return;
    debouncedTranslate(e);
  }, true);
}

initialize();

})();
