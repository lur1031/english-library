/* =========================================================
   새 소설 템플릿 — 이 파일을 복사해서 이름을 바꾼 뒤
   index.html 에 <script src="data/stories/파일이름.js"></script> 한 줄 추가.
   (이 템플릿 파일 자체는 index.html 에 넣지 않아요)
   ========================================================= */
LIBRARY.addStory({
  id: 'category-short-name',          // 영문 소문자·숫자·하이픈만 (주소에 쓰임)
  category: 'daily',                  // business | fantasy | mystery | romance | science | psychology | history | daily | adventure | society
  level: 'Beginner',                  // Beginner | Intermediate | Advanced
  title: 'Story Title',
  introEn: 'One or two sentences in English.',
  introKo: '한국어 소개 한두 문장.',
  pattern: 'dots',                    // 표지 무늬: dots | stripes | waves | grid | stars
  // minutes: 8,                      // 생략하면 단어 수로 자동 계산

  // 문단 = 배열, 문장 = [영어, 한국어]
  paragraphs: [
    [
      ['First English sentence.', '첫 번째 문장 해석.'],
      ['Second English sentence.', '두 번째 문장 해석.']
    ],
    [
      ['A new paragraph starts here.', '새 문단은 여기서 시작.']
    ]
  ],

  vocab: [
    { word: 'example', pos: 'n.', meaning: '예시', ex: 'This is an example.' }
  ],
  expressions: [
    { phrase: 'for the first time', meaning: '처음으로', ex: 'I saw the sea for the first time.' }
  ],
  grammar: [
    { title: 'used to + 동사원형', body: '과거의 습관이나 상태 (지금은 아님).', ex: 'She used to bake every Sunday.' }
  ],
  analysis: [
    {
      sentence: 'Full complex sentence from the story.',
      parts: [ ['Full complex sentence', '주어 (S)'], ['from the story', '수식어 (M)'] ],
      note: '구조 설명.',
      ko: '전체 해석.'
    }
  ],
  quiz: [
    // type: title | main | blank | match | insert | order | flow | infer
    { type: 'title', q: '윗글의 제목으로 가장 적절한 것은?', passage: '', given: '',
      options: ['A', 'B', 'C', 'D'], answer: 0, explain: '해설' }
  ]
});
