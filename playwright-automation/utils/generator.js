const { fakerJA } = require('@faker-js/faker');
const https = require('https');

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const _romajiFirst = [
  'taro', 'hanako', 'kenji', 'yuki', 'naoki', 'ayumi', 'takeshi', 'sachiko',
  'hiroshi', 'tomoko', 'masashi', 'noriko', 'kazuya', 'miyuki', 'ryota', 'yumi',
  'shota', 'emi', 'daisuke', 'mai', 'kentaro', 'akiko', 'yuji', 'haruka',
  'satoshi', 'kaori', 'makoto', 'mika', 'shinya', 'nozomi', 'tatsuya', 'asako',
  'koji', 'chika', 'yosuke', 'reiko', 'masato', 'misato', 'nobuhiro', 'yoko',
  'kenta', 'rina', 'ryo', 'saki', 'daiki', 'nanami', 'hayato', 'aoi',
  'kohei', 'manami', 'takuya', 'yuna', 'sota', 'hana', 'atsushi', 'mayu',
];
const _romajiLast = [
  'tanaka', 'sato', 'suzuki', 'watanabe', 'yamamoto', 'nakamura', 'kobayashi',
  'kato', 'yoshida', 'yamada', 'sasaki', 'yamaguchi', 'matsumoto', 'inoue',
  'kimura', 'hayashi', 'shimizu', 'yamazaki', 'mori', 'abe', 'ikeda',
  'hashimoto', 'fujita', 'ogawa', 'okamoto', 'nishimura', 'miura', 'saito',
  'nomura', 'fujii', 'goto', 'ishikawa', 'ueda', 'maeda', 'tamura',
  'araki', 'kaneko', 'endo', 'wada', 'kawamoto',
];
const _emailDomains = ['gmail.com'];

function generateRealisticEmail() {
  const fn = pick(_romajiFirst);
  const ln = pick(_romajiLast);
  const domain = pick(_emailDomains);
  const year2 = String(Math.floor(Math.random() * 30 + 70)); // 70–99 → birth-year feel
  const num2 = String(Math.floor(Math.random() * 90 + 10));
  const num4 = String(Math.floor(Math.random() * 9000 + 1000));

  const patterns = [
    `${fn}.${ln}`,
    `${fn}_${ln}`,
    `${ln}.${fn}`,
    `${fn}${ln}`,
    `${ln}${fn}`,
    `${fn}.${ln}${num2}`,
    `${fn}${year2}`,
    `${ln}${year2}`,
    `${fn}.${ln}${year2}`,
    `${fn[0]}.${ln}`,
    `${fn[0]}${ln}`,
    `${fn}${num4}`,
    `${ln}_${fn[0]}${num2}`,
  ];
  return `${pick(patterns)}@${domain}`;
}

function generateJapaneseUser() {
  return {
    fullName: fakerJA.person.fullName(),
    email: generateRealisticEmail(),
    gender: pick(['男性', '女性', '回答しない']),
    age: pick(['〜10代', '20代', '30代', '40代', '50代', '60代以上']),
    area: pick(['ベトナム北部', 'ベトナム中部', 'ベトナム南部', '住んでいない｜出張者']),
    occupation: pick(['駐在員(管理職)', '駐在員(担当)', '現地採用(管理職)', '現地採用(担当)', '出張者', '自営業', '帯同家族', '学生']),
  };
}

// Categorised answer pools (5 entries each) — chosen by keyword matching on the question heading
const ANSWER_POOLS = {
  // 法律・ビジネス相談
  legal: [
    'ベトナムでの就労ビザ更新手続きについて最新の規制変更を踏まえたアドバイスが必要で、信頼できる日本語対応の法律事務所を急ぎ探しています。',
    'ベトナム子会社の会計監査と税務申告の期限が迫っており、日本語で対応できる公認会計士または会計事務所をご紹介いただきたいと思います。',
    '現地でのフランチャイズ展開を検討中ですが、代理店契約や知的財産保護に関してベトナム法に精通した専門家に早急に相談したいです。',
    '現地従業員の解雇手続きにおける法的リスクを最小限に抑えたく、ベトナム労働法に詳しい弁護士に対応策を相談したいと考えています。',
    '外資規制が絡む業種でのM＆Aを検討しており、当局との交渉経験がある専門家によるデューデリジェンス支援を早急に求めています。',
  ],

  // ヘルスケア・医療
  health: [
    '子どもの定期健診と予防接種を受けさせたいのですが、日本の接種スケジュールに対応できる小児科クリニックをご紹介いただけますか。',
    '糖尿病の継続治療が必要なため、血液検査の結果を日本語で丁寧に説明してくれる内科医のいる病院を紹介していただけると助かります。',
    '現地特有のアレルギー症状が出始めており、専門外来で適切な検査と治療を受けられる日本語対応のクリニックを早急に探しています。',
    'メンタルヘルスのケアのため日本語でカウンセリングを受けたく、守秘義務が徹底された信頼できる専門クリニックをご紹介ください。',
    '帰国前に日本の書式に対応した健康診断書が必要になったため、人間ドックを現地で受けられる日本語対応の医療機関を探しています。',
  ],

  // イベント・企画
  event: [
    '在越日本人のシニア層向けに現地の文化や観光を楽しめるバスツアーや文化体験イベントを定期的に開催していただけると非常に嬉しいです。',
    '業界を超えた交流ができる在越日本人ビジネスパーソン向けの異業種交流会を毎月定期開催していただければ大変ありがたいと思います。',
    '子どもたちが日本語で楽しめるスポーツ大会や文化発表会を在越日本人コミュニティが一堂に会する形で企画していただきたいと思います。',
    'ベトナムの伝統工芸や歴史文化を学べるフィールドトリップを日本語ガイド付きで定期的に実施していただければとても参考になります。',
    '帰国前の駐在員が現地経験や知恵を共有できる座談会やオフ会イベントを定期的に企画していただけると次の赴任者にも非常に役立ちます。',
  ],

  // 満足度の理由（rating reason）
  satisfaction: [
    '掲載されている企業広告の信頼性が高く、現地でのビジネスパートナー探しや業者選定の際に毎回参考にさせていただいています。',
    'ビザ・税務・医療など生活直結のテーマを扱った特集記事が充実しており、赴任初期に非常に助けられた媒体として大変感謝しています。',
    'ウェブサイトとの連動が充実しており、過去記事をアーカイブ検索して参照できる利便性がほかの媒体にはない強みだと感じています。',
    '在越日本人コミュニティのイベント情報が一覧で確認でき、週末の予定を立てる際に毎回チェックする欠かせない習慣になっています。',
    '現地の政治・経済動向をわかりやすく解説した記事の質が高く、クライアントとの商談の場でも話題として活用できるレベルです。',
  ],

  // デフォルト
  default: [
    '現地の日本語コミュニティ情報が充実しており、孤独になりがちな駐在生活の中で同じ境遇の仲間を見つける大切なきっかけになっています。',
    'ベトナム各都市ごとの生活情報が丁寧にまとめられており、転勤や出張の際の事前準備の参考資料として大変役立てています。',
    '現地で活躍する日本人へのインタビュー記事が刺激的で、自分自身のキャリアや生活設計を見直す良いきっかけになっています。',
    '飲食店や日系サービスのクーポン情報が実用的で、節約しながら質の高いサービスを活用できる点がとても気に入っています。',
    '日本国内では得られないベトナムローカル視点の分析記事が豊富で、現地理解を深める上で欠かせない情報源となっています。',
  ],
};

async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.8 },
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function pickAnswerByQuestion(questionText) {
  const q = questionText || '';
  if (q.includes('法律') || q.includes('ビジネス') || q.includes('法令') || q.includes('相談')) return pick(ANSWER_POOLS.legal);
  if (q.includes('ヘルスケア') || q.includes('医療') || q.includes('健康')) return pick(ANSWER_POOLS.health);
  if (q.includes('イベント') || q.includes('企画')) return pick(ANSWER_POOLS.event);
  if (q.includes('満足') || q.includes('理由') || q.includes('ご覧')) return pick(ANSWER_POOLS.satisfaction);
  return pick(ANSWER_POOLS.default);
}

async function generateAIAnswer(questionText) {
  if (!process.env.GEMINI_API_KEY) {
    return pickAnswerByQuestion(questionText);
  }
  try {
    const prompt = `あなたはベトナム在住の日本人駐在員です。以下の質問に対して、自然な日本語で80〜120文字の具体的な回答を書いてください。回答テキストのみを出力し、前置きや説明は不要です。\n\n質問: ${questionText}`;
    const answer = await callGeminiAPI(prompt);
    return answer || pickAnswerByQuestion(questionText);
  } catch (err) {
    console.warn('[AI] Gemini API error, using fallback:', err.message);
    return pickAnswerByQuestion(questionText);
  }
}

module.exports = { generateJapaneseUser, generateAIAnswer };
