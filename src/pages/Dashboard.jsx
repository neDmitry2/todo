import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, ListTodo } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import { useTasks } from '../hooks/useTasks';
import { mapTasksToCalendarEvents } from '../utils/calendarAdapter';

const pad = (value) => String(value).padStart(2, '0');

const formatDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseTimeToMinutes = (value) => {
  if (!value || !value.includes(':')) return Number.MAX_SAFE_INTEGER;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
};

const DASHBOARD_TASKS_LIMIT = 5;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tasks, isLoading, isError, updateTask } = useTasks();
  const todayKey = formatDateKey(new Date());

  const todaySchedule = useMemo(() => {
    return mapTasksToCalendarEvents(tasks)
      .filter((event) => formatDateKey(event.start) === todayKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [tasks, todayKey]);

  const dayTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.date || task.date === todayKey)
      .sort((a, b) => {
        const byDate = (a.date || todayKey).localeCompare(b.date || todayKey);
        if (byDate !== 0) return byDate;
        return parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time);
      });
  }, [tasks, todayKey]);

  const handleToggleTask = (id, isCompleted) => {
    updateTask({
      id,
      updates: {
        is_completed: isCompleted,
      },
    });
  };

  if (isLoading) return <div className="p-4 text-black">Загрузка...</div>;
  if (isError) return <div className="p-4 text-black">Не удалось загрузить данные</div>;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-2 text-black">Ваш день</h1>
      <p className="text-sm text-black mb-5">Сегодня: {todayKey}</p>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-black">Расписание на сегодня</h2>
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="rounded-xl border border-gray-200 bg-white p-2 text-black transition-colors hover:bg-gray-50 active:scale-95"
            aria-label="Открыть календарь"
            title="Открыть календарь"
          >
            <CalendarDays size={22} strokeWidth={2} />
          </button>
        </div>

        {todaySchedule.length === 0 ? (
          <p className="text-sm text-black">На сегодня запланированных событий нет.</p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map((event) => (
              <div
                key={event.id}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                <p className="font-medium text-black">{event.title}</p>
                <p className="text-black">
                  {event.resource.start_time} - {event.resource.end_time}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-black">Задачи</h2>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="rounded-xl border border-gray-200 bg-white p-2 text-black transition-colors hover:bg-gray-50 active:scale-95"
            aria-label="Ко всем задачам"
            title="Ко всем задачам"
          >
            <ListTodo size={22} strokeWidth={2} />
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <p className="text-sm text-black">Нет задач без времени и задач на сегодня.</p>
        ) : (
          <div>
            {dayTasks.slice(0, DASHBOARD_TASKS_LIMIT).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onSchedule={() =>
                  navigate(`/tasks/${task.id}/schedule`, {
                    state: { from: location.pathname },
                  })
                }
              />
            ))}
            {dayTasks.length > DASHBOARD_TASKS_LIMIT && (
              <p className="text-sm text-black mt-2 text-center">
                Показаны первые {DASHBOARD_TASKS_LIMIT} из {dayTasks.length} задач.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;