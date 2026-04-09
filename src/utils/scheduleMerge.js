const pad = (n) => String(n).padStart(2, '0');

export function formatYMDLocal(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatHMLocal(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Локальная дата+время из YYYY-MM-DD и HH:mm (или HH:mm:ss) */
export function buildLocalDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr || !timeStr.includes(':')) return null;
  const safeTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const [hours, minutes] = safeTime.split(':').map(Number);
  const [y, m, d] = dateStr.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const dt = new Date(y, m - 1, d, hours, minutes, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function scheduleFromEvent(ev) {
  const start = new Date(ev.start_time);
  const end = new Date(ev.end_time);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { event_id: ev.id, date: null, start_time: null, end_time: null };
  }
  return {
    event_id: ev.id,
    date: formatYMDLocal(start),
    start_time: formatHMLocal(start),
    end_time: formatHMLocal(end),
  };
}

function pickLatestEvent(events, taskId) {
  const list = (events || []).filter((e) => String(e.task_id) === String(taskId));
  if (list.length === 0) return null;
  return list.sort(
    (a, b) =>
      new Date(b.updated_at || b.created_at || 0) -
      new Date(a.updated_at || a.created_at || 0),
  )[0];
}

/** Сшивает задачи с последним событием по task_id (расписание в events). */
export function mergeTasksWithEvents(tasks, events) {
  return (tasks || []).map((task) => {
    const ev = pickLatestEvent(events, task.id);
    if (!ev) {
      return {
        ...task,
        event_id: null,
        date: null,
        start_time: null,
        end_time: null,
      };
    }
    return { ...task, ...scheduleFromEvent(ev) };
  });
}
