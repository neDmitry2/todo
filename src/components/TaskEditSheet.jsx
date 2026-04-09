import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskEditSheet = ({
  task,
  open,
  onClose,
  updateTask,
  deleteTask,
  isUpdating,
  isDeleting,
  /** Куда вернуться с экрана планирования (state.from) */
  scheduleReturnPath = '/calendar',
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!task || !open) return;
    setTitle(task.title || '');
    setDescription(task.description || '');
    setIsCompleted(!!task.is_completed);
    setError('');
  }, [task, open]);

  if (!open || !task) return null;

  const busy = isUpdating || isDeleting;

  const handleSave = () => {
    setError('');
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Введите название');
      return;
    }

    const completedAt =
      isCompleted ? task.completed_at || new Date().toISOString() : null;

    updateTask(
      {
        id: task.id,
        updates: {
          title: trimmed,
          description: description.trim(),
          is_completed: isCompleted,
          completed_at: completedAt,
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err?.message || 'Не удалось сохранить'),
      },
    );
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        'Удалить задачу? Запись в календаре будет удалена вместе с ней.',
      )
    ) {
      return;
    }
    deleteTask(task.id, {
      onSuccess: () => onClose(),
      onError: (err) => setError(err?.message || 'Не удалось удалить'),
    });
  };

  const goSchedule = () => {
    onClose();
    navigate(`/tasks/${task.id}/schedule`, {
      state: { from: scheduleReturnPath },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-edit-sheet-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-200 sm:hidden" />
        <div className="overflow-y-auto p-4 pb-8">
          <h2 id="task-edit-sheet-title" className="text-xl font-bold">
            Редактирование
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Изменения сохраняются в списке задач и в календаре.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="task-edit-title" className="mb-1 block text-sm font-medium">
                Название
              </label>
              <input
                id="task-edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                disabled={busy}
              />
            </div>
            <div>
              <label htmlFor="task-edit-desc" className="mb-1 block text-sm font-medium">
                Описание
              </label>
              <textarea
                id="task-edit-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                disabled={busy}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                disabled={busy}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Выполнена</span>
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="w-full rounded-md bg-blue-600 py-3 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={goSchedule}
              disabled={busy}
              className="w-full rounded-md border border-gray-300 py-3 text-black disabled:opacity-50"
            >
              Время и дата в календаре…
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="w-full rounded-md border border-gray-200 py-3 text-black disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="w-full rounded-md border border-red-200 bg-red-50 py-3 text-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Удаление...' : 'Удалить задачу'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditSheet;
