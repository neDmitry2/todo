import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

const PRESETS = [15, 30, 60];

const pad = (value) => String(value).padStart(2, '0');

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

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

const parseDateKey = (key) => {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, m, d] = key.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  return { y, m, d };
};

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const splitTime = (value) => {
  if (!value || !value.includes(':')) return { h: '', m: '' };
  const [h, m] = value.split(':');
  return { h: String(Number(h)), m: String(Number(m)) };
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

  const dateParts = useMemo(() => parseDateKey(date), [date]);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - 1 + i);
  }, []);

  const dayOptions = useMemo(() => {
    if (!dateParts) return Array.from({ length: 31 }, (_, i) => i + 1);
    const max = daysInMonth(dateParts.y, dateParts.m);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [dateParts]);

  const handleDatePartChange = (field, rawValue) => {
    const parsed = parseDateKey(date);
    if (!parsed) return;

    let y = parsed.y;
    let m = parsed.m;
    let d = parsed.d;

    if (field === 'y') y = Number(rawValue);
    if (field === 'm') m = Number(rawValue);
    if (field === 'd') d = Number(rawValue);

    const maxD = daysInMonth(y, m);
    if (d > maxD) d = maxD;

    setDate(`${y}-${pad(m)}-${pad(d)}`);
  };

  const applyStartAndBumpEnd = (newStart) => {
    setStartTime(newStart);
    setEndTime(addOneHourCapped(newStart));
  };

  const handleStartHourChange = (hourStr) => {
    setError('');
    const h = hourStr === '' ? null : Number(hourStr);
    const { m: mStr } = splitTime(startTime);
    const mi = mStr === '' ? 0 : Number(mStr);

    if (h === null || Number.isNaN(h)) {
      setStartTime('');
      setEndTime('');
      return;
    }

    const newStart = `${pad(h)}:${pad(mi)}`;
    applyStartAndBumpEnd(newStart);
  };

  const handleStartMinuteChange = (minuteStr) => {
    setError('');
    const mi = minuteStr === '' ? null : Number(minuteStr);
    const { h: hStr } = splitTime(startTime);
    let h = hStr === '' ? 0 : Number(hStr);

    if (mi === null || Number.isNaN(mi)) {
      setStartTime('');
      setEndTime('');
      return;
    }

    if (Number.isNaN(h)) h = 0;
    const newStart = `${pad(h)}:${pad(mi)}`;
    applyStartAndBumpEnd(newStart);
  };

  const handleEndHourChange = (hourStr) => {
    setError('');
    const h = hourStr === '' ? null : Number(hourStr);
    const { m: mStr } = splitTime(endTime);
    const mi = mStr === '' ? 0 : Number(mStr);

    if (h === null || Number.isNaN(h)) {
      setEndTime('');
      return;
    }

    setEndTime(`${pad(h)}:${pad(mi)}`);
  };

  const handleEndMinuteChange = (minuteStr) => {
    setError('');
    const mi = minuteStr === '' ? null : Number(minuteStr);
    const { h: hStr } = splitTime(endTime);
    let h = hStr === '' ? 0 : Number(hStr);

    if (mi === null || Number.isNaN(mi)) {
      setEndTime('');
      return;
    }

    if (Number.isNaN(h)) h = 0;
    setEndTime(`${pad(h)}:${pad(mi)}`);
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

  const selectClass =
    'w-full min-h-[42px] rounded-md border border-gray-300 bg-white px-2 py-2 text-left text-base outline-none focus:border-blue-500';

  const startParts = splitTime(startTime);
  const endParts = splitTime(endTime);

  if (isLoading) return <div className="p-4">Загрузка...</div>;
  if (isError) return <div className="p-4">Не удалось загрузить задачи</div>;
  if (!task) return <div className="p-4">Задача не найдена</div>;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-2">Планирование задач</h1>
      <p className="text-black mb-6">{task.title}</p>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <p className="block text-sm font-medium mb-2">Дата</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            <div>
              <label htmlFor="schedule-day" className="sr-only">
                День
              </label>
              <select
                id="schedule-day"
                className={selectClass}
                value={dateParts ? String(dateParts.d) : ''}
                onChange={(e) => handleDatePartChange('d', e.target.value)}
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="schedule-month" className="sr-only">
                Месяц
              </label>
              <select
                id="schedule-month"
                className={selectClass}
                value={dateParts ? String(dateParts.m) : ''}
                onChange={(e) => handleDatePartChange('m', e.target.value)}
              >
                {MONTHS_RU.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="schedule-year" className="sr-only">
                Год
              </label>
              <select
                id="schedule-year"
                className={selectClass}
                value={dateParts ? String(dateParts.y) : ''}
                onChange={(e) => handleDatePartChange('y', e.target.value)}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="block text-sm font-medium mb-2">Начало</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-hour" className="mb-1 block text-xs text-black">
                Часы
              </label>
              <select
                id="start-hour"
                className={selectClass}
                value={startParts.h}
                onChange={(e) => handleStartHourChange(e.target.value)}
              >
                <option value="">—</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {pad(i)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="start-minute" className="mb-1 block text-xs text-black">
                Минуты
              </label>
              <select
                id="start-minute"
                className={selectClass}
                value={startParts.m}
                onChange={(e) => handleStartMinuteChange(e.target.value)}
              >
                <option value="">—</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {pad(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="block text-sm font-medium mb-2">Конец</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="end-hour" className="mb-1 block text-xs text-black">
                Часы
              </label>
              <select
                id="end-hour"
                className={selectClass}
                value={endParts.h}
                onChange={(e) => handleEndHourChange(e.target.value)}
              >
                <option value="">—</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {pad(i)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="end-minute" className="mb-1 block text-xs text-black">
                Минуты
              </label>
              <select
                id="end-minute"
                className={selectClass}
                value={endParts.m}
                onChange={(e) => handleEndMinuteChange(e.target.value)}
              >
                <option value="">—</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {pad(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
