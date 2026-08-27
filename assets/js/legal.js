/* Medyx — alternância entre os documentos legais.
   Estado espelhado na URL (#termos / #privacidade) para que os links do rodapé
   abram direto no documento certo. */
(function () {
  'use strict';

  var DOCS = ['termos', 'privacidade'];
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.legal__tab'));
  if (!tabs.length) return;

  function select(doc, pushHash) {
    if (DOCS.indexOf(doc) === -1) doc = DOCS[0];
    tabs.forEach(function (tab) {
      var on = tab.dataset.doc === doc;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      var panel = document.getElementById('doc-' + tab.dataset.doc);
      if (panel) panel.hidden = !on;
    });
    if (pushHash && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + doc);
    }
    document.title = doc === 'privacidade'
      ? 'Medyx · Política de privacidade'
      : 'Medyx · Termos de uso';
  }

  function fromHash() {
    var h = (window.location.hash || '').replace('#', '');
    if (h === 'dpo') return 'privacidade';
    return h;
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      select(tab.dataset.doc, true);
    });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' &&
          e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      select(next.dataset.doc, true);
      next.focus();
    });
  });

  // Âncora dentro de um painel que estava oculto: o navegador não consegue rolar
  // até ela sozinho, e o scroll-behavior:smooth do CSS atrapalha o reposicionamento
  // durante o carregamento — daí o salto direto, sem animação.
  function scrollToAnchor(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - 24;
    try {
      window.scrollTo({ top: top, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, top);
    }
  }

  function syncFromHash() {
    var raw = (window.location.hash || '').replace('#', '');
    select(fromHash(), false);
    if (raw && DOCS.indexOf(raw) === -1) {
      scrollToAnchor(raw);
      // repete após fontes/layout assentarem, senão a posição sai errada
      window.addEventListener('load', function once() {
        window.removeEventListener('load', once);
        scrollToAnchor(raw);
      });
    }
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
