/* =========================================================
   My Little English Library — app
   ---------------------------------------------------------
   Store   : 독서 기록 (localStorage, 실패해도 동작)
   Speech  : Web Speech API 기반 문장별 음성
   Views   : home / cat-<id> / read-<storyId> / library
   ========================================================= */
(function () {
  'use strict';
  const L = window.LIBRARY;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const app = $('#app');

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = '') => `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true">${L.ICONS[id] || ''}</svg>`;
  const SPEAK_ICON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';
  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/></svg>';

  /* ======================= Store ======================= */
  const KEY = 'my-little-english-library-v1';
  const Store = {
    data: { stories: {}, favorites: [], words: {}, settings: { rate: 1, font: 20, showAllKo: false, voiceURI: '', auto: false } },
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const d = JSON.parse(raw);
          this.data = Object.assign(this.data, d);
          this.data.settings = Object.assign({ rate: 1, font: 20, showAllKo: false, voiceURI: '', auto: false }, d.settings || {});
        }
      } catch (e) { /* storage unavailable — run in memory */ }
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {} },
    rec(id) { return this.data.stories[id] || (this.data.stories[id] = { progress: 0, status: 'new', last: 0, quiz: {} }); },
    peek(id) { return this.data.stories[id] || { progress: 0, status: 'new', last: 0, quiz: {} }; },
    isFav(id) { return this.data.favorites.includes(id); },
    toggleFav(id) {
      const f = this.data.favorites; const i = f.indexOf(id);
      i >= 0 ? f.splice(i, 1) : f.push(id); this.save(); return i < 0;
    },
    wordKey: (sid, w) => sid + '::' + w,
    isLearned(sid, w) { return !!this.data.words[this.wordKey(sid, w)]; },
    toggleWord(sid, v) {
      const k = this.wordKey(sid, v.word);
      if (this.data.words[k]) delete this.data.words[k];
      else this.data.words[k] = { word: v.word, meaning: v.meaning, story: sid, t: Date.now() };
      this.save(); return !!this.data.words[k];
    },
    stats() {
      const recs = this.data.stories;
      const done = L.stories.filter(s => recs[s.id] && recs[s.id].status === 'done');
      const reading = L.stories.filter(s => recs[s.id] && recs[s.id].status === 'reading');
      return { done, reading, favs: this.data.favorites.map(L.story).filter(Boolean), words: Object.values(this.data.words) };
    }
  };
  Store.load();

  /* ======================= Toast ======================= */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ======================= Pet ======================= */
  const Pet = window.PetModule({ Store, toast, esc, L });

  /* ======================= Speech ======================= */
  const Speech = {
    ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    voices: [], voice: null, token: 0, keepAlive: null,
    init() {
      if (!this.ok) return;
      const load = () => {
        this.voices = speechSynthesis.getVoices().filter(v => /^en(-|_|$)/i.test(v.lang));
        this.voice = this.voices.find(v => v.voiceURI === Store.data.settings.voiceURI) || this.best();
        fillVoiceSelect();
      };
      load();
      speechSynthesis.onvoiceschanged = load;
      setTimeout(load, 600);
    },
    score(v) {
      let s = 0; const n = v.name;
      if (/natural|neural/i.test(n)) s += 10;          // Edge/Windows 자연 음성
      if (/premium|enhanced/i.test(n)) s += 8;         // Apple 고품질 음성
      if (/google/i.test(n)) s += 6;                    // Chrome 온라인 음성
      if (/samantha|ava|allison|susan|zoe|evan|nathan|aria|jenny|guy|libby|sonia|ryan|serena|daniel|karen|moira|tessa/i.test(n)) s += 4;
      if (/^en[-_]US/i.test(v.lang)) s += 2; else if (/^en[-_]GB/i.test(v.lang)) s += 1;
      if (/compact|espeak|fred|albert|bad news|bells|boing|bubbles|cellos|whisper|zarvox|trinoids|jester|organ|superstar|wobble|bahh/i.test(n)) s -= 20;
      return s;
    },
    best() { return this.voices.slice().sort((a, b) => this.score(b) - this.score(a))[0] || null; },
    speak(text, { onstart, onend } = {}) {
      if (!this.ok) { toast('이 브라우저는 음성 재생을 지원하지 않아요'); onend && onend(false); return; }
      const my = ++this.token;
      speechSynthesis.cancel();
      clearInterval(this.keepAlive);
      const u = new SpeechSynthesisUtterance(text.replace(/[“”]/g, '"'));
      u.lang = this.voice ? this.voice.lang : 'en-US';
      if (this.voice) u.voice = this.voice;
      u.rate = Store.data.settings.rate; u.pitch = 1;
      u.onstart = () => { if (my === this.token) onstart && onstart(); };
      const finish = ok => { if (my !== this.token) return; this.token++; clearInterval(this.keepAlive); onend && onend(ok); };
      u.onend = () => finish(true);
      u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled') return; finish(false); };
      // Chrome cancel 직후 speak 누락 방지
      setTimeout(() => {
        if (my !== this.token) return;
        speechSynthesis.speak(u);
        // Chrome 온라인 음성 15초 끊김 방지
        if (this.voice && !this.voice.localService) {
          this.keepAlive = setInterval(() => {
            if (!speechSynthesis.speaking) return clearInterval(this.keepAlive);
            speechSynthesis.pause(); speechSynthesis.resume();
          }, 9000);
        }
      }, 60);
    },
    stop() { this.token++; clearInterval(this.keepAlive); if (this.ok) speechSynthesis.cancel(); }
  };

  /* ======================= Covers ======================= */
  function wrapTitle(t, max = 15) {
    const words = t.split(' '); const lines = []; let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    return lines.slice(0, 4);
  }
  function coverSVG(story) {
    const c = L.category(story.category); const id = 'p-' + story.id;
    const ink = c.ink;
    const pats = {
      dots: `<circle cx="4" cy="4" r="1.1" fill="${ink}"/>`,
      stripes: `<path d="M0 8L8 0" stroke="${ink}" stroke-width="1"/>`,
      waves: `<path d="M0 5 Q2 2 4 5 T8 5" fill="none" stroke="${ink}" stroke-width=".8"/>`,
      grid: `<path d="M8 0H0V8" fill="none" stroke="${ink}" stroke-width=".6"/>`,
      stars: `<path d="M4 2.2l.5 1.3 1.3.5-1.3.5L4 5.8l-.5-1.3-1.3-.5 1.3-.5z" fill="${ink}"/>`
    };
    const lines = wrapTitle(story.title);
    const ty = 112 - (lines.length - 1) * 6;
    const lv = L.LEVELS[story.level].dots;
    return `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(story.title)} cover">
      <defs><pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse">${pats[story.pattern] || pats.dots}</pattern></defs>
      <rect width="120" height="160" fill="${c.color}"/>
      <rect width="120" height="160" fill="url(#${id})" opacity=".14"/>
      <rect x="0" y="0" width="7" height="160" fill="${ink}" opacity=".10"/>
      <rect x="14" y="12" width="94" height="136" rx="3" fill="#FFFDF8" opacity=".55"/>
      <rect x="14" y="12" width="94" height="136" rx="3" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width=".6"/>
      <g transform="translate(43 28) scale(.75)" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${L.ICONS[story.category]}</g>
      <line x1="48" y1="76" x2="74" y2="76" stroke="${ink}" stroke-opacity=".4" stroke-width=".6"/>
      ${lines.map((l, i) => `<text x="61" y="${ty - 18 + i * 12}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="10.5" fill="#3B332E">${esc(l)}</text>`).join('')}
      <g transform="translate(${61 - (lv - 1) * 4} 136)">${Array.from({ length: lv }, (_, i) => `<circle cx="${i * 8}" cy="0" r="1.8" fill="${ink}" opacity=".7"/>`).join('')}</g>
    </svg>`;
  }
  const levelBadge = lv => {
    const d = L.LEVELS[lv];
    return `<span class="level ${lv}"><i>${[1, 2, 3].map(n => `<b class="${n <= d.dots ? 'f' : ''}"></b>`).join('')}</i>${lv}</span>`;
  };

  /* ======================= Router ======================= */
  const routes = {
    home: renderHome,
    library: renderLibrary,
    pet: () => Pet.renderPage(app)
  };
  function route() {
    const h = decodeURIComponent(location.hash.slice(1)) || 'home';
    Reader.teardown();
    $$('.reward-pop').forEach(el => el.remove());
    document.body.classList.remove('reading');
    $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === (h === 'library' || h === 'pet' ? h : (h.startsWith('read-') ? '' : 'home'))));
    if (routes[h]) routes[h]();
    else if (h.startsWith('cat-') && L.category(h.slice(4))) renderCategory(h.slice(4));
    else if (h.startsWith('read-') && L.story(h.slice(5))) Reader.open(L.story(h.slice(5)));
    else renderHome();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', scrollY > 4), { passive: true });

  /* ======================= Home ======================= */
  function renderHome() {
    const st = Store.stats();
    const recent = L.stories.map(s => ({ s, r: Store.peek(s.id) })).filter(x => x.r.status === 'reading').sort((a, b) => b.r.last - a.r.last)[0];
    app.innerHTML = `
      <div class="page"><div class="wrap">
        <section class="hero">
          <div class="eyebrow">A cozy reading room</div>
          <h1>My Little<br>English Library</h1>
          <p class="welcome-en">Pull a book from the shelf, find a quiet corner, and read one sentence at a time.</p>
          <p>책장에서 마음에 드는 이야기를 꺼내 보세요. 문장을 누르면 해석과 원어민 음성이 함께 펼쳐져요.</p>
          <div class="hero-deco"><span></span><span></span><span></span></div>
        </section>

        ${Pet.homeCard()}

        <div class="stats">
          <div class="stat"><b>${L.stories.length}</b><span>도서관의 이야기</span></div>
          <div class="stat"><b>${st.done.length}</b><span>다 읽은 소설</span></div>
          <div class="stat"><b>${st.reading.length}</b><span>읽는 중</span></div>
          <div class="stat"><b>${st.words.length}</b><span>외운 단어</span></div>
        </div>

        ${recent ? `
        <a class="continue" href="#read-${recent.s.id}">
          <div class="mini-cover"><span class="cover">${coverSVG(recent.s)}</span></div>
          <div class="continue-body">
            <div class="eyebrow">Continue reading</div>
            <h3>${esc(recent.s.title)}</h3>
            <div class="progress"><span style="width:${recent.r.progress}%"></span></div>
          </div>
          <span class="continue-cta">이어 읽기 →</span>
        </a>` : ''}

        <div class="shelf-head">
          <div>
            <div class="eyebrow">The Bookshelves</div>
            <h2 class="section-title">Browse by shelf</h2>
            <p class="section-sub">열 개의 책장, 마음 가는 곳부터 천천히.</p>
          </div>
        </div>
        <div class="shelf">
          ${L.CATEGORIES.map((c, i) => {
            const n = L.byCategory(c.id).length;
            return `
            <a class="cat-book" href="#cat-${c.id}" style="--c:${c.color};--k:${c.ink}">
              <div class="spine">
                <span class="count">${n} ${n === 1 ? 'story' : 'stories'}</span>
                ${icon(c.id)}
                <div class="cname">${esc(c.name)}</div>
                <div class="cko">${c.ko}</div>
              </div>
              <div class="cdesc"><em>${esc(c.desc)}</em>${c.descKo}</div>
            </a>`;
          }).join('')}
        </div>
      </div></div>
      <footer class="foot">— a quiet place for words —</footer>`;
  }

  /* ======================= Category ======================= */
  let catFilter = 'All';
  function storyCard(s) {
    const r = Store.peek(s.id);
    const status = r.status === 'done' ? '<span class="status-tag done">✓ 완독</span>' : r.status === 'reading' ? `<span class="status-tag">읽는 중 ${r.progress}%</span>` : '';
    return `
      <article class="story-card">
        <a href="#read-${s.id}" aria-label="${esc(s.title)}"><span class="cover">${coverSVG(s)}</span></a>
        <div>
          <a href="#read-${s.id}"><h3>${esc(s.title)}</h3></a>
          <p class="en">${esc(s.introEn)}</p>
          <p class="ko">${esc(s.introKo)}</p>
          <div class="meta">${levelBadge(s.level)}<span>⏱ ${s.minutes} min</span><span class="dot"></span><span>${s.wordCount} words</span>${status ? '<span class="dot"></span>' + status : ''}</div>
          ${r.progress > 0 ? `<div class="progress"><span style="width:${r.progress}%"></span></div>` : ''}
        </div>
        <button class="fav-btn ${Store.isFav(s.id) ? 'on' : ''}" data-fav="${s.id}" aria-label="즐겨찾기">${HEART}</button>
      </article>`;
  }
  function bindFavs(root) {
    $$('[data-fav]', root).forEach(b => b.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const on = Store.toggleFav(b.dataset.fav); b.classList.toggle('on', on);
      toast(on ? '즐겨찾기에 담았어요 ♡' : '즐겨찾기에서 뺐어요');
    }));
  }
  function renderCategory(id) {
    const c = L.category(id);
    const all = L.byCategory(id);
    const draw = () => {
      const list = catFilter === 'All' ? all : all.filter(s => s.level === catFilter);
      $('#storyList').innerHTML = list.length ? list.map(storyCard).join('') :
        `<div class="empty"><div class="big">This shelf is waiting…</div>이 난이도의 이야기는 아직 없어요. 새 소설을 추가하면 여기에 꽂혀요.</div>`;
      bindFavs($('#storyList'));
      $$('.filters .chip').forEach(ch => ch.classList.toggle('on', ch.dataset.f === catFilter));
    };
    app.innerHTML = `
      <div class="page"><div class="wrap">
        <a class="back" href="#home">← 책장으로</a>
        <section class="cat-hero" style="--c:${c.color};--k:${c.ink}">
          ${icon(c.id, 'icon')}
          <div>
            <div class="eyebrow" style="color:${c.ink}">Shelf · ${c.ko}</div>
            <h1>${esc(c.name)}</h1>
            <p>${esc(c.desc)}</p>
            <p class="ko">${c.descKo}</p>
          </div>
        </section>
        <div class="filters">
          ${['All', 'Beginner', 'Intermediate', 'Advanced'].map(f => `<button class="chip" data-f="${f}">${f === 'All' ? '전체' : f}</button>`).join('')}
        </div>
        <div class="story-list" id="storyList"></div>
        ${all.length < 3 ? `<p class="section-sub" style="margin-top:22px;text-align:center">✦ 이 책장은 계속 채워질 예정이에요.</p>` : ''}
      </div></div>`;
    $$('.filters .chip').forEach(ch => ch.addEventListener('click', () => { catFilter = ch.dataset.f; draw(); }));
    draw();
  }

  /* ======================= Reader ======================= */
  const Reader = {
    story: null, idx: -1, playing: false, opened: new Set(), onScroll: null,

    open(story) {
      this.story = story; this.idx = -1; this.playing = false; this.opened = new Set();
      const r = Store.rec(story.id);
      if (r.status === 'new') r.status = 'reading';
      r.last = Date.now(); Store.save();
      document.body.classList.add('reading');
      document.documentElement.style.setProperty('--read-size', Store.data.settings.font + 'px');
      const c = L.category(story.category);
      const fav = Store.isFav(story.id);

      app.innerHTML = `
        <div class="read-progress" id="readProgress"></div>
        <div class="page reader">
          <div class="reader-tools">
            <a class="back" style="margin:0" href="#cat-${c.id}">← ${esc(c.name)}</a>
            <div class="right">
              <button class="tool-btn ${Store.data.settings.showAllKo ? 'on' : ''}" id="tKo" title="모든 해석 보기">가 해석</button>
              <button class="tool-btn" id="tFont" title="글자 크기">Aa</button>
              <button class="tool-btn fav ${fav ? 'on' : ''}" id="tFav" aria-label="즐겨찾기">${HEART}</button>
            </div>
          </div>

          <header class="story-head">
            <span class="cover">${coverSVG(story)}</span>
            <div class="eyebrow">${esc(c.name)}</div>
            <h1>${esc(story.title)}</h1>
            <div class="meta">${levelBadge(story.level)}<span>⏱ ${story.minutes} min</span><span class="dot"></span><span>${story.sentences.length} sentences</span></div>
            <div class="tip"><b>문장을 탭</b>하면 해석과 음성이 나오고, <b>다시 탭</b>하면 해석이 접혀요.</div>
          </header>

          <article class="story-text" id="storyText" lang="en">
            ${story.paragraphs.map(p => `<p>${p.map(s => `<span class="s" data-i="${s.i}" role="button" tabindex="0">${esc(s.en)}</span>`).join(' ')}</p>`).join('')}
          </article>

          <div class="finish" id="finish"></div>

          <section class="study" id="study"></section>
        </div>`;

      // sentence clicks
      $('#storyText').addEventListener('click', e => {
        const s = e.target.closest('.s'); if (s) this.toggle(+s.dataset.i);
      });
      $('#storyText').addEventListener('keydown', e => {
        const s = e.target.closest('.s');
        if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.toggle(+s.dataset.i); }
      });
      if (Store.data.settings.showAllKo) story.sentences.forEach(s => this.showKo(s.i));

      $('#tKo').addEventListener('click', () => this.setShowAll(!Store.data.settings.showAllKo));
      $('#tFont').addEventListener('click', openSheet);
      $('#tFav').addEventListener('click', e => {
        const on = Store.toggleFav(story.id); e.currentTarget.classList.toggle('on', on);
        toast(on ? '즐겨찾기에 담았어요 ♡' : '즐겨찾기에서 뺐어요');
      });

      this.renderFinish();
      Study.render(story);
      Player.show();
      Player.update();

      this.onScroll = () => this.trackScroll();
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.trackScroll();
    },

    teardown() {
      if (!this.story) return;
      Speech.stop(); this.playing = false;
      window.removeEventListener('scroll', this.onScroll);
      Player.hide();
      this.story = null;
    },

    sentEl(i) { return $(`.s[data-i="${i}"]`); },

    showKo(i) {
      const el = this.sentEl(i); if (!el || this.opened.has(i)) return;
      const ko = document.createElement('span');
      ko.className = 'ko-line'; ko.lang = 'ko'; ko.dataset.for = i;
      ko.textContent = this.story.sentences[i].ko;
      el.after(ko); el.classList.add('open'); this.opened.add(i);
    },
    hideKo(i) {
      const el = this.sentEl(i); if (!el) return;
      const ko = $(`.ko-line[data-for="${i}"]`); ko && ko.remove();
      el.classList.remove('open'); this.opened.delete(i);
    },
    setShowAll(on) {
      Store.data.settings.showAllKo = on; Store.save();
      $('#tKo') && $('#tKo').classList.toggle('on', on);
      $('#showAllKo').checked = on;
      this.story.sentences.forEach(s => on ? this.showKo(s.i) : this.hideKo(s.i));
    },

    toggle(i) {
      if (this.opened.has(i)) {
        this.hideKo(i);
        if (this.idx === i && this.playing) this.pause();
      } else {
        this.showKo(i);
        this.play(i);
      }
    },

    play(i) {
      const s = this.story && this.story.sentences[i]; if (!s) return;
      $$('.s.playing').forEach(el => el.classList.remove('playing'));
      this.idx = i; this.playing = true;
      const el = this.sentEl(i); el && el.classList.add('playing');
      if (Store.data.settings.auto && el) {
        const r = el.getBoundingClientRect();
        if (r.top < 90 || r.bottom > innerHeight - 120) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      Player.update();
      Speech.speak(s.en, {
        onend: ok => {
          el && el.classList.remove('playing');
          if (ok && Store.data.settings.auto && this.story && i + 1 < this.story.sentences.length) {
            this.play(i + 1);
          } else {
            this.playing = false; Player.update();
            if (ok && Store.data.settings.auto && this.story && i + 1 >= this.story.sentences.length) toast('끝까지 다 들었어요 ✦');
          }
        }
      });
    },
    pause() {
      Speech.stop(); this.playing = false;
      $$('.s.playing').forEach(el => el.classList.remove('playing'));
      Player.update();
    },

    trackScroll() {
      const text = $('#storyText'); if (!text) return;
      const top = text.getBoundingClientRect().top + scrollY;
      const h = text.offsetHeight;
      const seen = (scrollY + innerHeight * 0.8 - top) / h;
      const pct = Math.max(0, Math.min(100, Math.round(seen * 100)));
      $('#readProgress').style.width = pct + '%';
      const r = Store.rec(this.story.id);
      if (r.status !== 'done') {
        const capped = Math.min(95, pct);                 // 100%는 '다 읽었어요'로만
        if (capped > r.progress) { r.progress = capped; r.last = Date.now(); Store.save(); }
      }
    },

    renderFinish() {
      const r = Store.peek(this.story.id);
      const done = r.status === 'done';
      $('#finish').innerHTML = `
        <div class="fin">— The End —</div>
        <button class="btn ${done ? 'done' : ''}" id="markDone">${done ? '✓ 완독한 이야기예요' : '다 읽었어요'}</button>`;
      $('#markDone').addEventListener('click', () => {
        const rec = Store.rec(this.story.id);
        if (rec.status === 'done') { rec.status = 'reading'; rec.progress = 90; toast('읽는 중으로 되돌렸어요'); }
        else { rec.status = 'done'; rec.progress = 100; Store.save(); Pet.onComplete(this.story); }
        Store.save(); this.renderFinish();
      });
    }
  };

  /* ======================= Player ======================= */
  const Player = {
    el: $('#player'),
    show() { this.el.hidden = false; this.syncAuto(); $('#pRate').textContent = Store.data.settings.rate.toFixed(1) + '×'; },
    hide() { this.el.hidden = true; },
    syncAuto() { $('#pAuto').setAttribute('aria-pressed', String(!!Store.data.settings.auto)); },
    update() {
      const R = Reader; if (!R.story) return;
      const n = R.story.sentences.length;
      this.el.classList.toggle('is-playing', R.playing);
      $('#pPlay').setAttribute('aria-label', R.playing ? '일시정지' : '재생');
      $('#pLabel').textContent = R.idx < 0
        ? (Store.data.settings.auto ? '▶ 를 누르면 처음부터 이어서 읽어 줘요' : '문장을 눌러 들어 보세요')
        : `${R.idx + 1} / ${n} · ${R.story.sentences[R.idx].en}`;
      $('#pBar').style.width = (R.idx < 0 ? 0 : ((R.idx + 1) / n) * 100) + '%';
    }
  };
  $('#pPlay').addEventListener('click', () => {
    const R = Reader; if (!R.story) return;
    if (R.playing) return R.pause();
    if (R.idx < 0) { // 아무 문장도 선택 안 했으면 처음부터 이어 듣기
      Store.data.settings.auto = true; Store.save(); Player.syncAuto();
      return R.play(0);
    }
    R.play(R.idx);
  });
  $('#pPrev').addEventListener('click', () => { const R = Reader; if (R.story) R.play(Math.max(0, R.idx - 1)); });
  $('#pNext').addEventListener('click', () => { const R = Reader; if (R.story) R.play(Math.min(R.story.sentences.length - 1, R.idx + 1)); });
  $('#pAuto').addEventListener('click', () => {
    Store.data.settings.auto = !Store.data.settings.auto; Store.save(); Player.syncAuto(); Player.update();
    toast(Store.data.settings.auto ? '이어 듣기 켜짐 — 문장이 끝나면 다음 문장으로 넘어가요' : '이어 듣기 꺼짐 — 한 문장씩 들어요');
  });
  const RATES = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2];
  $('#pRate').addEventListener('click', () => {
    const cur = Store.data.settings.rate;
    const next = RATES[(RATES.findIndex(r => Math.abs(r - cur) < 0.01) + 1) % RATES.length] || 1;
    setRate(next);
  });
  $('#pSettings').addEventListener('click', openSheet);

  document.addEventListener('keydown', e => {
    if (!Reader.story || e.target.closest('input, select, textarea, button, .s')) return;
    if (e.code === 'Space') { e.preventDefault(); $('#pPlay').click(); }
    if (e.key === 'ArrowRight' && e.altKey) $('#pNext').click();
    if (e.key === 'ArrowLeft' && e.altKey) $('#pPrev').click();
  });

  /* ======================= Settings sheet ======================= */
  function openSheet() { $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false; }
  function closeSheet() { $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true; }
  $('#sheetClose').addEventListener('click', closeSheet);
  $('#sheetBackdrop').addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  function setRate(v) {
    Store.data.settings.rate = Math.round(v * 100) / 100; Store.save();
    $('#pRate').textContent = Store.data.settings.rate.toFixed(1) + '×';
    $('#rateVal').textContent = Store.data.settings.rate.toFixed(2).replace(/0$/, '') + '×';
    $('#rateRange').value = Store.data.settings.rate;
  }
  $('#rateRange').addEventListener('input', e => setRate(+e.target.value));
  $('#fontRange').addEventListener('input', e => {
    Store.data.settings.font = +e.target.value; Store.save();
    $('#fontVal').textContent = e.target.value + 'px';
    document.documentElement.style.setProperty('--read-size', e.target.value + 'px');
  });
  $('#showAllKo').addEventListener('change', e => { if (Reader.story) Reader.setShowAll(e.target.checked); else { Store.data.settings.showAllKo = e.target.checked; Store.save(); } });
  $('#voiceSelect').addEventListener('change', e => {
    Speech.voice = Speech.voices.find(v => v.voiceURI === e.target.value) || Speech.best();
    Store.data.settings.voiceURI = e.target.value; Store.save();
  });
  $('#testVoice').addEventListener('click', () => Speech.speak('Welcome to my little English library. Let\'s read a story together.'));

  function fillVoiceSelect() {
    const sel = $('#voiceSelect');
    if (!Speech.ok) { sel.innerHTML = '<option>음성 미지원 브라우저</option>'; sel.disabled = true; return; }
    if (!Speech.voices.length) { sel.innerHTML = '<option>영어 음성을 찾는 중…</option>'; return; }
    const sorted = Speech.voices.slice().sort((a, b) => Speech.score(b) - Speech.score(a));
    sel.innerHTML = sorted.map((v, i) => `<option value="${esc(v.voiceURI)}">${i === 0 ? '★ ' : ''}${esc(v.name)} (${v.lang})</option>`).join('');
    if (Speech.voice) sel.value = Speech.voice.voiceURI;
    const top = sorted[0];
    $('#voiceHint').textContent = Speech.score(top) >= 6
      ? '★ 표시가 이 기기에서 가장 자연스러운 음성이에요.'
      : '더 자연스러운 음성을 원하면 Chrome·Edge 브라우저나, 기기 설정에서 고품질(Enhanced/Premium) 영어 음성을 내려받아 보세요.';
  }
  // init settings UI
  setRate(Store.data.settings.rate);
  $('#fontRange').value = Store.data.settings.font; $('#fontVal').textContent = Store.data.settings.font + 'px';
  $('#showAllKo').checked = Store.data.settings.showAllKo;

  /* ======================= Study notes ======================= */
  const Study = {
    tab: 'vocab',
    render(story) {
      this.story = story;
      const tabs = [
        ['vocab', 'Vocabulary', story.vocab.length],
        ['expr', 'Expressions', story.expressions.length],
        ['gram', 'Grammar Point', story.grammar.length],
        ['ana', 'Sentence Analysis', story.analysis.length],
        ['quiz', 'Reading Comprehension', story.quiz.length]
      ];
      $('#study').innerHTML = `
        <div class="study-head">
          <div class="eyebrow">Study Notes</div>
          <h2 class="section-title">이야기로 공부하기</h2>
        </div>
        <div class="tabs" role="tablist">${tabs.map(([k, l, n]) => `<button class="tab" role="tab" data-tab="${k}">${l} <span class="n">${n}</span></button>`).join('')}</div>
        <div id="studyBody"></div>`;
      $$('#study .tab').forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.tab; this.draw(); }));
      this.draw();
    },
    draw() {
      $$('#study .tab').forEach(b => b.classList.toggle('on', b.dataset.tab === this.tab));
      const body = $('#studyBody'); const s = this.story;
      const fn = { vocab: this.vocab, expr: this.expr, gram: this.gram, ana: this.ana, quiz: this.quiz }[this.tab];
      body.innerHTML = fn.call(this, s);
      this.bind(body);
    },
    vocab(s) {
      const learned = s.vocab.filter(v => Store.isLearned(s.id, v.word)).length;
      return `<div class="vocab-summary"><span>외운 단어 <b>${learned}</b> / ${s.vocab.length}</span><span style="color:var(--ink-3);font-size:12px">'외웠어요'를 누르면 기록에 저장돼요</span></div>
        <div class="card-list">${s.vocab.map((v, i) => {
          const on = Store.isLearned(s.id, v.word);
          return `<div class="note-card ${on ? 'learned' : ''}"><div class="vocab-row">
            <div class="word">${esc(v.word)} <button class="speak-mini" data-say="${esc(v.word.replace(/\(.*?\)/g, ''))}" aria-label="발음 듣기">${SPEAK_ICON}</button></div>
            <div class="mean"><span class="pos">${esc(v.pos)}</span> ${esc(v.meaning)}</div>
            <button class="learn-btn ${on ? 'on' : ''}" data-learn="${i}">${on ? '✓ 외웠어요' : '외웠어요'}</button>
            <div class="ex">${esc(v.ex)}</div>
          </div></div>`;
        }).join('')}</div>`;
    },
    expr(s) {
      return `<div class="card-list">${s.expressions.map(e => `
        <div class="note-card expr">
          <div class="phrase">${esc(e.phrase)} <button class="speak-mini" data-say="${esc(e.ex)}" aria-label="예문 듣기">${SPEAK_ICON}</button></div>
          <div class="mean">${esc(e.meaning)}</div>
          <div class="ex">${esc(e.ex)}</div>
        </div>`).join('')}</div>`;
    },
    gram(s) {
      return `<div class="card-list">${s.grammar.map(g => `
        <div class="note-card gram"><h4>${esc(g.title)}</h4><p>${esc(g.body)}</p><div class="ex">${esc(g.ex)}</div></div>`).join('')}</div>`;
    },
    ana(s) {
      return `<div class="card-list">${s.analysis.map(a => `
        <div class="note-card ana">
          <p class="sent">${esc(a.sentence)} <button class="speak-mini" data-say="${esc(a.sentence)}" aria-label="문장 듣기">${SPEAK_ICON}</button></p>
          <div class="parts">${a.parts.map(([t, r]) => `<div class="part"><span class="t">${esc(t)}</span><span class="r">${esc(r)}</span></div>`).join('')}</div>
          <p class="note">${esc(a.note)}</p>
          <div class="ko">${esc(a.ko)}</div>
        </div>`).join('')}</div>`;
    },
    quiz(s) {
      const ans = Store.peek(s.id).quiz || {};
      const answered = Object.keys(ans).length;
      const correct = s.quiz.filter((q, i) => ans[i] === q.answer).length;
      const nums = ['①', '②', '③', '④', '⑤'];
      return `<div class="card-list">
        ${s.quiz.map((q, qi) => {
          const picked = ans[qi];
          const done = picked !== undefined;
          return `<div class="quiz-q">
            <div class="qtype">Q${qi + 1} · ${L.QUIZ_TYPES[q.type] || ''}</div>
            <p class="qtext">${esc(q.q)}</p>
            ${q.given ? `<div class="given">${esc(q.given)}</div>` : ''}
            ${q.passage ? `<div class="passage">${esc(q.passage)}</div>` : ''}
            <div class="opts">${q.options.map((o, oi) => {
              let cls = '';
              if (done && oi === q.answer) cls = 'correct';
              else if (done && oi === picked) cls = 'wrong';
              return `<button class="opt ${cls}" data-q="${qi}" data-o="${oi}" ${done ? 'disabled' : ''}><span class="num">${oi + 1}</span><span>${esc(o)}</span></button>`;
            }).join('')}</div>
            ${done ? `<div class="explain"><b>${picked === q.answer ? '정답이에요! ' : `정답은 ${nums[q.answer]}번이에요. `}</b>${esc(q.explain)}</div>` : ''}
          </div>`;
        }).join('')}
        ${answered === s.quiz.length ? `<div class="quiz-score"><div><div style="font-size:12px;opacity:.7">Your score</div><div class="sc">${correct} / ${s.quiz.length}</div></div><button id="quizReset">다시 풀기</button></div>` : ''}
      </div>`;
    },
    bind(body) {
      const s = this.story;
      $$('[data-say]', body).forEach(b => b.addEventListener('click', () => {
        Reader.pause(); Speech.speak(b.dataset.say);
      }));
      $$('[data-learn]', body).forEach(b => b.addEventListener('click', () => {
        const v = s.vocab[+b.dataset.learn];
        const on = Store.toggleWord(s.id, v);
        if (on) Pet.onWord(Store.wordKey(s.id, v.word), on); else toast('기록에서 뺐어요');
        this.draw();
      }));
      $$('.opt', body).forEach(b => b.addEventListener('click', () => {
        const r = Store.rec(s.id); r.quiz = r.quiz || {};
        r.quiz[+b.dataset.q] = +b.dataset.o; Store.save();
        const y = scrollY; this.draw(); window.scrollTo(0, y);
        if (Object.keys(r.quiz).length === s.quiz.length) {
          Pet.onQuiz(s, s.quiz.filter((q, i) => r.quiz[i] === q.answer).length, s.quiz.length);
        }
      }));
      const reset = $('#quizReset', body);
      reset && reset.addEventListener('click', () => { Store.rec(s.id).quiz = {}; Store.save(); this.draw(); });
    }
  };

  /* ======================= My Records ======================= */
  function recItem(s, sub) {
    return `<a class="rec-item" href="#read-${s.id}">
      <div class="mini-cover"><span class="cover">${coverSVG(s)}</span></div>
      <div class="rec-body"><h4>${esc(s.title)}</h4>
        <div class="meta" style="margin-top:4px">${levelBadge(s.level)}${sub ? `<span>${sub}</span>` : ''}</div>
        ${Store.peek(s.id).progress ? `<div class="progress"><span style="width:${Store.peek(s.id).progress}%"></span></div>` : ''}
      </div></a>`;
  }
  function renderLibrary() {
    const st = Store.stats();
    const totalProgress = Math.round(L.stories.reduce((a, s) => a + Store.peek(s.id).progress, 0) / L.stories.length);
    const levelRows = Object.keys(L.LEVELS).map(lv => {
      const all = L.stories.filter(s => s.level === lv).length;
      const d = st.done.filter(s => s.level === lv).length;
      const color = { Beginner: '#9DB894', Intermediate: '#E2B98E', Advanced: '#D98F87' }[lv];
      return `<div class="lb"><span>${lv} <small style="color:var(--ink-3)">${L.LEVELS[lv].ko}</small></span><div class="bar"><span style="width:${all ? d / all * 100 : 0}%;background:${color}"></span></div><span class="v">${d}/${all}</span></div>`;
    }).join('');
    const quizzes = L.stories.map(s => ({ s, q: Store.peek(s.id).quiz || {} })).filter(x => Object.keys(x.q).length === x.s.quiz.length);
    const quizAcc = quizzes.length ? Math.round(quizzes.reduce((a, x) => a + x.s.quiz.filter((q, i) => x.q[i] === q.answer).length / x.s.quiz.length, 0) / quizzes.length * 100) : null;
    const words = st.words.slice().sort((a, b) => b.t - a.t);

    app.innerHTML = `
      <div class="page"><div class="wrap">
        <section class="hero" style="padding-bottom:28px">
          <div class="eyebrow">Reading Journal</div>
          <h1 style="font-size:clamp(38px,6vw,60px)">My Records</h1>
          <p>지금까지의 독서 발자국이에요.</p>
        </section>

        <div class="stats">
          <div class="stat"><b>${st.done.length}</b><span>다 읽은 소설</span></div>
          <div class="stat"><b>${st.reading.length}</b><span>읽는 중</span></div>
          <div class="stat"><b>${st.favs.length}</b><span>즐겨찾기</span></div>
          <div class="stat"><b>${st.words.length}</b><span>외운 단어</span></div>
        </div>

        <div class="rec-section" style="margin-top:0">
          <h2>Overall progress <small>전체 진행률 ${totalProgress}%${quizAcc !== null ? ` · 독해 정답률 ${quizAcc}%` : ''}</small></h2>
          <div class="level-bars">${levelRows}</div>
        </div>

        <div class="rec-section">
          <h2>Currently reading <small>읽는 중</small></h2>
          ${st.reading.length ? `<div class="rec-grid">${st.reading.sort((a, b) => Store.peek(b.id).last - Store.peek(a.id).last).map(s => recItem(s, Store.peek(s.id).progress + '%')).join('')}</div>`
            : `<div class="empty"><div class="big">Nothing open yet</div>책장에서 첫 이야기를 골라 보세요. <a href="#home" style="text-decoration:underline">책장 가기</a></div>`}
        </div>

        <div class="rec-section">
          <h2>Finished <small>다 읽은 소설</small></h2>
          ${st.done.length ? `<div class="rec-grid">${st.done.map(s => {
            const q = Store.peek(s.id).quiz || {}; const n = Object.keys(q).length;
            return recItem(s, n === s.quiz.length ? `독해 ${s.quiz.filter((x, i) => q[i] === x.answer).length}/${s.quiz.length}` : '✓ 완독');
          }).join('')}</div>` : `<div class="empty"><div class="big">The End is waiting</div>이야기 끝의 '다 읽었어요'를 누르면 여기에 기록돼요.</div>`}
        </div>

        <div class="rec-section">
          <h2>Favorites <small>즐겨찾기</small></h2>
          ${st.favs.length ? `<div class="rec-grid">${st.favs.map(s => recItem(s, '♡')).join('')}</div>` : `<div class="empty"><div class="big">No favorites yet</div>마음에 드는 이야기의 ♡를 눌러 보세요.</div>`}
        </div>

        <div class="rec-section">
          <h2>Words I learned <small>${words.length}개</small></h2>
          ${words.length ? `<div class="word-cloud">${words.map(w => `<span class="word-pill">${esc(w.word)} <small>${esc(w.meaning)}</small></span>`).join('')}</div>`
            : `<div class="empty"><div class="big">An empty notebook</div>학습 노트의 Vocabulary에서 '외웠어요'를 누르면 모여요.</div>`}
        </div>
      </div></div>
      <footer class="foot">— every page counts —</footer>`;
  }

  /* ======================= Boot ======================= */
  Speech.init();
  route();
})();
