import { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';

const pad = (value) => String(value).padStart(2, '0');

const formatYMD = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseTimeToMinutes = (value) => {
  if (!value || !value.includes(':')) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const formatTotalHours = (minutes) => {
  const hours = minutes / 60;
  const rounded = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${rounded} ч`;
};

const Statistics = () => {
  const { tasks, isLoading, isError } = useTasks();
  const today = new Date();
  const todayKey = formatYMD(today);

  const dayTitle = useMemo(
    () =>
      new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
      }).format(today),
    [todayKey],
  );

  const completedTodayTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (!task.is_completed || !task.completed_at) return false;
        const completedDate = new Date(task.completed_at);
        if (Number.isNaN(completedDate.getTime())) return false;
        return formatYMD(completedDate) === todayKey;
      }),
    [tasks, todayKey],
  );

  const totalMinutes = useMemo(
    () =>
      completedTodayTasks.reduce((sum, task) => {
        const start = parseTimeToMinutes(task.start_time);
        const end = parseTimeToMinutes(task.end_time);
        if (start === null || end === null || end <= start) return sum;
        return sum + (end - start);
      }, 0),
    [completedTodayTasks],
  );

  if (isLoading) return <div className="p-4 text-black">Загрузка...</div>;
  if (isError) return <div className="p-4 text-black">Не удалось загрузить статистику</div>;

  return (
    <div className="p-4 pb-32 space-y-4">
      <h1 className="text-2xl font-bold text-black">Статистика</h1>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">Сегодня</p>
        <p className="mt-1 text-xl font-semibold text-black">{dayTitle}</p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
        <p className="text-sm text-gray-600">Выполнено задач за сегодня</p>
        <p className="mt-2 text-5xl font-bold leading-none text-black">{completedTodayTasks.length}</p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Сделано</h2>
        {completedTodayTasks.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Сегодня пока нет завершенных задач.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {completedTodayTasks.map((task) => (
              <li key={task.id} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Statistics;