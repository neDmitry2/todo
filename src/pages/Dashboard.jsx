import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  if (isLoading) return <div className="p-4">Загрузка...</div>;
  if (isError) return <div className="p-4">Не удалось загрузить данные</div>;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-2">Ваш день</h1>
      <p className="text-sm text-gray-600 mb-5">Сегодня: {todayKey}</p>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Расписание на сегодня</h2>
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="text-sm text-blue-600"
          >
            Открыть календарь
          </button>
        </div>

        {todaySchedule.length === 0 ? (
          <p className="text-sm text-gray-500">На сегодня запланированных событий нет.</p>
        ) : (
          <div className="space-y-2">
            {todaySchedule.map((event) => (
              <div
                key={event.id}
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              >
                <p className="font-medium text-gray-800">{event.title}</p>
                <p className="text-gray-600">
                  {event.resource.start_time} - {event.resource.end_time}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Задачи</h2>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="text-sm text-blue-600"
          >
            Ко всем задачам
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <p className="text-sm text-gray-500">Нет задач без времени и задач на сегодня.</p>
        ) : (
          <div>
            {dayTasks.map((task) => (
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
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;