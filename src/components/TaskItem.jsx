import { CheckCircle2, Circle, Clock, CalendarClock } from 'lucide-react';

const TaskItem = ({ task, onToggle, onSchedule }) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 mb-3 rounded-2xl border transition-all ${
        task.is_completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex-1 min-w-0 text-left">
        <h3
          className={`font-semibold text-lg ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {task.title}
        </h3>
        {task.start_time && (
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Clock size={14} className="mr-1 shrink-0" />
            <span>
              {task.start_time} - {task.end_time}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSchedule?.();
          }}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 active:scale-95"
          aria-label="Привязать ко времени"
          title="Привязать ко времени"
        >
          <CalendarClock size={22} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id, !task.is_completed);
          }}
          className="transition-transform active:scale-125 p-0.5"
          aria-label={task.is_completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
        >
          {task.is_completed ? (
            <CheckCircle2 className="text-green-500" size={26} />
          ) : (
            <Circle className="text-gray-300" size={26} />
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
