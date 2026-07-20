const FALLBACK_EMOJI = '📁';

const EMOJI_RULES: { emoji: string; keywords: string[] }[] = [
  { emoji: '🍳', keywords: ['kitchen', 'küche', 'kuche', 'cuisine', 'cucina', '厨房', 'キッチン', '台所'] },
  { emoji: '🛁', keywords: ['bathroom', 'bad', 'badezimmer', 'salle de bain', 'bagno', '浴室', 'バスルーム'] },
  { emoji: '🛏️', keywords: ['bedroom', 'schlafzimmer', 'chambre', 'camera da letto', '卧室', '寝室'] },
  { emoji: '🛋️', keywords: ['living room', 'wohnzimmer', 'salon', 'soggiorno', '客厅', 'リビング'] },
  {
    emoji: '🌿',
    keywords: [
      'garden', 'balcony', 'garten', 'balkon', 'jardin', 'balcon', 'giardino', 'balcone',
      '花园', '阳台', '庭', 'バルコニー',
    ],
  },
  {
    emoji: '💼',
    keywords: ['work', 'office', 'arbeit', 'büro', 'buro', 'beruf', 'travail', 'bureau', 'lavoro', 'ufficio', '工作', '办公室', '仕事', 'オフィス'],
  },
  {
    emoji: '🎓',
    keywords: ['university', 'universität', 'universitat', 'université', 'universite', 'università', 'universita', '大学'],
  },
  {
    emoji: '🔒',
    keywords: ['private', 'privat', 'privé', 'prive', 'privato', '私人', 'プライベート'],
  },
  {
    emoji: '💡',
    keywords: ['idea', 'ideen', 'idée', 'idee', '点子', '主意', 'アイデア'],
  },
  {
    emoji: '📚',
    keywords: ['book', 'bücher', 'bucher', 'livre', 'libro', 'libri', '书', '本', 'ブックリスト'],
  },
  { emoji: '🛒', keywords: ['shopping', 'groceries', 'einkaufen', 'courses', 'achats', 'spesa', '购物', '買い物'] },
  { emoji: '💰', keywords: ['finance', 'bills', 'geld', 'rechnungen', 'factures', 'bollette', '财务', '账单', '請求書'] },
  {
    emoji: '🩺',
    keywords: ['health', 'doctor', 'gesundheit', 'arzt', 'santé', 'sante', 'médecin', 'medecin', 'salute', 'medico', '健康', '医生', '医者'],
  },
  { emoji: '✈️', keywords: ['travel', 'vacation', 'reise', 'urlaub', 'voyage', 'vacances', 'viaggio', 'vacanza', '旅行'] },
  {
    emoji: '👨‍👩‍👧',
    keywords: ['family', 'kids', 'familie', 'kinder', 'famille', 'enfants', 'famiglia', 'bambini', '家庭', '孩子', '家族', '子供'],
  },
  { emoji: '🚗', keywords: ['car', 'auto', 'voiture', 'macchina', '汽车', '車'] },
  {
    emoji: '🐾',
    keywords: ['pet', 'dog', 'cat', 'haustier', 'hund', 'katze', 'chien', 'chat', 'cane', 'gatto', '宠物', 'ペット'],
  },
  { emoji: '📚', keywords: ['school', 'study', 'schule', 'studium', 'école', 'ecole', 'études', 'etudes', 'scuola', 'studio', '学校', '学习', '勉強'] },
  { emoji: '🧹', keywords: ['cleaning', 'putzen', 'reinigung', 'nettoyage', 'pulizia', '清洁', '掃除'] },
  { emoji: '🔧', keywords: ['repair', 'maintenance', 'reparatur', 'wartung', 'réparation', 'reparation', 'riparazione', '维修', '修理'] },
  { emoji: '🏋️', keywords: ['fitness', 'gym', 'sport', 'fitnessstudio', 'palestra', '健身', 'フィットネス'] },
  { emoji: '🎉', keywords: ['party', 'event', 'feier', 'fête', 'fete', 'événement', 'evenement', 'festa', 'evento', '派对', 'パーティー'] },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function suggestFolderEmoji(name: string): string {
  const normalized = normalize(name);
  for (const rule of EMOJI_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.emoji;
    }
  }
  return FALLBACK_EMOJI;
}
