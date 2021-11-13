import { request } from '../util';

const LANG_EN = 'en';
const LANG_ZH_CN = 'zh-CN';

async function translate(text, to) {
  const data = await request({
    url: 'https://translate.google.cn/translate_a/single',
    params: {
      q: text,
      client: 'gtx',
      sl: 'auto',
      tl: to,
      dt: 'at',
    },
    responseType: 'json',
  });
  const language = { from: data[8][0][0], to };
  const translations = data[5]
    ?.map((item) => item[2]?.[0]?.[0])
    .filter(Boolean);
  return { language, translations };
}

/**
 * @type import('../types').TranslatorProvider
 */
export const provider = {
  name: 'Google 翻译',
  handle: async (source) => {
    let data = await translate(source, LANG_ZH_CN);
    if (data.language.from === LANG_ZH_CN)
      data = await translate(source, LANG_EN);
    return data;
  },
};
