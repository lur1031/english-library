/* =========================================================
   My Little Library Pet — 독서 보상으로 키우는 서재 펫
   ---------------------------------------------------------
   - 하루 첫 완독  : 큰 밥 (+25 XP, +10 코인)
   - 새 책 완독    : 난이도별 보너스
   - 단어 외우기   : 작은 간식
   - 독해 만점     : 별 보너스
   - 연속 독서     : 옷장 아이템 해금
   app.js 에서 window.PetModule(ctx) 로 생성
   ========================================================= */
window.PetModule = function (ctx) {
  const { Store, toast, esc, L } = ctx;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------------- 상수 ---------------- */
  const SPECIES = {
    owl:      { ko: '부엉이',   en: 'Owl',      name: '부부', body: '#CDB295', belly: '#F6EBDC', dark: '#A88B6E', accent: '#E8A65A' },
    cat:      { ko: '고양이',   en: 'Cat',      name: '모카', body: '#DCCFC3', belly: '#FAF4EC', dark: '#B9AA9B', accent: '#EFA9A1' },
    hedgehog: { ko: '고슴도치', en: 'Hedgehog', name: '밤톨', body: '#B8957A', belly: '#F4E5D1', dark: '#94735A', accent: '#EFA9A1' }
  };
  const STAGES = [
    { key: 'egg',      ko: '알',     xp: 0 },
    { key: 'baby',     ko: '아기',   xp: 30 },
    { key: 'kid',      ko: '꼬마',   xp: 150 },
    { key: 'bookworm', ko: '책벌레', xp: 400 },
    { key: 'scholar',  ko: '학자',   xp: 800 }
  ];
  const STAGE_SCALE = { baby: .62, kid: .8, bookworm: .92, scholar: 1 };
  const COMPLETE_XP = { Beginner: [30, 10], Intermediate: [45, 15], Advanced: [60, 20] };

  const ROOM_ITEMS = [
    { id: 'plant',     ko: '화분',     emoji: '🪴', price: 20 },
    { id: 'cushion',   ko: '방석',     emoji: '🟢', price: 25 },
    { id: 'garland',   ko: '가랜드',   emoji: '🎏', price: 25 },
    { id: 'rug',       ko: '러그',     emoji: '🧶', price: 30 },
    { id: 'frame',     ko: '액자',     emoji: '🖼️', price: 35 },
    { id: 'lamp',      ko: '스탠드',   emoji: '💡', price: 40 },
    { id: 'bookshelf', ko: '책장',     emoji: '📚', price: 60 },
    { id: 'window',    ko: '창문',     emoji: '🪟', price: 80 }
  ];
  const WEARABLES = [
    { id: 'scarf',   ko: '목도리', emoji: '🧣', slot: 'neck', streak: 3 },
    { id: 'beret',   ko: '베레모', emoji: '🎨', slot: 'head', streak: 7 },
    { id: 'bow',     ko: '리본',   emoji: '🎀', slot: 'head', streak: 14 },
    { id: 'crown',   ko: '왕관',   emoji: '👑', slot: 'head', streak: 30 },
    { id: 'glasses', ko: '동그란 안경', emoji: '👓', slot: 'face', price: 50 }
  ];

  /* ---------------- 날짜 ---------------- */
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  /* ---------------- 상태 ---------------- */
  function pet() {
    const d = Store.data;
    if (!d.pet) {
      d.pet = { species: null, name: '', xp: 0, coins: 0, fedDays: {}, owned: [], placed: [], wear: {}, ledger: { done: {}, quiz: {}, words: {} }, born: Date.now() };
      // 이미 읽은 기록은 환영 선물로 경험치 반영
      L.stories.forEach(s => {
        const r = d.stories[s.id];
        if (r && r.status === 'done') { const [x, c] = COMPLETE_XP[s.level]; d.pet.xp += x; d.pet.coins += c; d.pet.ledger.done[s.id] = 1; }
      });
      Object.keys(d.words || {}).forEach(k => { d.pet.xp += 3; d.pet.coins += 1; d.pet.ledger.words[k] = 1; });
      Store.save();
    }
    return d.pet;
  }
  const stageOf = xp => { let s = STAGES[0]; STAGES.forEach(st => { if (xp >= st.xp) s = st; }); return s; };
  const nextStage = xp => STAGES.find(st => st.xp > xp) || null;

  function streakInfo() {
    const p = pet(); const fed = p.fedDays;
    let cur = 0, day = new Date();
    if (!fed[dayKey(day)]) day = addDays(day, -1);          // 오늘 아직이면 어제부터 이어서 계산
    while (fed[dayKey(day)]) { cur++; day = addDays(day, -1); }
    // 최고 기록
    const keys = Object.keys(fed).sort(); let best = 0, run = 0, prev = null;
    keys.forEach(k => {
      const d = new Date(k + 'T00:00:00');
      run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1;
      best = Math.max(best, run); prev = d;
    });
    return { cur, best, today: !!fed[dayKey()], yesterday: !!fed[dayKey(addDays(new Date(), -1))] };
  }
  function mood() {
    const st = streakInfo();
    if (st.today) return 'happy';
    if (st.yesterday) return 'waiting';
    return Object.keys(pet().fedDays).length || pet().species ? 'sleepy' : 'waiting';
  }
  const isUnlocked = w => w.streak ? streakInfo().best >= w.streak : pet().owned.includes(w.id);

  /* ---------------- 그림 ---------------- */
  const INK = '#3B332E';
  function eyes(species, m, ex) {
    const [[x1, y1], [x2, y2]] = ex;
    if (m === 'happy') return [x1, x2].map((x, i) => `<path d="M${x - 7} ${(i ? y2 : y1) + 2} q7 -9 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
    if (m === 'sleepy') return [x1, x2].map((x, i) => `<path d="M${x - 7} ${(i ? y2 : y1)} q7 6 14 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
    const r = species === 'owl' ? 9 : species === 'cat' ? 6.5 : 5.5;
    return [[x1, y1], [x2, y2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * .35}" cy="${y - r * .4}" r="${r * .35}" fill="#fff"/>`).join('');
  }
  function spikesPath() {
    const cx = 100, cy = 136, rx = 62, ry = 56, n = 24; let d = '';
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * (0.92 + 1.16 * i / n), k = i % 2 ? 1 : 0.8;
      const x = cx + rx * k * Math.cos(a), y = cy + ry * k * Math.sin(a);
      d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d + ' Z';
  }
  const ANCH = {
    owl:      { eyes: [[82, 104], [118, 104]], top: 76, neck: 133, neckW: 80, eyeR: 9 },
    cat:      { eyes: [[85, 104], [115, 104]], top: 70, neck: 138, neckW: 62, eyeR: 7 },
    hedgehog: { eyes: [[86, 128], [114, 128]], top: 86, neck: 158, neckW: 70, eyeR: 6 }
  };
  function bodySVG(sp, m) {
    const c = SPECIES[sp], a = ANCH[sp];
    const cheeks = (y, dx) => `<ellipse cx="${100 - dx}" cy="${y}" rx="6" ry="3.5" fill="#F2A9A0" opacity=".45"/><ellipse cx="${100 + dx}" cy="${y}" rx="6" ry="3.5" fill="#F2A9A0" opacity=".45"/>`;
    if (sp === 'owl') return `
      <ellipse cx="88" cy="178" rx="8" ry="4" fill="${c.accent}"/><ellipse cx="112" cy="178" rx="8" ry="4" fill="${c.accent}"/>
      <path d="M62 96 L57 66 L82 84 Z M138 96 L143 66 L118 84 Z" fill="${c.body}"/>
      <ellipse cx="100" cy="128" rx="46" ry="50" fill="${c.body}"/>
      <ellipse cx="57" cy="134" rx="11" ry="26" fill="${c.dark}" transform="rotate(-10 57 134)"/>
      <ellipse cx="143" cy="134" rx="11" ry="26" fill="${c.dark}" transform="rotate(10 143 134)"/>
      <ellipse cx="100" cy="146" rx="29" ry="29" fill="${c.belly}"/>
      <path d="M88 140 q4 4 8 0 M104 140 q4 4 8 0 M96 152 q4 4 8 0" stroke="${c.dark}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
      <circle cx="82" cy="104" r="19" fill="${c.belly}"/><circle cx="118" cy="104" r="19" fill="${c.belly}"/>
      ${eyes(sp, m, a.eyes)}
      <path d="M95 117 L105 117 L100 125 Z" fill="${c.accent}"/>
      ${cheeks(120, 32)}`;
    if (sp === 'cat') return `
      <path d="M130 170 C168 172 170 124 150 120" stroke="${c.body}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="152" rx="36" ry="30" fill="${c.body}"/>
      <ellipse cx="100" cy="158" rx="20" ry="19" fill="${c.belly}"/>
      <ellipse cx="86" cy="179" rx="10" ry="5" fill="${c.belly}"/><ellipse cx="114" cy="179" rx="10" ry="5" fill="${c.belly}"/>
      <path d="M66 88 L64 52 L92 72 Z M134 88 L136 52 L108 72 Z" fill="${c.body}"/>
      <path d="M70 80 L69 61 L85 72 Z M130 80 L131 61 L115 72 Z" fill="${c.accent}" opacity=".7"/>
      <circle cx="100" cy="104" r="38" fill="${c.body}"/>
      <ellipse cx="100" cy="118" rx="18" ry="12" fill="${c.belly}"/>
      ${eyes(sp, m, a.eyes)}
      <path d="M96 114 L104 114 L100 119 Z" fill="${c.accent}"/>
      <path d="M100 119 q-4 5 -8 2 M100 119 q4 5 8 2" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M70 114 L50 110 M70 120 L50 122 M130 114 L150 110 M130 120 L150 122" stroke="${INK}" stroke-width="1.2" opacity=".5" stroke-linecap="round"/>
      ${cheeks(120, 26)}`;
    return `
      <path d="${spikesPath()}" fill="${c.dark}"/>
      <path d="${spikesPath()}" fill="${c.body}" transform="translate(100 140) scale(.9) translate(-100 -140)"/>
      <ellipse cx="84" cy="177" rx="9" ry="5" fill="${c.dark}"/><ellipse cx="116" cy="177" rx="9" ry="5" fill="${c.dark}"/>
      <circle cx="73" cy="106" r="8" fill="${c.belly}"/><circle cx="127" cy="106" r="8" fill="${c.belly}"/>
      <circle cx="73" cy="106" r="4" fill="${c.accent}" opacity=".6"/><circle cx="127" cy="106" r="4" fill="${c.accent}" opacity=".6"/>
      <ellipse cx="100" cy="140" rx="40" ry="36" fill="${c.belly}"/>
      ${eyes(sp, m, a.eyes)}
      <ellipse cx="100" cy="141" rx="5" ry="4" fill="${INK}"/>
      <path d="M96 148 q4 3 8 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${cheeks(142, 24)}`;
  }
  function wearSVG(sp, wear, stage) {
    const a = ANCH[sp]; let s = '';
    const glasses = wear.face === 'glasses' || stage === 'scholar';
    if (wear.neck === 'scarf') {
      const w = a.neckW, y = a.neck;
      s += `<rect x="${100 - w / 2}" y="${y - 6}" width="${w}" height="12" rx="6" fill="#E39A92"/>
            <rect x="${100 + w / 5}" y="${y}" width="11" height="24" rx="4" fill="#E39A92" transform="rotate(12 ${100 + w / 5} ${y})"/>
            <path d="M${100 - w / 2 + 8} ${y - 6} v12 M${100 - w / 2 + 18} ${y - 6} v12" stroke="#fff" stroke-width="2" opacity=".5"/>`;
    }
    if (glasses) {
      const r = a.eyeR + 7, [[x1, y1], [x2, y2]] = a.eyes;
      s += `<circle cx="${x1}" cy="${y1}" r="${r}" fill="#fff" fill-opacity=".12" stroke="${INK}" stroke-width="2.5"/>
            <circle cx="${x2}" cy="${y2}" r="${r}" fill="#fff" fill-opacity=".12" stroke="${INK}" stroke-width="2.5"/>
            <path d="M${x1 + r} ${y1} q${(x2 - x1 - 2 * r) / 2} -5 ${x2 - x1 - 2 * r} 0" stroke="${INK}" stroke-width="2.5" fill="none"/>`;
    }
    const t = a.top;
    if (wear.head === 'beret') s += `<ellipse cx="96" cy="${t}" rx="30" ry="11" fill="#9FB59A" transform="rotate(-8 96 ${t})"/><circle cx="94" cy="${t - 11}" r="3.5" fill="#7F9A7A"/>`;
    if (wear.head === 'bow') s += `<g transform="translate(124 ${t + 8}) rotate(15)"><path d="M0 0 L-14 -9 L-14 9 Z M0 0 L14 -9 L14 9 Z" fill="#EFA9A1"/><circle r="4.5" fill="#D98F87"/></g>`;
    if (wear.head === 'crown') s += `<path d="M80 ${t + 2} L82 ${t - 16} L91 ${t - 6} L100 ${t - 20} L109 ${t - 6} L118 ${t - 16} L120 ${t + 2} Z" fill="#EBC56B" stroke="#C99A3B" stroke-width="1.5" stroke-linejoin="round"/><circle cx="100" cy="${t - 4}" r="2.5" fill="#E39A92"/>`;
    if (stage === 'bookworm' || stage === 'scholar') {
      s += `<g transform="translate(0 ${sp === 'cat' ? 2 : 0})"><path d="M74 162 q13 -7 26 0 q13 -7 26 0 v18 q-13 -7 -26 0 q-13 -7 -26 0 z" fill="#FFFDF8" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M100 162 v18 M80 166 h12 M80 171 h12 M108 166 h12 M108 171 h12" stroke="${INK}" stroke-width="1.1" opacity=".55"/></g>`;
    }
    return s;
  }
  function eggSVG(sp, xp) {
    const c = SPECIES[sp] || SPECIES.owl;
    const crack = xp >= 15 ? `<path d="M70 128 l8 -7 l7 8 l8 -9 l7 8 l8 -8 l7 8 l8 -7" stroke="${INK}" stroke-width="2" fill="none" stroke-linejoin="round" opacity=".55"/>` : '';
    return `<g class="egg-wobble"><ellipse cx="100" cy="183" rx="34" ry="5" fill="#000" opacity=".06"/>
      <ellipse cx="100" cy="132" rx="40" ry="50" fill="#FFF8EC" stroke="${c.dark}" stroke-opacity=".35" stroke-width="2"/>
      <circle cx="84" cy="110" r="7" fill="${c.body}" opacity=".7"/><circle cx="114" cy="122" r="5" fill="${c.body}" opacity=".7"/>
      <circle cx="92" cy="150" r="9" fill="${c.body}" opacity=".7"/><circle cx="118" cy="154" r="4" fill="${c.body}" opacity=".7"/>
      ${crack}</g>`;
  }
  // 펫 단독 SVG (200x200)
  const CROP = { egg: '35 68 130 125', baby: '28 70 144 128', kid: '18 50 164 148', bookworm: '10 38 180 160', scholar: '8 30 184 168' };
  function petSVG({ species, xp, wear = {}, m = 'happy', size = '', crop = false } = {}) {
    const st = stageOf(xp).key;
    let inner;
    if (!species || st === 'egg') inner = eggSVG(species, xp);
    else {
      const k = STAGE_SCALE[st];
      inner = `<ellipse cx="100" cy="183" rx="${40 * k}" ry="5" fill="#000" opacity=".07"/>
        <g transform="translate(100 182) scale(${k}) translate(-100 -182)">
          <g class="${m === 'sleepy' ? 'breathe' : 'bob'}">${bodySVG(species, m)}${wearSVG(species, wear, st)}</g>
        </g>
        ${m === 'sleepy' ? `<g class="zzz" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" fill="${INK}" opacity=".6"><text x="146" y="70" font-size="18">z</text><text x="160" y="52" font-size="24">Z</text></g>` : ''}
        ${m === 'happy' && st === 'scholar' ? `<g fill="#EBC56B"><path d="M40 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/><path d="M160 90 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z"/></g>` : ''}`;
    }
    const vb = crop ? (!species ? CROP.egg : CROP[st]) : '0 0 200 200';
    return `<svg class="pet-svg ${size}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }
  function roomSVG() {
    const p = pet(); const has = id => p.placed.includes(id); const m = mood();
    const night = m === 'sleepy';
    let s = `<rect width="360" height="210" fill="#FBF4EA"/><rect y="206" width="360" height="54" fill="#EADFCD"/><rect y="204" width="360" height="4" fill="#E0D2BC"/>`;
    if (has('garland')) {
      const cols = ['#F2C9C4', '#B7C8B1', '#EBD7B5', '#D6E2E6'];
      s += `<path d="M0 8 Q180 40 360 8" stroke="#CDB89E" stroke-width="1.5" fill="none"/>` +
        Array.from({ length: 11 }, (_, i) => { const x = 18 + i * 31; const y = 8 + 32 * (1 - Math.pow((x - 180) / 180, 2)) * .5 + 1; return `<path d="M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 15} Z" fill="${cols[i % 4]}"/>`; }).join('');
    }
    if (has('window')) s += `<rect x="24" y="24" width="68" height="58" rx="6" fill="${night ? '#5D6787' : '#DCEBEF'}" stroke="#CDB89E" stroke-width="4"/>
      <path d="M58 24 v58 M24 53 h68" stroke="#CDB89E" stroke-width="3"/>
      ${night ? '<circle cx="42" cy="40" r="7" fill="#F6E7B8"/><circle cx="45" cy="38" r="6" fill="#5D6787"/><circle cx="78" cy="66" r="1.2" fill="#fff"/><circle cx="70" cy="36" r="1" fill="#fff"/>' : '<ellipse cx="76" cy="40" rx="9" ry="4" fill="#fff"/><ellipse cx="40" cy="68" rx="7" ry="3" fill="#fff"/>'}
      <rect x="18" y="20" width="10" height="66" rx="3" fill="#F2C9C4"/><rect x="88" y="20" width="10" height="66" rx="3" fill="#F2C9C4"/>`;
    if (has('frame')) s += `<rect x="282" y="36" width="54" height="42" rx="2" fill="#FFFDF8" stroke="#CDB89E" stroke-width="3"/><path d="M290 70 l12 -14 l9 9 l6 -6 l12 11 z" fill="#B7C8B1"/><circle cx="324" cy="48" r="4" fill="#F2C9C4"/>`;
    if (has('bookshelf')) {
      s += `<rect x="12" y="104" width="62" height="104" rx="3" fill="#D9C3A5"/><path d="M12 138 h62 M12 172 h62" stroke="#C4AA88" stroke-width="3"/>`;
      const cols = ['#F2C9C4', '#B7C8B1', '#E9D7B8', '#C9D6DF', '#E3D8EE', '#D98F87'];
      [[110, 0], [144, 2], [178, 4]].forEach(([y, o]) => { let x = 17; for (let i = 0; i < 6 && x < 68; i++) { const w = 6 + ((i + o) % 3) * 2, h = 22 + ((i * 7 + o) % 6); s += `<rect x="${x}" y="${y + 26 - h}" width="${w}" height="${h}" rx="1" fill="${cols[(i + o) % 6]}"/>`; x += w + 1.5; } });
    }
    if (has('lamp')) s += `${night ? '<circle cx="314" cy="112" r="46" fill="#FFE9B0" opacity=".35"/>' : ''}<path d="M314 120 v84" stroke="#A88B6E" stroke-width="3"/><ellipse cx="314" cy="205" rx="14" ry="4" fill="#A88B6E"/><path d="M300 120 L328 120 L322 98 L306 98 Z" fill="#F2C9C4"/>`;
    if (has('plant')) s += `<path d="M266 66" /><ellipse cx="270" cy="174" rx="8" ry="15" fill="#9DB894" transform="rotate(-25 270 174)"/><ellipse cx="284" cy="170" rx="8" ry="16" fill="#86A57E" transform="rotate(15 284 170)"/><ellipse cx="277" cy="164" rx="6" ry="14" fill="#A9C2A0"/><path d="M264 184 h28 l-4 22 h-20 z" fill="#E2B98E"/>`;
    if (has('rug')) s += `<ellipse cx="180" cy="234" rx="108" ry="17" fill="#F2C9C4"/><ellipse cx="180" cy="234" rx="92" ry="12" fill="none" stroke="#FFFDF8" stroke-width="2" stroke-dasharray="6 5"/>`;
    if (has('cushion')) s += `<ellipse cx="180" cy="229" rx="58" ry="12" fill="#B7C8B1"/><ellipse cx="180" cy="226" rx="50" ry="8" fill="#C9D7C4"/>`;
    s += `<g transform="translate(80 44)">${petSVG({ species: p.species, xp: p.xp, wear: p.wear, m }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`;
    if (night) s += `<rect width="360" height="260" fill="#3F3A5C" opacity=".10"/>`;
    return `<svg class="room-svg" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="펫의 방">${s}</svg>`;
  }

  /* ---------------- 메시지 ---------------- */
  function message() {
    const p = pet(); const m = mood(); const st = stageOf(p.xp).key;
    if (!p.species) return '어떤 알을 품어 볼까요?';
    if (st === 'egg') return '따뜻하게 품는 중… 오늘 한 편을 다 읽으면 알이 깨어나요!';
    const pick = arr => arr[new Date().getDate() % arr.length];
    if (m === 'happy') return pick(['오늘 책 진짜 맛있었어! 🍪', '냠냠, 오늘도 한 편 완독했다!', '배불러… 내일도 같이 읽자!', '오늘 배운 단어 기억나? 나는 다 기억나!']);
    if (m === 'waiting') return pick(['오늘은 어떤 책 읽을 거야? 📖', '한 편만 읽어 주면 밥 먹을 수 있어!', '책장 앞에서 기다리고 있을게!']);
    return 'Zzz… 책… 읽어 줘…';
  }
  const fullName = p => `${STAGES.find(s => s.key === stageOf(p.xp).key).ko} ${SPECIES[p.species] ? SPECIES[p.species].ko : ''}`.trim();

  /* ---------------- 보상 ---------------- */
  function grant(xp, coins, lines, opts = {}) {
    const p = pet();
    const before = stageOf(p.xp).key;
    p.xp += xp; p.coins += coins; Store.save();
    const after = stageOf(p.xp).key;
    const evolved = before !== after && p.species;
    if (opts.big || evolved) popup({ xp, coins, lines, evolved, before, after });
    else toast(`${lines.join(' · ')} · +${coins} 🪙`);
  }
  function onComplete(story) {
    const p = pet(); const today = dayKey(); let xp = 0, c = 0; const lines = [];
    const prevBest = streakInfo().best;
    if (!p.fedDays[today]) { p.fedDays[today] = 1; xp += 25; c += 10; lines.push('🍪 오늘의 큰 밥 +25 XP'); }
    if (!p.ledger.done[story.id]) {
      p.ledger.done[story.id] = 1; const [x, cc] = COMPLETE_XP[story.level];
      xp += x; c += cc; lines.push(`📖 새 책 완독 (${story.level}) +${x} XP`);
    }
    const nowBest = streakInfo().best;
    WEARABLES.filter(w => w.streak && prevBest < w.streak && nowBest >= w.streak)
      .forEach(w => lines.push(`${w.emoji} ${w.streak}일 연속! '${w.ko}' 해금`));
    if (xp) grant(xp, c, lines, { big: true });
  }
  function onWord(key, on) {
    const p = pet(); if (!on || p.ledger.words[key]) return;
    p.ledger.words[key] = 1; grant(3, 1, ['🌱 단어 간식 +3 XP']);
  }
  function onQuiz(story, correct, total) {
    const p = pet(); if (p.ledger.quiz[story.id]) return;
    p.ledger.quiz[story.id] = 1;
    if (correct === total) grant(25, 10, ['⭐ 독해 만점 보너스 +25 XP'], { big: true });
    else grant(5, 2, [`✏️ 독해 완료 (${correct}/${total}) +5 XP`]);
  }

  function popup({ xp, coins, lines, evolved, after }) {
    const p = pet();
    const el = document.createElement('div');
    el.className = 'reward-pop';
    const title = !p.species ? '경험치를 모았어요!' : evolved
      ? (after === 'baby' ? `알이 깨어났어요! 🐣` : `진화했어요! ✨`)
      : '냠냠, 잘 먹었어요!';
    const sub = !p.species ? '알을 골라 주면 모은 경험치가 그대로 이어져요.'
      : evolved ? `${esc(p.name)}가 이제 <b>${fullName(p)}</b>가 되었어요.` : `${esc(p.name)}의 기분이 최고예요.`;
    el.innerHTML = `<div class="reward-card" role="dialog" aria-label="보상">
        <div class="reward-pet ${evolved ? 'evolve' : ''}">${petSVG({ species: p.species, xp: p.xp, wear: p.wear, m: 'happy', crop: true })}</div>
        <h3>${title}</h3>
        <p class="sub">${sub}</p>
        <ul>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
        <div class="reward-total">+${xp} XP · +${coins} 🪙</div>
        <div class="reward-actions">
          <button class="btn ghost" data-close>좋아!</button>
          <a class="btn" href="#pet" data-close>${p.species ? '펫 보러 가기' : '알 고르러 가기'}</a>
        </div>
      </div>`;
    document.body.appendChild(el);
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 200); };
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-close]')) close(); });
  }

  /* ---------------- 홈 카드 ---------------- */
  function homeCard() {
    const p = pet(); const st = streakInfo();
    if (!p.species) return `
      <a class="pet-home" href="#pet">
        <div class="pet-home-art">${petSVG({ species: null, xp: 0, crop: true })}</div>
        <div class="pet-home-body">
          <div class="eyebrow">My Library Pet</div>
          <h3>알을 하나 골라 보세요 🥚</h3>
          <p>책을 다 읽을 때마다 밥을 먹고 자라는 서재 친구예요.</p>
        </div><span class="continue-cta">고르기 →</span></a>`;
    const nx = nextStage(p.xp); const cur = stageOf(p.xp);
    const pct = nx ? Math.round((p.xp - cur.xp) / (nx.xp - cur.xp) * 100) : 100;
    return `
      <a class="pet-home" href="#pet">
        <div class="pet-home-art">${petSVG({ species: p.species, xp: p.xp, wear: p.wear, m: mood(), crop: true })}</div>
        <div class="pet-home-body">
          <div class="eyebrow">${esc(p.name)} · ${fullName(p)}</div>
          <div class="bubble">${esc(message())}</div>
          <div class="pet-home-meta">
            <span class="today ${st.today ? 'on' : ''}">${st.today ? '✓ 오늘 한 편 완료' : '○ 오늘의 한 편'}</span>
            <span>🔥 ${st.cur}일 연속</span><span>🪙 ${p.coins}</span>
          </div>
          <div class="xpbar"><span style="width:${pct}%"></span></div>
        </div></a>`;
  }

  /* ---------------- 펫 페이지 ---------------- */
  let shopTab = 'room', editing = false;
  function renderPage(app) {
    const p = pet();
    if (!p.species) return renderChoose(app);
    const st = streakInfo(); const cur = stageOf(p.xp); const nx = nextStage(p.xp);
    const pct = nx ? Math.round((p.xp - cur.xp) / (nx.xp - cur.xp) * 100) : 100;
    // 최근 4주 달력
    const start = addDays(new Date(), -27);
    const cal = Array.from({ length: 28 }, (_, i) => { const d = addDays(start, i); const k = dayKey(d); return { k, on: !!p.fedDays[k], today: k === dayKey(), d: d.getDate() }; });

    app.innerHTML = `
      <div class="page"><div class="wrap pet-page">
        <section class="pet-top">
          <div class="pet-name-row">
            ${editing
              ? `<form id="nameForm" class="name-form"><input id="nameInput" maxlength="12" value="${esc(p.name)}" aria-label="펫 이름"><button class="btn" type="submit">저장</button></form>`
              : `<h1>${esc(p.name)}</h1><button class="tool-btn" id="editName">이름 바꾸기</button>`}
          </div>
          <div class="eyebrow">${fullName(p)} · ${SPECIES[p.species].en}</div>
        </section>

        <div class="room-card">
          ${roomSVG()}
          <div class="bubble big">${esc(message())}</div>
        </div>

        <div class="pet-stats">
          <div class="stat"><b>${p.xp}</b><span>경험치 XP</span></div>
          <div class="stat"><b>${p.coins}</b><span>코인 🪙</span></div>
          <div class="stat"><b>${st.cur}</b><span>연속 독서 🔥 (최고 ${st.best})</span></div>
          <div class="stat"><b>${st.today ? '✓' : '○'}</b><span>오늘의 한 편</span></div>
        </div>

        <div class="grow-card">
          <div class="grow-head"><span>${nx ? `다음 단계 <b>${nx.ko}</b>까지 ${nx.xp - p.xp} XP` : '최종 단계 달성! 멋진 학자가 되었어요 🎓'}</span><span>${pct}%</span></div>
          <div class="xpbar big"><span style="width:${pct}%"></span></div>
          <div class="stages">${STAGES.map(s => `<span class="${p.xp >= s.xp ? 'on' : ''} ${s.key === cur.key ? 'cur' : ''}">${s.ko}</span>`).join('<i></i>')}</div>
        </div>

        <div class="rec-section">
          <h2>Reading streak <small>최근 4주</small></h2>
          <div class="cal">${cal.map(c => `<span class="${c.on ? 'on' : ''} ${c.today ? 'today' : ''}" title="${c.k}">${c.on ? '🐾' : c.d}</span>`).join('')}</div>
        </div>

        <div class="rec-section">
          <h2>Shop & Wardrobe <small>코인으로 꾸미기</small></h2>
          <div class="filters">
            <button class="chip ${shopTab === 'room' ? 'on' : ''}" data-shop="room">방 꾸미기</button>
            <button class="chip ${shopTab === 'wear' ? 'on' : ''}" data-shop="wear">옷장</button>
          </div>
          <div class="shop-grid">
            ${shopTab === 'room' ? ROOM_ITEMS.map(it => {
              const owned = p.owned.includes(it.id), placed = p.placed.includes(it.id);
              return `<button class="item ${owned ? 'owned' : ''} ${placed ? 'placed' : ''}" data-room="${it.id}">
                <span class="emo">${it.emoji}</span><span class="nm">${it.ko}</span>
                <span class="pr">${owned ? (placed ? '✓ 놓여 있음' : '놓기') : `🪙 ${it.price}`}</span></button>`;
            }).join('') : WEARABLES.map(w => {
              const un = isUnlocked(w), on = p.wear[w.slot] === w.id;
              const label = un ? (on ? '✓ 착용 중' : '입기') : w.streak ? `🔒 ${w.streak}일 연속` : `🪙 ${w.price}`;
              return `<button class="item ${un ? 'owned' : ''} ${on ? 'placed' : ''} ${!un && w.streak ? 'locked' : ''}" data-wear="${w.id}">
                <span class="emo">${w.emoji}</span><span class="nm">${w.ko}</span><span class="pr">${label}</span></button>`;
            }).join('')}
          </div>
        </div>

        <div class="rec-section">
          <h2>How to feed <small>밥 주는 법</small></h2>
          <div class="note-card how">
            <div><b>🍪 큰 밥</b> 하루 첫 완독 <em>+25 XP · 10🪙</em></div>
            <div><b>📖 새 책</b> 처음 완독한 책 <em>Beginner 30 · Intermediate 45 · Advanced 60 XP</em></div>
            <div><b>🌱 간식</b> 단어 '외웠어요' <em>+3 XP · 1🪙</em></div>
            <div><b>⭐ 별</b> 독해 만점 <em>+25 XP · 10🪙</em></div>
            <div><b>🔥 연속</b> 3·7·14·30일 연속이면 옷장 아이템 해금</div>
          </div>
        </div>
      </div></div>`;

    const rerender = () => { const y = scrollY; renderPage(app); window.scrollTo(0, y); };
    const en = $('#editName'); en && en.addEventListener('click', () => { editing = true; rerender(); $('#nameInput').focus(); });
    const nf = $('#nameForm'); nf && nf.addEventListener('submit', e => {
      e.preventDefault(); const v = $('#nameInput').value.trim(); if (v) p.name = v; editing = false; Store.save(); rerender();
    });
    $$('[data-shop]').forEach(b => b.addEventListener('click', () => { shopTab = b.dataset.shop; rerender(); }));
    $$('[data-room]').forEach(b => b.addEventListener('click', () => {
      const it = ROOM_ITEMS.find(x => x.id === b.dataset.room);
      if (!p.owned.includes(it.id)) {
        if (p.coins < it.price) return toast(`코인이 ${it.price - p.coins}개 부족해요 — 한 편 더 읽어 볼까요?`);
        p.coins -= it.price; p.owned.push(it.id); p.placed.push(it.id); toast(`${it.emoji} ${it.ko}를 샀어요!`);
      } else {
        const i = p.placed.indexOf(it.id); i >= 0 ? p.placed.splice(i, 1) : p.placed.push(it.id);
      }
      Store.save(); rerender();
    }));
    $$('[data-wear]').forEach(b => b.addEventListener('click', () => {
      const w = WEARABLES.find(x => x.id === b.dataset.wear);
      if (!isUnlocked(w)) {
        if (w.streak) return toast(`${w.streak}일 연속으로 읽으면 열려요 (지금 최고 ${streakInfo().best}일)`);
        if (p.coins < w.price) return toast(`코인이 ${w.price - p.coins}개 부족해요`);
        p.coins -= w.price; p.owned.push(w.id); toast(`${w.emoji} ${w.ko}를 샀어요!`);
      }
      p.wear[w.slot] = p.wear[w.slot] === w.id ? null : w.id;
      Store.save(); rerender();
    }));
  }

  function renderChoose(app) {
    const p = pet();
    let pick = 'owl';
    app.innerHTML = `
      <div class="page"><div class="wrap pet-page">
        <section class="hero" style="padding-bottom:20px">
          <div class="eyebrow">My Library Pet</div>
          <h1 style="font-size:clamp(36px,6vw,56px)">Choose your egg</h1>
          <p>책을 다 읽을 때마다 밥을 먹고 자라는 서재 친구를 골라 주세요.${p.xp ? `<br><b>이미 모은 ${p.xp} XP</b>가 그대로 이어져요!` : ''}</p>
        </section>
        <div class="choose-grid">
          ${Object.entries(SPECIES).map(([k, s]) => `
            <button class="choose ${k === pick ? 'on' : ''}" data-sp="${k}">
              ${petSVG({ species: k, xp: 150, m: 'happy', crop: true })}
              <b>${s.ko}</b><span>${s.en}</span>
            </button>`).join('')}
        </div>
        <form class="name-form center" id="chooseForm">
          <input id="chooseName" maxlength="12" value="${SPECIES[pick].name}" aria-label="펫 이름">
          <button class="btn" type="submit">이 알로 할래요 🥚</button>
        </form>
        <p class="section-sub" style="text-align:center;margin-top:10px">이름은 나중에 바꿀 수 있어요.</p>
      </div></div>`;
    let touched = false;
    $('#chooseName').addEventListener('input', () => touched = true);
    $$('.choose').forEach(b => b.addEventListener('click', () => {
      pick = b.dataset.sp; $$('.choose').forEach(x => x.classList.toggle('on', x === b));
      if (!touched) $('#chooseName').value = SPECIES[pick].name;
    }));
    $('#chooseForm').addEventListener('submit', e => {
      e.preventDefault();
      p.species = pick; p.name = $('#chooseName').value.trim() || SPECIES[pick].name; Store.save();
      toast(stageOf(p.xp).key === 'egg' ? '알을 품었어요! 한 편 다 읽으면 깨어나요 🥚' : `${p.name}가 태어났어요! 🐣`);
      renderPage(app); window.scrollTo(0, 0);
    });
  }

  pet();
  return { homeCard, renderPage, onComplete, onWord, onQuiz, petSVG, pet };
};
