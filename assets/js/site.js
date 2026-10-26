// 首页：Researcher / Practitioner / Life 切换（同步 URL hash 和顶部导航）
(function () {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const links = [...document.querySelectorAll('[data-go]')];
  if (!tabs.length) return;

  const keys = tabs.map(b => b.dataset.tab);
  function show(key, scroll) {
    tabs.forEach(b => b.classList.toggle('on', b.dataset.tab === key));
    links.forEach(a => a.classList.toggle('on', a.dataset.go === key));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === 'p-' + key));
    if (scroll) document.querySelector('.seg').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function select(key, scroll) {
    history.replaceState(null, '', '#' + key);
    show(key, scroll);
  }

  tabs.forEach(b => b.addEventListener('click', () => select(b.dataset.tab)));
  links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); select(a.dataset.go, true); }));

  const fromHash = () => {
    const key = location.hash.slice(1);
    show(keys.includes(key) ? key : 'research');
  };
  fromHash();
  addEventListener('hashchange', fromHash);
})();

// 首页 News：默认只显示前几条
(function () {
  const btn = document.querySelector('.news .more-btn');
  if (btn) btn.addEventListener('click', () => btn.closest('.news').classList.add('open'));
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
      block.querySelectorAll('.card').forEach(card => {
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
    document.querySelector('.empty').hidden = total > 0;
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
