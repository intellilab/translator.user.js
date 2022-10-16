import { request } from './util';

const LANG_EN = 'en';
const LANG_ZH_HANS = 'zh-Hans';
let authPromise: Promise<{ key: string; token: string }>;

async function getAuthPromise() {
  const text = await request<string>({
    url: 'https://www.bing.com/translator',
    responseType: 'text',
  });
  const matches = text.match(
    /var params_RichTranslateHelper = \[(\d+),"([^"]+)"/
  );
  setTimeout(() => {
    authPromise = undefined;
  }, 3600 * 1000);
  return { key: matches[1], token: matches[2] };
}

function getAuth() {
  authPromise ||= getAuthPromise();
  return authPromise;
}

async function translate(text: string, to: string) {
  const { token, key } = await getAuth();
  const [data] = await request<
    Array<{
      detectedLanguage: { language: string };
      translations: Array<{ text: string }>;
    }>
  >({
    method: 'POST',
    url: 'https://www.bing.com/ttranslatev3?IG=FAE6B133589941DE936B7292060DEF83&IID=translator.5023.1',
    responseType: 'json',
    data: new URLSearchParams({
      fromLang: 'auto-detect',
      to,
      text,
      token,
      key,
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
  name: 'Bing',
  handle: async (source: string) => {
    let data = await translate(source, LANG_ZH_HANS);
    if (data.language.from === LANG_ZH_HANS)
      data = await translate(source, LANG_EN);
    return data;
  },
};
