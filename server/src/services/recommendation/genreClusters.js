// Genre Knowledge Graph for authentic recommendation clustering
export const GENRE_CLUSTERS = {
  bangla_rock: {
    id: 'bangla_rock',
    label: 'Bangla Rock & Band Scene',
    keywords: [
      'artcell', 'warfaze', 'aurthohin', 'shironamhin', 'nemesis', 'black',
      'cryptic fate', 'meghdol', 'avoidrafa', 'arbovirus', 'bay of bengal',
      'shurjo', 'wishtree', 'level five', 'trainwreck', 'aftermath', 'vibe',
      'powersurge', 'lrb', 'miles', 'nagar baul', 'james', 'ayub bachchu',
      'shunno', 'mechanix', 'conclusion', 'chirkutt', 'moho', 'oniket prantor'
    ],
    shelves: [
      {
        id: 'user-daily-mix-bangla-rock',
        title: '🎸 Daily Mix • Bangla Rock & Alternative',
        subtitle: 'Handpicked band anthems & underground classics',
        q: 'bangla rock band hits songs'
      },
      {
        id: 'user-bangla-indie-shelf',
        title: '🍃 Bangla Indie & Modern Band Vibes',
        subtitle: 'Meghdol, AvoidRafa, Shironamhin, Shunno & more',
        q: 'bangla indie band songs'
      }
    ]
  },
  bangla_indie: {
    id: 'bangla_indie',
    label: 'Bangla Acoustic & Indie',
    keywords: [
      'anupam roy', 'arnob', 'minar', 'tahsan', 'pritom hasan', 'konal',
      'habib wahid', 'kaaktaal', 'somnur', 'joy shahriar', 'topu', 'bappa mazumder'
    ],
    shelves: [
      {
        id: 'user-daily-mix-bangla-indie',
        title: '☕ Daily Mix • Bangla Acoustic & Chill',
        subtitle: 'Soulful melodies and heartfelt acoustic sessions',
        q: 'bangla acoustic indie songs'
      },
      {
        id: 'user-bangla-evergreen',
        title: '✨ Timeless Bengali Masterpieces',
        subtitle: 'Evergreen melodies and celebrated artists',
        q: 'bangla evergreen classic songs'
      }
    ]
  },
  bollywood_hindi: {
    id: 'bollywood_hindi',
    label: 'Bollywood & Hindi Melodies',
    keywords: [
      'arijit singh', 'atif aslam', 'pritam', 'vishal mishra', 'shreya ghoshal',
      'kk', 'mohit chauhan', 'jubin nautiyal', 'b praak', 'jasleen royal',
      'anuv jain', 'neha kakkar', 'badshah', 'ar rahman', 'sonu nigam',
      'kishore kumar', 'arijit', 'atif', 'pehli dafa', 'kesariya', 'tum hi ho'
    ],
    shelves: [
      {
        id: 'user-daily-mix-hindi',
        title: '✨ Daily Mix • Bollywood Romance & Hits',
        subtitle: 'Arijit Singh, Atif Aslam, Pritam & chart-toppers',
        q: 'bollywood romantic melodies arijit atif pritam'
      },
      {
        id: 'user-hindi-acoustic',
        title: '🌙 Soulful Hindi Acoustic & Lofi',
        subtitle: 'Mellow late-night acoustic and relaxing Hindi tracks',
        q: 'hindi acoustic soulful lofi songs'
      }
    ]
  },
  global_rock: {
    id: 'global_rock',
    label: 'Global Rock & Alt-Rock',
    keywords: [
      'linkin park', 'coldplay', 'imagine dragons', 'green day', 'nirvana',
      'queen', 'arctic monkeys', 'red hot chili peppers', 'bon jovi',
      'guns n roses', 'metallica', 'slipknot', 'ac/dc', 'radiohead'
    ],
    shelves: [
      {
        id: 'user-daily-mix-rock',
        title: '🎸 Daily Mix • Rock Anthems & Modern Alt',
        subtitle: 'High-voltage guitar riffs and legendary anthems',
        q: 'rock band anthems modern alternative'
      },
      {
        id: 'user-alt-indie',
        title: '⚡ Alternative & Indie Rock Spotlight',
        subtitle: 'Atmospheric rock and energetic modern hits',
        q: 'alternative indie rock hits'
      }
    ]
  },
  global_pop: {
    id: 'global_pop',
    label: 'Global Pop & Chartbusters',
    keywords: [
      'ed sheeran', 'the weeknd', 'taylor swift', 'bruno mars', 'dua lipa',
      'billie eilish', 'post malone', 'justin bieber', 'ariana grande',
      'harry styles', 'charlie puth', 'olivia rodrigo', 'shawn mendes'
    ],
    shelves: [
      {
        id: 'user-daily-mix-pop',
        title: '✨ Daily Mix • Global Pop Hits',
        subtitle: 'The biggest chartbusters dominating the world',
        q: 'global pop chartbusters 2026'
      }
    ]
  }
};
