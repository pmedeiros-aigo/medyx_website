/* Medyx — formulário de contato.
 *
 * O site é estático (S3), portanto não há backend próprio para receber o POST.
 * Há dois modos, nesta ordem de precedência:
 *
 *   1. FORM_ENDPOINT preenchido  → envia POST JSON para o endpoint
 *                                  (API Gateway + Lambda + SES, Formspree, etc.).
 *   2. FORM_ENDPOINT vazio       → abre o cliente de e-mail do visitante com a
 *                                  mensagem já preenchida para CONTACT_EMAIL.
 *
 * >>> AJUSTAR ANTES DE PUBLICAR: confirmar CONTACT_EMAIL e, se houver backend,
 *     preencher FORM_ENDPOINT.
 */
(function () {
  'use strict';

  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'contato@medyx.com.br';

  var form = document.getElementById('contato-form');
  var formView = document.getElementById('form-view');
  var sentView = document.getElementById('sent-view');
  var errorBox = document.getElementById('form-error');
  var submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function showSent() {
    formView.hidden = true;
    sentView.hidden = false;
    sentView.setAttribute('tabindex', '-1');
    sentView.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function values() {
    var d = new FormData(form);
    return {
      nome: (d.get('nome') || '').trim(),
      cargo: (d.get('cargo') || '').trim(),
      cooperativa: (d.get('cooperativa') || '').trim(),
      email: (d.get('email') || '').trim(),
      mensagem: (d.get('mensagem') || '').trim()
    };
  }

  function mailtoHref(v) {
    var linhas = [
      'Nome: ' + v.nome,
      'Cargo: ' + (v.cargo || '—'),
      'Cooperativa: ' + (v.cooperativa || '—'),
      'E-mail: ' + v.email,
      '',
      v.mensagem
    ].join('\n');
    return 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Contato pelo site — ' + (v.cooperativa || v.nome)) +
      '&body=' + encodeURIComponent(linhas);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var v = values();

    if (!FORM_ENDPOINT) {
      window.location.href = mailtoHref(v);
      showSent();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(v)
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        showSent();
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensagem';
        showError('Não foi possível enviar a mensagem agora. Tente novamente ou escreva para ' + CONTACT_EMAIL + '.');
      });
  });
})();
