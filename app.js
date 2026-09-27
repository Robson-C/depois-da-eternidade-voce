(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const key = 'novel-reader-v1';
  let settings = {};
  try { settings = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) settings = {};
  const save = () => { try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} };
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const setTheme = theme => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  };
  setTheme(['dark','light'].includes(settings.theme) ? settings.theme : systemDark ? 'dark' : 'light');
  document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
    settings.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(settings.theme); save();
  }));
  let fontSize = Math.min(28, Math.max(16, Number(settings.fontSize) || 20));
  const updateFont = () => {
    document.documentElement.style.setProperty('--reader-size', `${fontSize}px`);
    document.querySelectorAll('.font-size').forEach(label => { label.textContent = `${fontSize}`; });
    document.querySelectorAll('[data-font]').forEach(button => {
      button.disabled = button.dataset.font === 'decrease' ? fontSize <= 16 : fontSize >= 28;
    });
  };
  updateFont();
  document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => {
    fontSize += button.dataset.font === 'increase' ? 2 : -2;
    settings.fontSize = fontSize; updateFont(); save();
  }));
  const continueLink = document.querySelector('[data-continue]');
  const chapter = Number(document.body.dataset.chapter);
  const chapterCount = Number(document.body.dataset.chapterCount);
  const last = settings.reading;
  if (continueLink && last && Number.isInteger(last.chapter) && last.chapter >= 1 && last.chapter <= chapterCount) {
    continueLink.hidden = false;
    continueLink.href = `capitulo-${last.chapter}.html#${/^p-\d+$/.test(last.paragraph) ? last.paragraph : 'inicio'}`;
    continueLink.textContent = `Continuar capítulo ${last.chapter} →`;
  }
  if (chapter) {
    const blocks = Array.from(document.querySelectorAll('.prose [id]'));
    let queued = false;
    const trackReading = () => {
      queued = false;
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      const fraction = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 1;
      const progress = document.querySelector('.progress-fill');
      if (progress) progress.style.width = `${fraction * 100}%`;
      let paragraph = blocks[0]?.id || 'inicio';
      for (const block of blocks) {
        if (block.getBoundingClientRect().top <= 145) paragraph = block.id;
        else break;
      }
      settings.reading = { chapter, paragraph };
      save();
    };
    addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(trackReading); }
    }, { passive: true });
    addEventListener('resize', trackReading);
    addEventListener('pagehide', trackReading);
    requestAnimationFrame(trackReading);
  }
})();
