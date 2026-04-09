import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';
import { useTasks } from '../hooks/useTasks';
import { mapTasksToCalendarEvents } from '../utils/calendarAdapter';
import TaskEditSheet from '../components/TaskEditSheet';

const formatEventTimeRange = (start, end) =>
  `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`;

const calendarEventPropGetter = (event) => {
  if (!event.resource?.is_completed) return {};
  return {
    style: {
      opacity: 0.48,
      backgroundColor: 'rgba(49, 116, 173, 0.38)',
      borderColor: 'rgba(38, 89, 133, 0.45)',
    },
  };
};

const CalendarEventContent = ({ event }) => {
  const done = event.resource?.is_completed;
  return (
    <div className="rbc-custom-event flex flex-col gap-0.5 leading-tight">
      <span className={`truncate font-medium ${done ? 'line-through' : ''}`}>{event.title}</span>
      <span
        className={`truncate text-[11px] leading-tight ${done ? 'opacity-75' : 'opacity-90'}`}
      >
        {formatEventTimeRange(event.start, event.end)}
      </span>
    </div>
  );
};

const locales = {
  ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ru }),
  getDay,
  locales,
});

const availableViews = [Views.DAY, Views.WEEK, Views.MONTH];

/** Высота экрана минус нижняя панель (pb-20 в App). Без скролла страницы. */
const calendarPageLayoutClass =
  'flex h-[calc(100svh-5rem)] flex-col overflow-hidden px-4 pt-4';

const CalendarView = () => {
  const {
    tasks,
    isLoading,
    isError,
    updateTask,
    deleteTask,
    isUpdating,
    isDeleting,
  } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [editingTask, setEditingTask] = useState(null);

  const events = useMemo(() => mapTasksToCalendarEvents(tasks), [tasks]);

  if (isLoading) {
    return (
      <div className={calendarPageLayoutClass}>
        <div className="flex flex-1 items-center justify-center text-black/60">
          Загрузка календаря…
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={calendarPageLayoutClass}>
        <div className="flex flex-1 items-center justify-center text-red-600">
          Не удалось загрузить задачи для календаря
        </div>
      </div>
    );
  }

  return (
    <div className={calendarPageLayoutClass}>
      <h1 className="mb-2 shrink-0 text-2xl font-bold">Календарь</h1>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="calendar-view-rbc min-h-0 flex-1">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            view={currentView}
            onView={setCurrentView}
            views={availableViews}
            popup
            culture="ru"
            eventPropGetter={calendarEventPropGetter}
            onSelectEvent={(event) => setEditingTask(event.resource)}
            components={{ event: CalendarEventContent }}
            messages={{
              allDay: 'Весь день',
              previous: 'Назад',
              next: 'Вперёд',
              today: 'Сегодня',
              month: 'Месяц',
              week: 'Неделя',
              day: 'День',
              agenda: 'Список',
              date: 'Дата',
              time: 'Время',
              event: 'Событие',
              noEventsInRange: 'Событий в этом диапазоне нет',
              showMore: (total) => `+ ещё ${total}`,
            }}
          />
        </div>
      </div>

      <TaskEditSheet
        task={editingTask}
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        updateTask={updateTask}
        deleteTask={deleteTask}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CalendarView;