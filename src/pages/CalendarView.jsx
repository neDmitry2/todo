import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTasks } from '../hooks/useTasks';
import { mapTasksToCalendarEvents } from '../utils/calendarAdapter';

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

const viewLabels = {
  [Views.DAY]: 'День',
  [Views.WEEK]: 'Неделя',
  [Views.MONTH]: 'Месяц',
};

const availableViews = [Views.DAY, Views.WEEK, Views.MONTH];

const CalendarView = () => {
  const { tasks, isLoading, isError } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);

  const events = useMemo(() => mapTasksToCalendarEvents(tasks), [tasks]);

  if (isLoading) return <div className="p-4">Загрузка календаря...</div>;
  if (isError) return <div className="p-4">Не удалось загрузить задачи для календаря</div>;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-2">Календарь</h1>
      <p className="text-sm text-black mb-4">
        План задач с переключением по видам: день, неделя, месяц.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {availableViews.map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setCurrentView(view)}
            className={`rounded-md border px-3 py-2 text-sm ${
              currentView === view
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-black'
            }`}
          >
            {viewLabels[view]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="h-[70vh] min-h-[460px]">
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
    </div>
  );
};

export default CalendarView;