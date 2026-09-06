import {dhammaTexts, getTextById} from './texts';

export const dhammaBooks = [
  {
    id: 'homage',
    title: 'ရှိခိုးဦးချခြင်း',
    paliTitle: 'Vandana',
    subtitle: 'ရတနာသုံးပါးအား ရှိခိုးခြင်း',
    chapterIds: ['homage'],
  },
  {
    id: 'vandana-sila',
    title: 'ဘုရားရှိခိုး + သီလတောင်း',
    paliTitle: 'Buddha Vandana',
    subtitle: 'ရှိခိုးခြင်းနှင့် သီလခံယူခြင်း',
    chapterIds: ['buddha-vandana', 'sila-request', 'five-precepts', 'eight-precepts'],
  },
  {
    id: 'benefactors',
    title: 'ခင်ပွန်းကြီး (၁၀) ပါး ကန်တော့ခြင်း',
    paliTitle: 'Dasa Ñāti',
    subtitle: 'ကျေးဇူးရှင်တို့အား ကန်တော့ခြင်း',
    chapterIds: ['ten-benefactors'],
  },
  {
    id: 'paritta',
    title: 'ပရိတ်ကြီး (၁၁) သုတ်',
    paliTitle: 'Paritta',
    subtitle: 'ဘေးငြိမ်းစေသော ပရိတ်သုတ်များ',
    chapterIds: [
      'mangala',
      'ratana',
      'metta',
      'khandha-paritta',
      'mora',
      'vatta',
      'dhajagga',
      'atanatiya',
      'angulimala',
      'bojjhanga-paritta',
      'pubbanha',
    ],
  },
  {
    id: 'pathana',
    title: 'ပဋ္ဌာန်း',
    paliTitle: 'Paṭṭhāna',
    subtitle: 'အကြောင်းတရား နှစ်ဆယ့်လေးပါး',
    chapterIds: ['pathana'],
  },
  {
    id: 'mahasamaya',
    title: 'မဟာသမယသုတ်တော်',
    paliTitle: 'Mahāsamaya Sutta',
    subtitle: 'နတ်ဗြဟ္မာတို့ စုဝေးသောသုတ်',
    chapterIds: ['mahasamaya'],
  },
  {
    id: 'guna-kun',
    title: 'ဂုဏ်တော်ကွန်ချာ',
    paliTitle: 'Guṇa Mālā',
    subtitle: 'ဘုရားဂုဏ်တော် ဆက်စပ်ရွတ်ဖတ်ခြင်း',
    chapterIds: ['guna-kun'],
  },
  {
    id: 'guna',
    title: 'ဂုဏ်တော်များ',
    paliTitle: 'Guṇa',
    subtitle: 'ရတနာသုံးပါး၏ ဂုဏ်တော်များ',
    chapterIds: ['buddha-guna', 'dhamma-guna', 'sangha-guna'],
  },
  {
    id: 'three-jewels',
    title: 'ရတနာသုံးပါး',
    paliTitle: 'Tiratana',
    subtitle: 'ဘုရား၊ တရား၊ သံဃာ',
    chapterIds: ['three-jewels'],
  },
  {
    id: 'dhammacakka-book',
    title: 'ဓမ္မစက္ကပဝတ္တနသုတ်',
    paliTitle: 'Dhammacakkappavattana Sutta',
    subtitle: 'တရားစက် လည်စေသောသုတ်',
    chapterIds: ['dhammacakka'],
  },
  {
    id: 'four-truths-book',
    title: 'အရိယသစ္စာ လေးပါး',
    paliTitle: 'Cattāri Ariyasaccāni',
    subtitle: 'မြတ်သောအမှန်တရား',
    chapterIds: ['four-truths'],
  },
  {
    id: 'eightfold-book',
    title: 'အရိယမဂ္ဂင် ရှစ်ပါး',
    paliTitle: 'Ariyo Aṭṭhaṅgiko Maggo',
    subtitle: 'နိဗ္ဗာန်သို့ ရောက်သောလမ်း',
    chapterIds: ['eightfold-path'],
  },
  {
    id: 'tilakkhana-book',
    title: 'တိလက္ခဏ',
    paliTitle: 'Anicca · Dukkha · Anatta',
    subtitle: 'အနိစ္စ၊ ဒုက္ခ၊ အနတ္တ',
    chapterIds: ['tilakkhana'],
  },
  {
    id: 'satipatthana-book',
    title: 'သတိပဋ္ဌာန် လေးပါး',
    paliTitle: 'Satipaṭṭhāna',
    subtitle: 'သတိတည်ရာ လေးဌာန',
    chapterIds: ['satipatthana'],
  },
  {
    id: 'anapanasati-book',
    title: 'အာနာပါနဿတိ',
    paliTitle: 'Ānāpānasati',
    subtitle: 'ထွက်သက်ဝင်သက် သတိ',
    chapterIds: ['anapanasati'],
  },
  {
    id: 'bojjhanga-book',
    title: 'ဗောဇ္ဈင် ခုနစ်ပါး',
    paliTitle: 'Satta Bojjhaṅgā',
    subtitle: 'သစ္စာသိမြင်စေသော အင်္ဂါများ',
    chapterIds: ['bojjhanga'],
  },
  {
    id: 'brahmavihara-book',
    title: 'ဗြဟ္မဝိဟာရ လေးပါး',
    paliTitle: 'Brahmavihāra',
    subtitle: 'မေတ္တာ၊ ကရုဏာ၊ မုဒိတာ၊ ဥပေက္ခာ',
    chapterIds: ['brahmavihara'],
  },
  {
    id: 'aggregates-book',
    title: 'ခန္ဓာငါးပါး',
    paliTitle: 'Pañcakkhandha',
    subtitle: 'ငါဟု စွဲသော အစုငါးပါး',
    chapterIds: ['five-aggregates'],
  },
  {
    id: 'elements-book',
    title: 'ဓာတ်ကြီး လေးပါး',
    paliTitle: 'Mahābhūta',
    subtitle: 'ပထဝီ၊ အာပေါ၊ တေဇော၊ ဝါယော',
    chapterIds: ['four-elements'],
  },
  {
    id: 'paticca-book',
    title: 'ပဋိစ္စသမုပ္ပါဒ်',
    paliTitle: 'Paṭiccasamuppāda',
    subtitle: 'အကြောင်းကြောင့် အကျိုးဖြစ်ပုံ',
    chapterIds: ['paticca'],
  },
  {
    id: 'kamma-book',
    title: 'ကံနှင့် ကံ၏အကျိုး',
    paliTitle: 'Kamma',
    subtitle: 'စေတနာသည် ကံဖြစ်ပုံ',
    chapterIds: ['kamma'],
  },
  {
    id: 'parami-book',
    title: 'ပါရမီ ဆယ်ပါး',
    paliTitle: 'Dasa Pāramī',
    subtitle: 'စိတ်ကို မွန်မြတ်စေသော အကျင့်',
    chapterIds: ['parami', 'dana'],
  },
  {
    id: 'vipassana-book',
    title: 'ဝိပဿနာဉာဏ်',
    paliTitle: 'Vipassanā',
    subtitle: 'ဖြစ်ပျက်ကို ထိုးထွင်းသိခြင်း',
    chapterIds: ['vipassana-nana'],
  },
  {
    id: 'death-book',
    title: 'မရဏာနုဿတိ',
    paliTitle: 'Maraṇānussati',
    subtitle: 'သေခြင်းကို အောက်မေ့ခြင်း',
    chapterIds: ['marananussati'],
  },
  {
    id: 'nibbana-book',
    title: 'နိဗ္ဗာန်',
    paliTitle: 'Nibbāna',
    subtitle: 'တဏှာမီးငြိမ်းရာ',
    chapterIds: ['nibbana'],
  },
];

export function getBookById(id) {
  const book = dhammaBooks.find(item => item.id === id);
  if (!book) {
    return undefined;
  }
  return {
    ...book,
    chapters: book.chapterIds.map(chapterId => getTextById(chapterId)).filter(Boolean),
  };
}

export function getBookForText(textId) {
  return dhammaBooks.find(book => book.chapterIds.includes(textId));
}

export function getBookChapters(bookId) {
  return getBookById(bookId)?.chapters ?? [];
}

export function countBookChapters(book) {
  return book.chapterIds.filter(id => dhammaTexts.some(text => text.id === id))
    .length;
}
