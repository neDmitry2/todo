import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

const PRESETS = [15, 30, 60];

const pad = (value) => String(value).padStart(2, '0');

const parseTimeToMinutes = (value) => {
  if (!value || !value.includes(':')) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const minutesToTime = (value) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${pad(hours)}:${pad(minutes)}`;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

/** HH:mm для <input type="time"> из состояния (поддержка HH:mm:ss). */
const toTimeInputValue = (value) => {
  if (!value || !value.includes(':')) return '';
  const [a, b] = value.split(':');
  const h = Number(a);
  const m = Number(b);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  return `${pad(h)}:${pad(m)}`;
};

const normalizeTimeFromInput = (v) => {
  if (!v) return '';
  const [a, b] = v.split(':').map(Number);
  if (Number.isNaN(a) || Number.isNaN(b)) return '';
  return `${pad(a)}:${pad(b)}`;
};

const addOneHourCapped = (startStr) => {
  const m = parseTimeToMinutes(startStr);
  if (m === null) return '';
  const end = m + 60;
  const cap = 23 * 60 + 59;
  return minutesToTime(Math.min(end, cap));
};

const TaskSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const { tasks, isLoading, isError, upsertTaskSchedule, isScheduling } = useTasks();

  const navigateBackFromSchedule = (replace = false) => {
    const from = location.state?.from;
    if (typeof from === 'string' && from.startsWith('/')) {
      navigate(from, { replace });
      return;
    }
    navigate(-1);
  };

  const task = useMemo(
    () => tasks.find((item) => String(item.id) === String(taskId)),
    [tasks, taskId],
  );

  const [date, setDate] = useState(task?.date || formatDate(new Date()));
  const [startTime, setStartTime] = useState(task?.start_time || '');
  const [endTime, setEndTime] = useState(task?.end_time || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!task) return;
    setDate(task.date || formatDate(new Date()));
    setStartTime(task.start_time || '');
    setEndTime(task.end_time || '');
  }, [task]);

  const applyStartAndBumpEnd = (newStart) => {
    setStartTime(newStart);
    setEndTime(addOneHourCapped(newStart));
  };

  const handleStartTimeChange = (e) => {
    setError('');
    const v = e.target.value;
    if (!v) {
      setStartTime('');
      setEndTime('');
      return;
    }
    applyStartAndBumpEnd(normalizeTimeFromInput(v));
  };

  const handleEndTimeChange = (e) => {
    setError('');
    const v = e.target.value;
    if (!v) {
      setEndTime('');
      return;
    }
    setEndTime(normalizeTimeFromInput(v));
  };

  const busySlots = useMemo(() => {
    return tasks
      .filter(
        (item) =>
          String(item.id) !== String(taskId) &&
          item.date === date &&
          item.start_time &&
          item.end_time,
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        start: item.start_time,
        end: item.end_time,
        startMinutes: parseTimeToMinutes(item.start_time),
        endMinutes: parseTimeToMinutes(item.end_time),
      }))
      .filter((item) => item.startMinutes !== null && item.endMinutes !== null)
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [tasks, taskId, date]);

  const overlappingTasks = useMemo(() => {
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);

    if (start === null || end === null || end <= start) return [];

    return busySlots.filter(
      (slot) => start < slot.endMinutes && end > slot.startMinutes,
    );
  }, [busySlots, startTime, endTime]);

  const handleApplyPreset = (minutes) => {
    setError('');

    const start = parseTimeToMinutes(startTime);
    if (start === null) {
      setError('Сначала укажите время начала');
      return;
    }

    const calculatedEnd = start + minutes;
    if (calculatedEnd > 23 * 60 + 59) {
      setError('Пресет выходит за пределы текущего дня');
      return;
    }

    setEndTime(minutesToTime(calculatedEnd));
  };

  const handleSave = () => {
    setError('');

    if (!task) {
      setError('Задача не найдена');
      return;
    }

    if (!date || !startTime || !endTime) {
      setError('Заполните дату, время начала и время окончания');
      return;
    }

    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);

    if (start === null || end === null) {
      setError('Некорректный формат времени');
      return;
    }

    if (end <= start) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    if (overlappingTasks.length > 0) {
      setError('Выбранный интервал пересекается с другими задачами');
      return;
    }

    upsertTaskSchedule(
      {
        taskId: task.id,
        title: task.title,
        date,
        start_time: startTime,
        end_time: endTime,
      },
      {
        onSuccess: () => {
          navigateBackFromSchedule(true);
        },
        onError: (requestError) => {
          setError(requestError?.message || 'Не удалось сохранить время');
        },
      },
    );
  };

  const scheduleFieldInputClass =
    'min-h-[42px] min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 [color-scheme:light]';

  if (isLoading) return <div className="p-4">Загрузка...</div>;
  if (isError) return <div className="p-4">Не удалось загрузить задачи</div>;
  if (!task) return <div className="p-4">Задача не найдена</div>;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-2">Планирование задач</h1>
      <p className="mb-6 px-2 text-center text-2xl leading-snug text-black sm:text-3xl">
        {task.title}
      </p>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="schedule-date" className="shrink-0 text-sm font-medium text-black">
            Дата
          </label>
          <input
            id="schedule-date"
            type="date"
            value={date}
            min="2000-01-01"
            max="2100-12-31"
            onChange={(e) => setDate(e.target.value)}
            className={scheduleFieldInputClass}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="schedule-start-time"
            className="shrink-0 text-sm font-medium text-black"
          >
            Начало
          </label>
          <input
            id="schedule-start-time"
            type="time"
            step={60}
            value={toTimeInputValue(startTime)}
            onChange={handleStartTimeChange}
            className={scheduleFieldInputClass}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="schedule-end-time"
            className="shrink-0 text-sm font-medium text-black"
          >
            Конец
          </label>
          <input
            id="schedule-end-time"
            type="time"
            step={60}
            value={toTimeInputValue(endTime)}
            onChange={handleEndTimeChange}
            className={scheduleFieldInputClass}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Быстрые пресеты</p>
          <div className="flex w-full gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-2.5 text-sm hover:bg-gray-50"
              >
                +{preset} мин
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">Текущая занятость</h2>

        {busySlots.length === 0 ? (
          <p className="text-sm text-black">На выбранную дату накладок нет.</p>
        ) : (
          <div className="space-y-2">
            {busySlots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-md border px-3 py-2 text-sm ${
                  overlappingTasks.some((item) => item.id === slot.id)
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-gray-50 text-black'
                }`}
              >
                <p className="font-medium">{slot.title}</p>
                <p>
                  {slot.start} - {slot.end}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex w-full gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isScheduling}
          className="min-w-0 flex-1 rounded-md bg-blue-600 px-4 py-3 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isScheduling ? 'Сохранение...' : 'Сохранить время'}
        </button>

        <button
          type="button"
          onClick={() => navigateBackFromSchedule(false)}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-4 py-3"
        >
          Назад
        </button>
      </div>
    </div>
  );
};

export default TaskSchedule;
