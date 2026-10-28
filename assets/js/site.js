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

// 首页 Publications：Selected / All 两个 tab 切换
(function () {
  const tabs = [...document.querySelectorAll('.pub-tabs [data-tab]')];
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(b => {
      const on = b === t;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
  }));
})();
