const exampleFile = require('../assets/audio/example.wav');

export const dhammaAudios = [
  {
    id: 'audio-mangala',
    title: 'မင်္ဂလသုတ်',
    paliTitle: 'Maṅgala Sutta',
    speaker: 'ရွတ်ဖတ်',
    category: 'sutta',
    minutes: 12,
    subtitle: 'မင်္ဂလာသုံးဆယ့်ရှစ်ပါးကို ရွတ်ဖတ်နာယူရန်',
    file: 'https://dhammadownload.com/MP3Library/PaYateTaYar/001-MingunSayadaw-Payategyi11thout.mp3',
  },
  {
    id: 'audio-metta',
    title: 'မေတ္တာသုတ်',
    paliTitle: 'Metta Sutta',
    speaker: 'ရွတ်ဖတ်',
    category: 'sutta',
    minutes: 10,
    subtitle: 'သတ္တဝါအားလုံးအပေါ် မေတ္တာပွားများရန်',
    file: "https://dhammadownload.com/MP3Library/PaYateTaYar/002-UOaktaMa-PaYateGyi11Thout-YaeSuPaYate-GoneKunChar-Kamawar.mp3",
  },
  {
    id: 'audio-dhammacakka',
    title: 'ဓမ္မစက္ကပဝတ္တနသုတ်',
    paliTitle: 'Dhammacakkappavattana Sutta',
    speaker: 'ရွတ်ဖတ်',
    category: 'sutta',
    minutes: 16,
    subtitle: 'တရားစက်ကို ရှေးဦးစွာ လည်စေသောသုတ်',
    file: "https://dhammadownload.com/MP3Library/PaYateTaYar/011-PaAukSayadawgyi-Payategyi-11.mp3",
  },
  {
    id: 'audio-four-truths',
    title: 'အရိယသစ္စာ လေးပါး',
    paliTitle: 'Cattāri Ariyasaccāni',
    speaker: 'ဟောကြားချက်',
    category: 'foundation',
    minutes: 18,
    subtitle: 'မြတ်သောအမှန်တရား လေးပါးကို နာယူရန်',
    file: exampleFile,
  },
  {
    id: 'audio-eightfold',
    title: 'အရိယမဂ္ဂင် ရှစ်ပါး',
    paliTitle: 'Ariyo Aṭṭhaṅgiko Maggo',
    speaker: 'ဟောကြားချက်',
    category: 'foundation',
    minutes: 20,
    subtitle: 'နိဗ္ဗာန်သို့ ရောက်သော မြတ်သောလမ်းစဉ်',
    file: exampleFile,
  },
  {
    id: 'audio-satipatthana',
    title: 'သတိပဋ္ဌာန် လေးပါး',
    paliTitle: 'Cattāro Satipaṭṭhānā',
    speaker: 'ဟောကြားချက်',
    category: 'practice',
    minutes: 22,
    subtitle: 'သတိတည်ရာ လေးဌာနကို နာယူရန်',
    file: exampleFile,
  },
  {
    id: 'audio-precepts',
    title: 'ငါးပါးသီလ',
    paliTitle: 'Pañca Sīla',
    speaker: 'ဟောကြားချက်',
    category: 'practice',
    minutes: 14,
    subtitle: 'နေ့စဉ်ကျင့်အပ်သော အခြေခံသီလ',
    file: exampleFile,
  },
  {
    id: 'audio-parami',
    title: 'ပါရမီ ဆယ်ပါး',
    paliTitle: 'Dasa Pāramī',
    speaker: 'ဟောကြားချက်',
    category: 'parami',
    minutes: 19,
    subtitle: 'စိတ်ကို မွန်မြတ်စေသော ကျင့်ဝတ်များ',
    file: exampleFile,
  },
];

export function getAudioById(id) {
  return dhammaAudios.find(audio => audio.id === id);
}

export function getAudioIndex(id) {
  return dhammaAudios.findIndex(audio => audio.id === id);
}

export function getAdjacentAudio(id, delta, queue = dhammaAudios) {
  const index = queue.findIndex(audio => audio.id === id);
  if (index === -1) {
    return undefined;
  }
  const next = (index + delta + queue.length) % queue.length;
  return queue[next];
}

export const DOWNLOADS_PLAYLIST_ID = 'pl-downloads';

export function getDownloadsPlaylist(downloadedAudioIds) {
  const audioIds = Array.isArray(downloadedAudioIds)
    ? downloadedAudioIds.filter(id => typeof id === 'string' && getAudioById(id))
    : [];
  if (audioIds.length === 0) {
    return null;
  }
  return {
    id: DOWNLOADS_PLAYLIST_ID,
    name: 'ဒေါင်းလုဒ်',
    audioIds,
  };
}

export function resolvePlaylist(playlistId, settings) {
  if (!playlistId) {
    return undefined;
  }
  if (playlistId === DOWNLOADS_PLAYLIST_ID) {
    return getDownloadsPlaylist(settings?.downloadedAudioIds) ?? undefined;
  }
  return (settings?.playlists ?? []).find(item => item.id === playlistId);
}

export function getPlaylistQueue(playlist) {
  if (!playlist) {
    return dhammaAudios;
  }
  return playlist.audioIds.map(id => getAudioById(id)).filter(Boolean);
}
