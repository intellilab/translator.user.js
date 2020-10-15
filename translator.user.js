// ==UserScript==
// @name translator
// @namespace https://lufei.so
// @supportURL https://github.com/intellilab/translator.user.js
// @description 划词翻译
// @version 1.6.5
// @run-at document-start
// @grant GM_addStyle
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_xmlhttpRequest
// @require https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom@1,npm/@violentmonkey/ui@0.3
// @include *
// ==/UserScript==

(function () {
'use strict';

function dumpQuery(query) {
  return Object.entries(query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
}
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
      url += sep + dumpQuery(params);
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

const TKK_KEY = 'google:tkk';
/* eslint-disable */
// Reference: https://github.com/matheuss/google-translate-token

function sM(a) {
  var b;
  if (null !== yr) b = yr;else {
    b = wr(String.fromCharCode(84));
    var c = wr(String.fromCharCode(75));
    b = [b(), b()];
    b[1] = c();
    b = (yr = window$1[b.join(c())] || "") || "";
  }
  var d = wr(String.fromCharCode(116)),
      c = wr(String.fromCharCode(107)),
      d = [d(), d()];
  d[1] = c();
  c = "&" + d.join("") + "=";
  d = b.split(".");
  b = Number(d[0]) || 0;

  for (var e = [], f = 0, g = 0; g < a.length; g++) {
    var l = a.charCodeAt(g);
    128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = l >> 18 | 240, e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224, e[f++] = l >> 6 & 63 | 128), e[f++] = l & 63 | 128);
  }

  a = b;

  for (f = 0; f < e.length; f++) a += e[f], a = xr(a, "+-a^+6");

  a = xr(a, "+-3^+b+-f");
  a ^= Number(d[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  a %= 1E6;
  return c + (a.toString() + "." + (a ^ b));
}

var yr = null;

var wr = function (a) {
  return function () {
    return a;
  };
},
    xr = function (a, b) {
  for (var c = 0; c < b.length - 2; c += 3) {
    var d = b.charAt(c + 2),
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d),
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
    a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d;
  }

  return a;
};
/* eslint-enable */


const window$1 = {
  TKK: GM_getValue(TKK_KEY) || '0'
};

async function updateTKK() {
  const now = Math.floor(Date.now() / 3600000);

  if (Number(window$1.TKK.split('.')[0]) === now) {
    return;
  }

  const text = await request({
    url: 'https://translate.google.com'
  });
  const tkk = text.match(/tkk:'([^']+)'/)[1];
  window$1.TKK = tkk;
  GM_setValue(TKK_KEY, tkk);
}

async function getTk(text) {
  await updateTKK();
  const tk = sM(text);
  return tk.slice(4);
}
const provider = {
  name: 'google',
  handle: async source => {
    const tk = await getTk(source);
    const data = await request({
      url: 'https://translate.google.cn/translate_a/single',
      params: {
        q: source,
        client: 'webapp',
        sl: 'auto',
        tl: 'zh-CN',
        dt: 'at',
        tk
      },
      responseType: 'json'
    });
    return {
      translations: data[5][0][2].map(([text]) => text)
    };
  }
};

var styles = {"source":"style-module_source___l1yG","section":"style-module_section__1Eiq1","label":"style-module_label__JD9KX","content":"style-module_content__1MvKK","phonetic":"style-module_phonetic__2SIsx"};
var stylesheet=":host a{all:initial;color:#7cbef0;cursor:pointer;font-family:inherit;font-size:inherit;line-height:inherit}:host a:hover{text-decoration:underline}:host .style-module_source___l1yG{padding:8px 0;font-size:12px;line-height:1.2;color:#999}:host .style-module_section__1Eiq1{display:flex;align-items:flex-start;font-size:12px;line-height:1.2}:host .style-module_section__1Eiq1:not(:first-child){border-top:1px solid #eee}:host .style-module_label__JD9KX{display:block;margin:8px 8px 8px 0;padding:2px 0;color:#fff;background:#bbb;border-radius:4px;font-size:12px;line-height:1.4;text-transform:uppercase;writing-mode:vertical-rl}:host .style-module_content__1MvKK{flex:1;min-width:0;padding:8px 0}:host .style-module_content__1MvKK>*{display:block}:host .style-module_content__1MvKK>:not(:first-child){margin-top:8px}:host .style-module_phonetic__2SIsx{display:inline-block;margin-left:8px}";

const React = VM;
let audio;

function play(url) {
  if (!audio) audio = /*#__PURE__*/React.createElement("audio", {
    autoPlay: true
  });
  audio.src = url;
}

function getPlayer(url) {
  return e => {
    e.preventDefault();
    play(url);
  };
}

function render(results, {
  event,
  panel,
  source
}) {
  panel.clear();
  panel.append( /*#__PURE__*/React.createElement("section", {
    className: styles.source
  }, source));

  for (const [name, result] of Object.entries(results)) {
    const {
      query,
      phonetic,
      detailUrl,
      explains,
      translations
    } = result;
    panel.append( /*#__PURE__*/React.createElement("section", {
      className: styles.section
    }, /*#__PURE__*/React.createElement("div", {
      className: styles.label
    }, name), /*#__PURE__*/React.createElement("div", {
      className: styles.content
    }, !!(query || (phonetic == null ? void 0 : phonetic.length)) && /*#__PURE__*/React.createElement("div", null, query && /*#__PURE__*/React.createElement("span", null, query), phonetic == null ? void 0 : phonetic.map(({
      html,
      url
    }) => /*#__PURE__*/React.createElement("a", {
      className: styles.phonetic,
      dangerouslySetInnerHTML: {
        __html: html
      },
      onClick: getPlayer(url)
    }))), explains && /*#__PURE__*/React.createElement("div", null, explains.map(item => /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: item
      }
    }))), detailUrl && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
      target: "_blank",
      rel: "noopener noreferrer",
      href: detailUrl
    }, "\u66F4\u591A...")), translations && /*#__PURE__*/React.createElement("div", null, translations.map(item => /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: item
      }
    }))))));
  }

  const {
    wrapper
  } = panel;
  const {
    innerWidth,
    innerHeight
  } = window;
  const {
    clientX,
    clientY
  } = event;

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

const providers = [{
  name: 'youdao',
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

    if (translation == null ? void 0 : translation[0]) {
      return {
        translations: translation
      };
    }
  }
}, {
  name: 'bing',
  handle: async source => {
    const [data] = await request({
      method: 'POST',
      url: 'https://cn.bing.com/ttranslatev3',
      responseType: 'json',
      data: dumpQuery({
        fromLang: 'auto-detect',
        to: 'zh-Hans',
        text: source
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return {
      translations: data.translations.map(({
        text
      }) => text)
    };
  }
}, provider];
let session;

function translate(context) {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (/^\s*$/.test(text)) return;
  const {
    activeElement
  } = document;
  if (['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) < 0 && !activeElement.contains(sel.getRangeAt(0).startContainer)) return;
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
  const panel = VM.getPanel({
    css: stylesheet,
    shadow: false
  });
  panel.body.style.padding = '0 8px';
  const debouncedTranslate = debounce(event => translate({
    event,
    panel
  }));
  let isSelecting;
  document.addEventListener('mousedown', e => {
    isSelecting = false;
    if (e.target === panel.host) return;
    panel.hide();
  }, true);
  document.addEventListener('mousemove', () => {
    isSelecting = true;
  }, true);
  document.addEventListener('mouseup', e => {
    if (panel.body.contains(e.target) || !isSelecting) return;
    debouncedTranslate(e);
  }, true);
  document.addEventListener('dblclick', e => {
    if (panel.body.contains(e.target)) return;
    debouncedTranslate(e);
  }, true);
}

initialize();

}());
