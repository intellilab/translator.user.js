import { request } from './util';

const LANG_EN = 'en';
const LANG_ZH_HANS = 'zh-Hans';

async function translate(text: string, to: string) {
  const data = await request<{
    detectedLanguage: { language: string };
    translations: Array<{ text: string }>;
  }>({
    method: 'POST',
    url: 'https://cn.bing.com/ttranslatev3',
    responseType: 'json',
    data: new URLSearchParams({
      fromLang: 'auto-detect',
      to,
      text,
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const { detectedLanguage, translations } = data;
  return {
    language: { from: detectedLanguage.language, to },
    translations: translations.map((item) => item.text),
  };
}

export const provider = {
  name: 'bing',
  handle: async (source: string) => {
    let data = await translate(source, LANG_ZH_HANS);
    if (data.language.from === LANG_ZH_HANS)
      data = await translate(source, LANG_EN);
    return data;
  },
};
