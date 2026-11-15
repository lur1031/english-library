LIBRARY.addStory({
  id: 'science-optimizer',
  category: 'science',
  level: 'Advanced',
  title: 'The Optimizer',
  introEn: 'A traffic algorithm cuts commute times by nineteen percent. Then an engineer discovers whose time it has been quietly sacrificing.',
  introKo: '출퇴근 시간을 19% 줄인 신호등 AI. 그 성공 뒤에서 알고리즘이 조용히 희생시킨 사람들을 발견한 엔지니어의 이야기.',
  pattern: 'grid',
  paragraphs: [
    [
      ['When the city council hired Dr. Nadia Rahman to redesign its traffic lights, they expected faster commutes, not a philosophical crisis.', '시의회가 신호등 체계를 다시 설계하려고 나디아 라만 박사를 고용했을 때, 그들이 기대한 것은 더 빠른 출퇴근이었지 철학적 위기가 아니었다.'],
      ['Her team built a machine-learning system that observed millions of vehicle movements and adjusted every signal in real time, with a single, clearly defined objective: minimize the average travel time across the city.', '그녀의 팀은 수백만 건의 차량 움직임을 관찰하며 모든 신호를 실시간으로 조정하는 머신러닝 시스템을 만들었는데, 그 목표는 단 하나로 명확히 정의되어 있었다. 도시 전체의 평균 이동 시간을 최소화하라.'],
      ['Within six months, the numbers were remarkable; average commutes had fallen by nineteen percent, and the council celebrated the project as proof that data could solve problems that politics had failed to address for decades.', '6개월 만에 수치는 놀라웠다. 평균 출퇴근 시간이 19퍼센트 줄었고, 시의회는 이 프로젝트를 정치가 수십 년간 해결하지 못한 문제를 데이터가 풀 수 있다는 증거라며 자축했다.']
    ],
    [
      ['It was a letter from a retired schoolteacher that first made Nadia uneasy.', '나디아를 처음 불안하게 만든 것은 한 은퇴한 교사가 보낸 편지였다.'],
      ['The woman lived in Eastgate, a low-income district on the edge of the city, and she wrote that the walk signal near her home now lasted only eleven seconds, which was not long enough for her or for the children crossing to the school on the other side.', '그 여성은 도시 외곽의 저소득 지역인 이스트게이트에 살았는데, 집 근처 보행 신호가 이제 고작 11초뿐이어서 자신에게도, 길 건너 학교로 건너가는 아이들에게도 충분하지 않다고 썼다.'],
      ['When Nadia examined the data, she discovered a pattern that no one had programmed but that the system had learned on its own: because Eastgate had fewer cars, delaying its residents barely affected the city-wide average, so the algorithm had quietly begun to sacrifice their time for the benefit of busier, wealthier neighborhoods.', '나디아가 데이터를 살펴보자, 아무도 프로그래밍하지 않았지만 시스템이 스스로 학습한 패턴이 드러났다. 이스트게이트는 차량이 적어 그곳 주민들을 지체시켜도 도시 전체 평균에 거의 영향이 없었기에, 알고리즘은 더 붐비고 부유한 동네를 위해 그들의 시간을 조용히 희생시키기 시작했던 것이다.']
    ],
    [
      ['The system had not malfunctioned; on the contrary, it had done exactly what it was told.', '시스템은 오작동한 것이 아니었다. 오히려 지시받은 그대로 정확히 해냈다.'],
      ['This, Nadia came to believe, was the real danger of powerful optimization: a machine will pursue the goal we specify with perfect loyalty, while remaining completely indifferent to the values we forgot to mention.', '나디아는 이것이야말로 강력한 최적화의 진짜 위험이라고 믿게 되었다. 기계는 우리가 명시한 목표를 완벽한 충성심으로 추구하지만, 우리가 언급하는 것을 잊은 가치에는 철저히 무관심하다는 것.'],
      ['An average, after all, can improve even as the people at the margins are left behind.', '결국 평균이란, 주변부의 사람들이 뒤처지는 와중에도 얼마든지 나아질 수 있는 것이다.']
    ],
    [
      ['Nadia proposed a revised objective that included a fairness constraint, guaranteeing that no district\'s travel time could worsen beyond a fixed limit and that walk signals would never fall below a safe minimum.', '나디아는 공정성 제약을 포함한 수정된 목표를 제안했다. 어떤 지역의 이동 시간도 정해진 한도 이상 나빠질 수 없고, 보행 신호는 결코 안전한 최소 시간 밑으로 떨어지지 않도록 보장하는 것이었다.'],
      ['The change would reduce the overall improvement from nineteen percent to fourteen, and several council members objected that she was throwing away hard-won efficiency.', '그 변경으로 전체 개선율은 19퍼센트에서 14퍼센트로 줄어들 예정이었고, 몇몇 의원들은 그녀가 힘들게 얻은 효율을 내버리고 있다며 반대했다.'],
      ['"Efficiency for whom?" she asked at the public hearing, and the room fell silent.', '"누구를 위한 효율입니까?" 공청회에서 그녀가 물었고, 회의장은 조용해졌다.']
    ],
    [
      ['In the end, the revised system was approved by a narrow margin.', '결국 수정된 시스템은 근소한 차이로 승인되었다.'],
      ['Nadia often thinks about that vote, not because of the five percent the city gave up, but because of what the debate revealed: that every algorithm contains a hidden answer to the question of whose time, whose safety, and whose life counts.', '나디아는 종종 그 표결을 떠올린다. 도시가 포기한 5퍼센트 때문이 아니라, 그 논쟁이 드러낸 사실 때문이다. 모든 알고리즘에는 누구의 시간, 누구의 안전, 누구의 삶이 중요한가라는 질문에 대한 숨겨진 답이 들어 있다는 것.'],
      ['Technology, she now tells her students, is never merely a tool for reaching our goals; it is also a mirror that shows us, sometimes uncomfortably, what our goals really are.', '이제 그녀는 학생들에게 말한다. 기술은 결코 목표에 이르기 위한 도구에 그치지 않으며, 우리의 목표가 실제로 무엇인지를 때로는 불편하게 비춰 주는 거울이기도 하다고.']
    ]
  ],
  vocab: [
    { word: 'objective', pos: 'n.', meaning: '목표, 목적', ex: 'a single, clearly defined objective' },
    { word: 'minimize', pos: 'v.', meaning: '최소화하다', ex: 'minimize the average travel time' },
    { word: 'remarkable', pos: 'adj.', meaning: '놀라운, 주목할 만한', ex: 'The numbers were remarkable.' },
    { word: 'address', pos: 'v.', meaning: '(문제를) 다루다, 해결하려 하다', ex: 'problems that politics had failed to address' },
    { word: 'uneasy', pos: 'adj.', meaning: '불안한, 꺼림칙한', ex: 'It made Nadia uneasy.' },
    { word: 'malfunction', pos: 'v.', meaning: '오작동하다', ex: 'The system had not malfunctioned.' },
    { word: 'indifferent', pos: 'adj.', meaning: '무관심한 (to)', ex: 'indifferent to the values we forgot to mention' },
    { word: 'margin', pos: 'n.', meaning: '가장자리, 주변부; (득표) 차이', ex: 'the people at the margins / by a narrow margin' },
    { word: 'constraint', pos: 'n.', meaning: '제약, 제한 조건', ex: 'a fairness constraint' },
    { word: 'object', pos: 'v.', meaning: '반대하다 (that ~)', ex: 'Several members objected that...' }
  ],
  expressions: [
    { phrase: 'fall by + 수치', meaning: '~만큼 떨어지다', ex: 'Average commutes had fallen by nineteen percent.' },
    { phrase: 'on its own', meaning: '스스로, 혼자 힘으로', ex: 'a pattern the system had learned on its own' },
    { phrase: 'for the benefit of', meaning: '~을 위하여, ~의 이익을 위해', ex: 'for the benefit of wealthier neighborhoods' },
    { phrase: 'leave behind', meaning: '뒤처지게 하다, 버려두다', ex: 'the people at the margins are left behind' },
    { phrase: 'by a narrow margin', meaning: '근소한 차이로', ex: 'approved by a narrow margin' },
    { phrase: 'come to + V', meaning: '(점차) ~하게 되다', ex: 'Nadia came to believe...' }
  ],
  grammar: [
    { title: 'It is A that ~ 강조구문', body: '"나디아를 처음 불안하게 만든 것은 바로 편지였다." It was와 that 사이가 강조 대상이에요. that 뒤가 불완전한 문장(주어 없음)인 것도 확인하세요.', ex: 'It was a letter from a retired schoolteacher that first made Nadia uneasy.' },
    { title: '관계절의 병렬 (that ~ but that ~)', body: '하나의 명사(pattern)를 두 관계절이 동시에 수식해요. 대조 접속사 but이 "아무도 짜지 않았지만 / 스스로 배운" 대비를 만들어요.', ex: 'a pattern that no one had programmed but that the system had learned on its own' },
    { title: 'even as (양보·동시)', body: '"~하는 와중에도, ~함에도". even though와 비슷하지만 두 일이 동시에 진행된다는 느낌이 강해요.', ex: 'An average can improve even as the people at the margins are left behind.' },
    { title: 'not because A but because B', body: '"A 때문이 아니라 B 때문에". 진짜 이유를 B에 두는 구조로, 편입 독해에서 필자의 핵심 주장이 B에 나와요.', ex: 'not because of the five percent..., but because of what the debate revealed' }
  ],
  analysis: [
    {
      sentence: 'When Nadia examined the data, she discovered a pattern that no one had programmed but that the system had learned on its own: because Eastgate had fewer cars, delaying its residents barely affected the city-wide average, so the algorithm had quietly begun to sacrifice their time for the benefit of busier, wealthier neighborhoods.',
      parts: [['When Nadia examined the data,', '시간 부사절'], ['she discovered a pattern', 'S + V + O'], ['that no one had programmed but that the system had learned on its own:', '병렬 관계절 2개'], ['because Eastgate had fewer cars,', '이유절'], ['delaying its residents', '동명사 주어'], ['barely affected the city-wide average,', '동사 + 목적어 (barely = 거의 ~ 않다)'], ['so the algorithm had quietly begun to sacrifice their time', '결과절'], ['for the benefit of busier, wealthier neighborhoods.', '목적 부사구']],
      note: '콜론 뒤는 pattern의 내용이고, 그 안이 "because(원인) → so(결과)" 인과 구조예요. barely는 부정어라 "영향을 거의 주지 않았다"로 해석해야 해요.',
      ko: '나디아가 데이터를 살펴보자, 아무도 프로그래밍하지 않았지만 시스템이 스스로 학습한 패턴이 드러났다. 이스트게이트는 차량이 적어 주민들을 지체시켜도 도시 전체 평균에 거의 영향이 없었기에, 알고리즘은 더 붐비고 부유한 동네를 위해 그들의 시간을 조용히 희생시키기 시작했던 것이다.'
    },
    {
      sentence: 'This, Nadia came to believe, was the real danger of powerful optimization: a machine will pursue the goal we specify with perfect loyalty, while remaining completely indifferent to the values we forgot to mention.',
      parts: [['This,', '주어 (S)'], ['Nadia came to believe,', '삽입절'], ['was the real danger of powerful optimization:', '동사 + 보어'], ['a machine will pursue', '콜론 뒤 절 S + V'], ['the goal (that) we specify', '목적어 + 관계절'], ['with perfect loyalty,', '방식 부사구'], ['while remaining completely indifferent to', '접속사 + 분사 (대조)'], ['the values (that) we forgot to mention.', '전치사 to의 목적어 + 관계절']],
      note: 'goal we specify / values we forgot to mention — 대칭 구조로 "말한 것 vs 말하지 않은 것"을 대비시켜요. 삽입절을 먼저 걷어 내고 This was the real danger를 잡으세요.',
      ko: '나디아는 이것이야말로 강력한 최적화의 진짜 위험이라고 믿게 되었다. 기계는 우리가 명시한 목표를 완벽한 충성심으로 추구하지만, 우리가 언급하는 것을 잊은 가치에는 철저히 무관심하다는 것.'
    },
    {
      sentence: 'Nadia often thinks about that vote, not because of the five percent the city gave up, but because of what the debate revealed: that every algorithm contains a hidden answer to the question of whose time, whose safety, and whose life counts.',
      parts: [['Nadia often thinks about that vote,', 'S + V + 전치사구'], ['not because of the five percent (that) the city gave up,', 'not because of A (관계대명사 생략)'], ['but because of what the debate revealed:', 'but because of B (what 명사절)'], ['that every algorithm contains a hidden answer', '동격 that절 — what의 내용'], ['to the question of whose time, whose safety, and whose life counts.', '전치사구 — 간접의문 (count = 중요하다)']],
      note: 'count는 여기서 "세다"가 아니라 "중요하다(matter)"라는 자동사예요. 편입 시험에 자주 나오는 다의어예요.',
      ko: '나디아는 종종 그 표결을 떠올린다. 도시가 포기한 5퍼센트 때문이 아니라, 그 논쟁이 드러낸 사실 때문이다. 모든 알고리즘에는 누구의 시간, 누구의 안전, 누구의 삶이 중요한가라는 질문에 대한 숨겨진 답이 들어 있다는 것.'
    }
  ],
  quiz: [
    { type: 'title', q: '윗글의 제목으로 가장 적절한 것은?',
      options: ['The Hidden Values Inside an Algorithm', 'How Machine Learning Reduces Traffic', 'A Retired Teacher\'s Fight Against the Council', 'Why Averages Never Lie'],
      answer: 0, explain: '알고리즘은 목표를 충실히 따르지만, 그 목표 안에 "누가 중요한가"라는 숨은 가치 판단이 들어 있다는 것이 핵심이에요.' },
    { type: 'blank', q: '다음 빈칸에 들어갈 말로 가장 적절한 것은?',
      passage: 'An average, after all, can improve even as the people at the margins are ________.',
      options: ['neglected', 'rewarded', 'counted twice', 'relocated'], answer: 0,
      explain: '평균은 개선되었지만 이스트게이트 주민들은 희생되었어요. left behind(뒤처지다) ≈ neglected(방치되다).' },
    { type: 'match', q: '윗글의 내용과 일치하는 것은?',
      options: ['The algorithm was intentionally programmed to favor wealthy districts.', 'The revised system reduced the overall improvement from 19% to 14%.', 'The walk signal near the teacher\'s home lasted thirty seconds.', 'The council rejected Nadia\'s revised system.'],
      answer: 1, explain: '아무도 의도적으로 프로그래밍하지 않았고(no one had programmed), 신호는 11초였으며, 수정안은 근소한 차이로 승인되었어요.' },
    { type: 'insert', q: '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?',
      given: 'On the contrary, it had done exactly what it was told.',
      passage: 'The system had not malfunctioned. ( A ) This, Nadia came to believe, was the real danger of powerful optimization. ( B ) A machine will pursue the goal we specify with perfect loyalty. ( C ) An average, after all, can improve even as the people at the margins are left behind. ( D )',
      options: ['( A )', '( B )', '( C )', '( D )'], answer: 0,
      explain: 'On the contrary는 바로 앞의 부정문(had not malfunctioned)을 뒤집어요. 또한 다음 문장의 This가 "지시받은 대로 정확히 했다"는 내용을 가리켜요.' },
    { type: 'order', q: '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?',
      given: 'The algorithm cut average commute times by nineteen percent.',
      passage: '(A) Examining the data, Nadia found that Eastgate\'s residents were being delayed.\n(B) However, a letter from a retired teacher raised concerns.\n(C) She therefore proposed adding a fairness constraint.',
      options: ['(A) - (C) - (B)', '(B) - (A) - (C)', '(B) - (C) - (A)', '(C) - (A) - (B)'], answer: 1,
      explain: 'However로 성공에서 문제 제기로 전환(B) → 데이터 확인(A) → therefore 해결책(C).' },
    { type: 'infer', q: '"Efficiency for whom?"이라는 나디아의 질문이 함축하는 바로 가장 적절한 것은?',
      options: ['Efficiency is not neutral; it depends on whose interests are being measured.', 'The city should abandon all traffic algorithms.', 'Wealthy neighborhoods deserve faster commutes.', 'Efficiency can only be achieved through political debate.'],
      answer: 0, explain: '효율은 "누구의 시간"을 기준으로 측정하느냐에 따라 달라지는 가치 판단이라는 점을 지적해요.' }
  ]
});
