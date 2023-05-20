import { request } from './util';

/**
 * @type import('./types').TranslatorProvider
 */
export const provider = {
  name: '有道翻译',
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
      ts: `${Date.now()}`,
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
      const { explains, 'us-phonetic': us, 'uk-phonetic': uk } = basic;
      return {
        query,
        phonetic: [
          {
            html: `UK: [${uk || noPhonetic}]`,
            url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
              query
            )}&type=1`,
          },
          {
            html: `US: [${us || noPhonetic}]`,
            url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
              query
            )}&type=2`,
          },
        ],
        explains,
        detailUrl: `http://dict.youdao.com/search?q=${encodeURIComponent(
          query
        )}`,
      };
    }
    if (translation?.[0]) {
      return {
        translations: translation,
      };
    }
  },
};
