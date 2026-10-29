// 首页：顶部导航随滚动高亮当前版块（Publications / Learning design）
(function () {
  const links = [...document.querySelectorAll('[data-go]')];
  const sections = links.map(a => document.getElementById(a.dataset.go)).filter(Boolean);
  if (!sections.length) return;

  function update() {
    const y = scrollY + innerHeight * 0.35;
    let current = null;
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    links.forEach(a => a.classList.toggle('on', a.dataset.go === current));
  }
  addEventListener('scroll', update, { passive: true });
  update();
})();

// 深浅色切换：点击后记住选择；没选过就继续跟随系统
(function () {
  const root = document.documentElement;
  const btn = document.querySelector('.theme-toggle');
  const stored = () => { try { return localStorage.getItem('theme'); } catch (e) { return null; } };

  if (btn) btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!stored()) root.dataset.theme = e.matches ? 'dark' : 'light';
  });
})();

// 首屏 "AI literacy education" 打字效果（系统开启减少动态效果时直接显示全文）
(function () {
  const el = document.querySelector('.typed');
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 隐形的完整文字撑住宽度（不依赖字体加载时机），打出来的文字叠在同一位置
  const text = el.textContent;
  el.textContent = '';
  const ghost = document.createElement('span');
  const live = document.createElement('span');
  const out = document.createElement('span');
  const caret = document.createElement('span');
  ghost.className = 'ghost';
  ghost.textContent = text;
  caret.className = 'caret';
  live.append(out, caret);
  el.append(ghost, live);

  let i = 0;
  (function type() {
    out.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(type, 45 + Math.random() * 50);
    else setTimeout(() => caret.classList.add('gone'), 2600);
  })();
})();

// 首页 Learning Design：Coming soon 的 module 默认折叠
(function () {
  document.querySelectorAll('.mod-more').forEach(btn => btn.addEventListener('click', () => {
    const list = btn.closest('.modules');
    const folded = list.classList.toggle('folded');
    btn.textContent = folded ? btn.dataset.more : btn.dataset.less;
  }));
})();

// 首页 In the news：头条 slider（手机滑动 / 箭头 / 圆点；6 秒自动轮播，悬停暂停，减少动画时不轮播）
(function () {
  const slider = document.querySelector('.slider');
  if (!slider) return;
  const track = slider.querySelector('.slides');
  const slides = [...track.children];
  const dots = [...slider.querySelectorAll('.dots button')];
  let i = 0, timer;

  const mark = () => dots.forEach((d, k) => d.classList.toggle('on', k === i));
  const go = n => { i = (n + slides.length) % slides.length; track.style.transform = `translateX(${-100 * i}%)`; mark(); };
  // 手机上左右滑动切换
  let x0 = null;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  slider.querySelector('.prev').addEventListener('click', () => go(i - 1));
  slider.querySelector('.next').addEventListener('click', () => go(i + 1));
  dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
  mark();

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stop = () => clearInterval(timer);
  const start = () => { stop(); timer = setInterval(() => go(i + 1), 6000); };
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  start();
})();

// Publications 页：按项目 / 一作筛选，支持 ?project=activeai
(function () {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  if (!buttons.length) return;

  function apply(key) {
    buttons.forEach(b => b.classList.toggle('on', b.dataset.filter === key));
    let total = 0;
    document.querySelectorAll('.year-block').forEach(block => {
      let n = 0;
      block.querySelectorAll('.pub-row').forEach(card => {
        const role = card.dataset.role;
        const match = key === 'all' ||
          (key === 'first' ? role === '1st' || role === 'co-1st' : card.dataset.project === key);
        card.hidden = !match;
        if (match) n++;
      });
      block.hidden = n === 0;
      block.querySelector('.count').textContent = n;
      total += n;
    });
    document.querySelector('.no-results').hidden = total > 0;
  }

  buttons.forEach(b => b.addEventListener('click', () => {
    const url = new URL(location);
    if (b.dataset.filter === 'all') url.searchParams.delete('project');
    else url.searchParams.set('project', b.dataset.filter);
    history.replaceState(null, '', url);
    apply(b.dataset.filter);
  }));

  const initial = new URLSearchParams(location.search).get('project');
  apply(buttons.some(b => b.dataset.filter === initial) ? initial : 'all');
})();

// Under construction 蒙版：点 "Take a peek" 后本次会话内隐藏
document.querySelector('.uc-peek')?.addEventListener('click', () => {
  document.documentElement.classList.add('uc-off');
  try { sessionStorage.setItem('uc-peek', '1'); } catch (e) {}
});

// 首页标题行的文字 tab：Publications（Selected / All）、In the news（Slide view / List view）各自切换
document.querySelectorAll('.pub-tabs').forEach(group => {
  const tabs = [...group.querySelectorAll('[data-tab]')];
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(b => {
      const on = b === t;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
  }));
});

// 首页 Learning Design 的 Card view：点后面卡片的标题，把它翻到最前，其余卡片依次后移；左边介绍换成这张卡的
(function () {
  const cards = [...document.querySelectorAll('.deck-card')];
  const intros = [...document.querySelectorAll('.deck-intro')];
  cards.forEach(card => card.querySelector('.deck-head').addEventListener('click', () => {
    const from = +card.dataset.pos;
    if (!from) return;
    cards.forEach(c => {
      const p = +c.dataset.pos;
      c.dataset.pos = p === from ? 0 : p < from ? p + 1 : p;
    });
    intros.forEach(i => { i.hidden = i.dataset.card !== card.dataset.card; });
  }));
})();

// 首页 Contact：按来意 + 项目 + 名字生成邮件；用户手动改过主题或正文后不再自动覆盖（可点 Reset 恢复）
(function () {
  const data = document.getElementById('contact-data');
  if (!data) return;
  const { email, categories } = JSON.parse(data.textContent);
  const $ = id => document.getElementById(id);
  const subject = $('ct-subject'), body = $('ct-body'), send = $('ct-send'), copy = $('ct-copy'), reset = $('ct-reset');
  const catBtns = [...document.querySelectorAll('[data-pick="category"] button')];
  const projBtns = [...document.querySelectorAll('[data-pick="projects"] button')];
  let edited = false;

  const list = a => a.length < 2 ? a.join('') : a.length === 2 ? a.join(' and ') : a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1];
  function fill(t) {
    const name = $('ct-name').value.trim() || '[Your name]';
    const org = $('ct-org').value.trim();
    const projects = list(projBtns.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.key)) || 'AI literacy education';
    return t.replace(/\{name\}/g, name).replace(/\{from\}/g, org ? ' from ' + org : '').replace(/\{projects\}/g, projects);
  }
  function updateLink() {
    send.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject.value) + '&body=' + encodeURIComponent(body.value);
  }
  function render() {
    if (!edited) {
      const c = categories.find(c => c.key === catBtns.find(b => b.getAttribute('aria-pressed') === 'true').dataset.key);
      subject.value = fill(c.subject);
      body.value = fill(c.body).trim();
    }
    reset.hidden = !edited;
    updateLink();
  }

  catBtns.forEach(b => b.addEventListener('click', () => {
    catBtns.forEach(x => x.setAttribute('aria-pressed', x === b));
    edited = false; render();
  }));
  projBtns.forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); render();
  }));
  ['ct-name', 'ct-org'].forEach(id => $(id).addEventListener('input', render));
  [subject, body].forEach(el => el.addEventListener('input', () => { edited = true; reset.hidden = false; updateLink(); }));
  reset.addEventListener('click', () => { edited = false; render(); });
  copy.addEventListener('click', async () => {
    const text = 'To: ' + email + '\nSubject: ' + subject.value + '\n\n' + body.value;
    try { await navigator.clipboard.writeText(text); copy.textContent = 'Copied'; }
    catch (e) { copy.textContent = 'Copy failed'; }
    setTimeout(() => { copy.textContent = 'Copy email'; }, 1800);
  });
  render();
})();
