/* =========================================================
   My Little English Library — data registry
   ---------------------------------------------------------
   - CATEGORIES : 책장(카테고리) 정의
   - LEVELS     : 난이도 정의
   - addStory() : 소설 파일에서 호출해 등록
   ========================================================= */
window.LIBRARY = (function () {
  const ICONS = {
    business: '<rect x="8" y="16" width="32" height="22" rx="3"/><path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M8 26h32M21 26v3h6v-3"/>',
    fantasy: '<path d="M29 9a14 14 0 1 0 9 25A12 12 0 0 1 29 9z"/><path d="M37 7l1.4 3 3 1.4-3 1.4L37 16l-1.4-3.2-3-1.4 3-1.4z"/><circle cx="40" cy="22" r="0.8"/>',
    mystery: '<circle cx="21" cy="21" r="11"/><path d="M29.5 29.5L39 39"/><path d="M15.5 19a6 6 0 0 1 5.5-5"/>',
    romance: '<path d="M24 38s-13-7.6-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 37 21c0 9.4-13 17-13 17z"/><path d="M18.5 21.5a3.5 3.5 0 0 1 3-3"/>',
    science: '<circle cx="24" cy="24" r="2.6"/><ellipse cx="24" cy="24" rx="16" ry="6.2"/><ellipse cx="24" cy="24" rx="16" ry="6.2" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="16" ry="6.2" transform="rotate(120 24 24)"/>',
    psychology: '<path d="M29 40v-6h3.5a3 3 0 0 0 3-3v-4.5l3-1.2-3-5.8A13 13 0 1 0 15 30v10"/><path d="M21.5 18.5a3.6 3.6 0 0 1 6.6 1.9c0 2.6-3.1 2.9-3.1 5.1"/><circle cx="25" cy="29.5" r="0.6"/>',
    history: '<path d="M15 9h21a4 4 0 0 1 0 8H15"/><path d="M15 9a4 4 0 0 0-4 4v22a4 4 0 0 0 4 4h19a4 4 0 0 0 4-4V17"/><path d="M17 24h14M17 30h9"/>',
    daily: '<path d="M10 20h24v8a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z"/><path d="M34 22h2.5a4 4 0 0 1 0 8H33"/><path d="M18 8c-2 3 2 5 0 8M25 8c-2 3 2 5 0 8"/>',
    adventure: '<path d="M4 40l14-22 8 12 5-7 13 17z"/><path d="M18 18V7l8 3.2-8 3.2"/>',
    society: '<circle cx="24" cy="24" r="15"/><path d="M9 24h30M24 9c5.5 5 5.5 25 0 30M24 9c-5.5 5-5.5 25 0 30"/>'
  };

  const CATEGORIES = [
    { id: 'business',   name: 'Business',             ko: '비즈니스',     color: '#D5E0E6', ink: '#4F6B7A', desc: 'Small dreams, big decisions, and the people behind every deal.', descKo: '작은 꿈과 큰 결정, 그리고 거래 뒤의 사람들 이야기' },
    { id: 'fantasy',    name: 'Fantasy',              ko: '판타지',       color: '#E3D8EE', ink: '#6E5A8A', desc: 'Quiet magic hiding in ordinary towns.',                         descKo: '평범한 마을에 숨어 있는 조용한 마법' },
    { id: 'mystery',    name: 'Mystery',              ko: '미스터리',     color: '#D3DAD3', ink: '#4E5E52', desc: 'Small puzzles, careful clues, and surprising answers.',          descKo: '작은 수수께끼, 꼼꼼한 단서, 뜻밖의 해답' },
    { id: 'romance',    name: 'Romance',              ko: '로맨스',       color: '#F4D3CE', ink: '#A0605A', desc: 'Gentle stories of meeting, missing, and finding.',              descKo: '만나고, 그리워하고, 찾아가는 다정한 이야기' },
    { id: 'science',    name: 'Science & Technology', ko: '과학·기술',    color: '#D2E4E6', ink: '#4A7177', desc: 'Where clever machines meet human questions.',                  descKo: '똑똑한 기계가 인간의 질문과 만나는 곳' },
    { id: 'psychology', name: 'Psychology',           ko: '심리',         color: '#EEDFCB', ink: '#8A6A45', desc: 'The hidden logic of fear, hope, and habit.',                    descKo: '두려움과 희망, 습관 속에 숨은 마음의 논리' },
    { id: 'history',    name: 'History',              ko: '역사',         color: '#E4D6BF', ink: '#7D6343', desc: 'Ordinary lives inside extraordinary moments.',                 descKo: '특별한 순간 속을 살아간 평범한 사람들' },
    { id: 'daily',      name: 'Daily Life',           ko: '일상',         color: '#DCE6D0', ink: '#5D7550', desc: 'Warm moments from kitchens, streets, and neighbors.',           descKo: '부엌과 골목, 이웃 사이의 따뜻한 순간' },
    { id: 'adventure',  name: 'Adventure',            ko: '모험',         color: '#D4E5D6', ink: '#4D7656', desc: 'Maps, storms, and the courage to keep walking.',                descKo: '지도와 폭풍, 그리고 계속 걸어갈 용기' },
    { id: 'society',    name: 'Society & Culture',    ko: '사회·문화',    color: '#EDDCCD', ink: '#8C6248', desc: 'How communities remember, change, and belong.',                 descKo: '공동체가 기억하고, 변하고, 함께하는 방식' }
  ];

  const LEVELS = {
    Beginner:     { ko: '초급', wpm: 110, dots: 1 },
    Intermediate: { ko: '중급', wpm: 130, dots: 2 },
    Advanced:     { ko: '고급 · 편입', wpm: 140, dots: 3 }
  };

  const QUIZ_TYPES = {
    title:   '주제 · 제목',
    main:    '주제 · 요지',
    blank:   '빈칸 추론',
    match:   '내용 일치 · 불일치',
    insert:  '문장 삽입',
    order:   '글의 순서',
    flow:    '흐름상 무관한 문장',
    infer:   '추론'
  };

  const stories = [];

  function addStory(s) {
    // 문장 번호를 자동으로 매긴다 (paragraphs: [[ [en, ko], ... ], ...])
    let idx = 0, words = 0;
    s.sentences = [];
    s.paragraphs = s.paragraphs.map(p => p.map(([en, ko]) => {
      const sent = { i: idx++, en, ko };
      words += en.split(/\s+/).length;
      s.sentences.push(sent);
      return sent;
    }));
    s.wordCount = words;
    const wpm = (LEVELS[s.level] || LEVELS.Intermediate).wpm;
    s.minutes = s.minutes || Math.max(3, Math.round(words / wpm) + 2); // +2: 해석 확인 여유
    stories.push(s);
  }

  return {
    ICONS, CATEGORIES, LEVELS, QUIZ_TYPES, stories, addStory,
    category: id => CATEGORIES.find(c => c.id === id),
    story: id => stories.find(s => s.id === id),
    byCategory: id => stories.filter(s => s.category === id)
  };
})();
