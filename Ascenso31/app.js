(() => {
  'use strict';
  const P = window.Progress;
  const KEY = 'ascenso31.progress.v1';
  const $ = id => document.getElementById(id);
  let state = P.empty(), allHistory = false, timer, currentDate = P.dateKey(), storageBlocked = false;
  function warning(message) { $('storage-warning').textContent = message; $('storage-warning').hidden = false; }
  try { const saved = localStorage.getItem(KEY); if (saved) state = P.validate(JSON.parse(saved)); }
  catch { storageBlocked = true; warning('No se pudo leer el progreso guardado. No se sobrescribirá. Revisa el almacenamiento del navegador o usa «Reiniciar misión» para comenzar de nuevo.'); }
  function persist(next) {
    if (storageBlocked) { toast('Primero revisa el aviso sobre el progreso guardado.'); return false; }
    try { localStorage.setItem(KEY, JSON.stringify(next)); state = next; $('storage-warning').hidden = true; return true; }
    catch { warning('El navegador no permitió guardar. El cambio no se aplicó. Habilita el almacenamiento local y vuelve a intentarlo.'); return false; }
  }
  function toast(message) { clearTimeout(timer); $('toast').textContent = message; $('toast').classList.add('visible'); timer = setTimeout(() => $('toast').classList.remove('visible'), 4500); }
  function formatDate(key, options = { day: 'numeric', month: 'long' }) { return new Intl.DateTimeFormat('es', options).format(P.parseDate(key)); }
  function showDialog(id) { if (!$(id).open) $(id).showModal(); }
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } }));
  function render() {
    const today = P.dateKey(); currentDate = today;
    const s = P.summary(state, today), result = state.records[today], hasGoal = Boolean(state.goal);
    $('today-label').textContent = formatDate(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('rank-name').textContent = s.rank || 'Tu ascenso empieza hoy';
    $('rank-level').textContent = `DÍA ${String(s.level).padStart(2, '0')} / 31`;
    $('rank-category').textContent = !s.level ? 'EN PREPARACIÓN' : s.level < 16 ? 'TROPA Y SUBOFICIALES' : s.level < 21 ? 'OFICIAL TÉCNICO' : 'OFICIALES';
    $('rank-symbol').textContent = s.level >= 29 ? '★★' : s.level >= 21 ? '★' : s.level >= 7 ? '❯' : '★';
    $('rank-message').textContent = s.level === 31 ? 'Misión conquistada. Sigue cuidando tu constancia.' : s.level ? 'Te lo ganaste. Un día a la vez.' : 'La primera victoria es presentarte.';
    $('overall-progress').value = s.level; $('progress-percent').textContent = `${Math.round(s.level / 31 * 100)}%`;
    $('next-rank').textContent = s.nextRank || '¡Rango máximo alcanzado!'; $('next-distance').textContent = s.nextDistance ? `${s.nextDistance} ${s.nextDistance === 1 ? 'día' : 'días'}` : '★';
    $('completed-count').textContent = s.total; $('streak-count').textContent = s.streak; $('remaining-count').textContent = s.remaining;
    $('mission-title').textContent = state.goal || '¿Cuál es tu misión?';
    $('mission-description').textContent = hasGoal ? `En marcha desde el ${formatDate(state.started, { day: 'numeric', month: 'long', year: 'numeric' })}. Este es tu compromiso contigo.` : 'Define un objetivo concreto y vuelve al final del día para registrar tu resultado.';
    $('setup-button').hidden = hasGoal; $('daily-actions').hidden = !hasGoal || Boolean(result); $('correct-today').hidden = !result;
    $('daily-status').textContent = result === 'success' ? 'MISIÓN CUMPLIDA' : result === 'failed' ? 'DÍA REGISTRADO' : 'POR COMPLETAR';
    $('daily-status').className = `tag status-${result || 'pending'}`;
    $('daily-heading').textContent = result === 'success' ? 'Hoy cumpliste contigo.' : result === 'failed' ? 'Mañana tienes otra oportunidad.' : '¿Cumpliste tu objetivo hoy?';
    $('daily-help').textContent = result === 'success' ? 'Tu progreso está guardado. Vuelve mañana por otro paso.' : result === 'failed' ? (state.failureMode === 'reset' ? 'Tu racha vuelve a cero. Puedes volver a empezar mañana.' : 'Tu rango se conserva. Un mal día no borra lo que lograste.') : 'Cada día cumplido te acerca al siguiente nivel.';
    $('register-date').disabled = !hasGoal;
    $('rule-text').textContent = state.failureMode === 'reset' ? 'Un día cumplido = un nivel. Un día fallido o sin cumplir interrumpe la racha y reinicia el rango.' : 'Un día cumplido = un nivel. Si no cumples, conservas tu rango y la racha vuelve a cero.';
    renderLevels(s); renderHistory();
  }
  function renderLevels(s) {
    $('level-grid').replaceChildren();
    P.ranks.forEach((rank, index) => {
      const day = index + 1, done = day <= s.level, next = day === s.level + 1;
      const button = document.createElement('button'); button.type = 'button';
      button.className = `level-tile${done ? ' completed' : ''}${next ? ' next' : ''}${day === 31 && !done && !next ? ' final-level' : ''}${day === s.level ? ' current' : ''}`;
      button.setAttribute('aria-label', `Día ${day}: ${rank}. ${done ? 'Conquistado' : next ? 'Siguiente nivel' : 'Por alcanzar'}`);
      if (day === s.level) button.setAttribute('aria-current', 'step');
      const top = document.createElement('span'); top.className = 'tile-top'; top.textContent = `DÍA ${done ? '✓' : next ? '↗' : '·'}`;
      const number = document.createElement('span'); number.className = 'tile-number'; number.textContent = String(day).padStart(2, '0');
      const name = document.createElement('span'); name.className = 'tile-name'; name.textContent = rank;
      button.append(top, number, name);
      button.addEventListener('click', () => { $('detail-level').textContent = `DÍA ${day} DE 31`; $('detail-rank').textContent = rank; $('detail-status').textContent = done ? 'Nivel conquistado. Tu esfuerzo ya forma parte de esta ruta.' : `Lo alcanzarás con ${day - s.level} ${day - s.level === 1 ? 'día cumplido más' : 'días cumplidos más'}.`; showDialog('level-dialog'); });
      $('level-grid').append(button);
    });
  }
  function renderHistory() {
    const list = $('history-list'); list.replaceChildren();
    const entries = Object.entries(state.records).filter(([date]) => date <= P.dateKey()).sort(([a], [b]) => b.localeCompare(a));
    $('show-history').hidden = entries.length <= 7; $('show-history').textContent = allHistory ? 'Ver solo los últimos 7 registros' : `Ver los ${entries.length} registros`;
    if (!entries.length) { const empty = document.createElement('p'); empty.className = 'history-empty'; const strong = document.createElement('strong'); strong.textContent = 'Tu historia empieza con el primer día.'; empty.append(strong, 'Aquí aparecerán tus misiones cumplidas y tus nuevos intentos.'); list.append(empty); return; }
    (allHistory ? entries : entries.slice(0, 7)).forEach(([date, result]) => {
      const row = document.createElement('div'); row.className = 'history-row';
      const dateLabel = document.createElement('span'); dateLabel.textContent = date === P.dateKey() ? `Hoy · ${formatDate(date)}` : formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
      const status = document.createElement('span'); status.className = `history-result ${result}`; status.textContent = result === 'success' ? '✓ Misión cumplida' : '↻ Hoy no se logró';
      const edit = document.createElement('button'); edit.className = 'text-button'; edit.textContent = 'Corregir'; edit.setAttribute('aria-label', `Corregir el ${formatDate(date)}`); edit.addEventListener('click', () => openRecord(date));
      row.append(dateLabel, status, edit); list.append(row);
    });
  }
  function openGoal() { $('goal-input').value = state.goal; showDialog('goal-dialog'); }
  $('setup-button').addEventListener('click', openGoal); $('edit-goal').addEventListener('click', openGoal);
  $('goal-input').addEventListener('input', () => $('goal-input').setCustomValidity(''));
  $('goal-form').addEventListener('submit', event => {
    event.preventDefault(); const goal = $('goal-input').value.trim();
    if (!goal) { $('goal-input').setCustomValidity('Escribe un objetivo para tu misión.'); $('goal-input').reportValidity(); return; }
    if (persist({ ...state, goal, started: state.started || P.dateKey() })) { $('goal-dialog').close(); render(); toast('Misión guardada. Hoy comienza tu siguiente paso.'); }
  });
  function celebrate(before, after, demo = false) {
    $('celebration-eyebrow').textContent = demo ? 'VISTA PREVIA · TU PROGRESO NO CAMBIA' : after.level === 31 ? 'OPERACIÓN COMPLETADA' : 'MISIÓN CUMPLIDA';
    $('celebration-day').textContent = `DÍA ${String(after.level).padStart(2, '0')} / 31`;
    $('celebration-title').textContent = after.level === 31 ? '¡Llegaste a General!' : before.rank !== after.rank ? '¡Nuevo rango!' : '¡Nivel superado!';
    $('celebration-rank').textContent = after.rank;
    $('celebration-copy').textContent = after.level === 31 ? '31 días cumplidos. Una prueba de lo que puedes lograr.' : before.rank !== after.rank ? 'Tu constancia acaba de subir de nivel.' : 'Un día más conquistado. Tu próximo ascenso está más cerca.';
    $('confetti').replaceChildren();
    for (let i = 0; i < 45; i++) { const piece = document.createElement('i'); piece.className = 'confetti-piece'; piece.style.left = `${Math.random() * 100}%`; piece.style.background = ['#c7f65b', '#ffae71', '#b8a4fb', '#f7f8f5'][i % 4]; piece.style.animationDelay = `${Math.random() * .9}s`; piece.style.animationDuration = `${2 + Math.random() * 1.5}s`; $('confetti').append(piece); }
    showDialog('celebration');
  }
  function saveRecord(date, result) {
    const before = P.summary(state);
    try {
      const next = P.record(state, date, result);
      if (!persist(next)) return false;
      const after = P.summary(state); $('record-dialog').close(); render();
      if (after.level > before.level) celebrate(before, after);
      else toast(result === 'success' ? 'Misión cumplida. Progreso guardado.' : result === 'failed' ? 'Registro guardado. Mañana puedes volver a intentarlo.' : 'Registro eliminado. Progreso actualizado.');
      return true;
    } catch (error) { toast(error.message); return false; }
  }
  function recordToday(result) { const today = P.dateKey(); if (state.records[today]) { toast('Hoy ya está registrado. Usa «Corregir» para cambiarlo.'); return; } saveRecord(today, result); }
  $('success-button').addEventListener('click', () => recordToday('success'));
  $('fail-button').addEventListener('click', () => recordToday('failed'));
  function openRecord(date = P.dateKey()) { if (!state.goal) { openGoal(); return; } $('record-date').min = state.started; $('record-date').max = P.dateKey(); $('record-date').value = date; $('record-result').value = state.records[date] || 'success'; showDialog('record-dialog'); }
  $('correct-today').addEventListener('click', () => openRecord()); $('register-date').addEventListener('click', () => openRecord());
  $('record-date').addEventListener('change', () => { $('record-result').value = state.records[$('record-date').value] || 'success'; });
  $('record-form').addEventListener('submit', event => { event.preventDefault(); saveRecord($('record-date').value, $('record-result').value); });
  $('show-history').addEventListener('click', () => { allHistory = !allHistory; renderHistory(); });
  $('preview-animation').addEventListener('click', () => { const s = P.summary(state); const level = Math.min(31, s.level + 1); celebrate(s, { ...s, level, rank: P.ranks[level - 1] }, true); });
  $('reset-button').addEventListener('click', () => showDialog('reset-dialog'));
  $('confirm-reset').addEventListener('click', () => {
    try { localStorage.removeItem(KEY); state = P.empty(); storageBlocked = false; allHistory = false; $('storage-warning').hidden = true; $('reset-dialog').close(); render(); toast('Misión reiniciada. Es momento de un nuevo comienzo.'); }
    catch { warning('No se pudo borrar el progreso. Revisa los permisos de almacenamiento del navegador.'); }
  });
  window.addEventListener('storage', event => { if (event.key !== KEY && event.key !== null) return; try { state = event.newValue ? P.validate(JSON.parse(event.newValue)) : P.empty(); storageBlocked = false; $('storage-warning').hidden = true; render(); } catch { storageBlocked = true; warning('Otra pestaña guardó datos no válidos. Revisa el almacenamiento antes de continuar.'); } });
  const checkDay = () => { if (P.dateKey() !== currentDate) render(); };
  setInterval(checkDay, 30000); document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); }); window.addEventListener('focus', checkDay);
  render();
  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    try { Promise.resolve(document.modelContext.registerTool({ name: 'read_mission_progress', title: 'Leer progreso de la misión', description: 'Consulta el objetivo, rango y racha visibles, sin cambiar datos.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: true }, execute(input) { if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Se requiere un objeto vacío.'); return { goal: state.goal, ...P.summary(state), today: state.records[P.dateKey()] || 'pending' }; } }, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Optional browser feature. */ }
    window.addEventListener('pagehide', event => { if (!event.persisted) lifecycle.abort(); });
  }
})();
