(function (root) {
  'use strict';
  const ranks = [
    'Soldado E-1', 'Soldado E-2', 'Soldado de primera', 'Soldado de primera',
    'Especialista/Cabo', 'Especialista/Cabo', 'Sargento', 'Sargento', 'Sargento',
    'Sargento de primera clase', 'Sargento de primera clase', 'Sargento de primera clase',
    'Sargento Mayor', 'Sargento Mayor', 'Máximo suboficial del Army',
    'Oficial técnico', 'Oficial técnico', 'Máximo grado de warrant officer',
    'Máximo grado de warrant officer', 'Máximo grado de warrant officer',
    'Segundo teniente', 'Segundo teniente', 'Segundo teniente', 'Primer teniente',
    'Capitán', 'Mayor', 'Teniente Coronel', 'Coronel', 'Mayor General', 'Teniente General', 'General'
  ];
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const parseDate = key => new Date(`${key}T12:00:00`);
  const validDate = key => typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(+parseDate(key)) && dateKey(parseDate(key)) === key;
  const previousDay = key => { const date = parseDate(key); date.setDate(date.getDate() - 1); return dateKey(date); };
  const empty = () => ({ version: 1, goal: '', started: null, records: {}, failureMode: 'reset' });
  function validate(raw) {
    if (!raw || raw.version !== 1 || typeof raw.goal !== 'string' || raw.goal.length > 120 || !raw.records || Array.isArray(raw.records) || typeof raw.records !== 'object' || (raw.started !== null && !validDate(raw.started))) throw new Error('Datos de progreso no válidos.');
    if (Object.keys(raw.records).some(key => !validDate(key) || !['success', 'failed'].includes(raw.records[key]) || !raw.started || key < raw.started)) throw new Error('Registros no válidos.');
    return { ...empty(), ...raw, failureMode: 'reset' };
  }
  function summary(state, today = dateKey()) {
    const entries = Object.entries(state.records).filter(([key]) => key <= today).sort(([a], [b]) => a.localeCompare(b));
    const total = entries.filter(([, result]) => result === 'success').length;
    let cursor = state.records[today] ? today : previousDay(today);
    let streak = 0;
    while (state.records[cursor] === 'success') { streak++; cursor = previousDay(cursor); }
    const level = Math.min(31, state.failureMode === 'reset' ? streak : total);
    const rank = level ? ranks[level - 1] : null;
    const nextIndex = ranks.findIndex((name, index) => index >= level && name !== rank);
    return { total, streak, level, rank, remaining: 31 - level, nextRank: nextIndex < 0 ? null : ranks[nextIndex], nextDistance: nextIndex < 0 ? 0 : nextIndex + 1 - level };
  }
  function record(state, date, result, today = dateKey()) {
    if (!state.goal.trim() || !state.started) throw new Error('Primero define tu objetivo.');
    if (!validDate(date) || date < state.started || date > today) throw new Error('Elige una fecha desde el inicio de tu misión hasta hoy.');
    if (!['success', 'failed', 'pending'].includes(result)) throw new Error('Selecciona un resultado válido.');
    const next = { ...state, records: { ...state.records } };
    if (result === 'pending') delete next.records[date]; else next.records[date] = result;
    return next;
  }
  const api = { ranks, dateKey, parseDate, validDate, previousDay, empty, validate, summary, record };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Progress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
