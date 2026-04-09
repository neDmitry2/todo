const parseTaskDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;

  const safeTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const parsedDate = new Date(`${dateValue}T${safeTime}`);

  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate;
};

export const mapTasksToCalendarEvents = (tasks = []) =>
  tasks
    .filter((task) => task.date && task.start_time && task.end_time)
    .map((task) => {
      const start = parseTaskDateTime(task.date, task.start_time);
      const end = parseTaskDateTime(task.date, task.end_time);

      if (!start || !end || end <= start) {
        return null;
      }

      return {
        id: task.id,
        title: task.title || 'Без названия',
        start,
        end,
        resource: task,
      };
    })
    .filter(Boolean);
