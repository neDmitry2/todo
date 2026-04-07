import { CheckCircle2, Circle, Clock } from 'lucide-react';

const TaskItem = ({ task, onToggle, onClick }) => {
  return (
    <div 
      className={`flex items-center p-4 mb-3 rounded-2xl border transition-all ${
        task.is_completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 shadow-sm'
      }`}
      onClick={onClick}
    >
      {/* Кастомный чекбокс */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id, !task.is_completed);
        }}
        className="mr-4 transition-transform active:scale-125"
      >
        {task.is_completed ? (
          <CheckCircle2 className="text-green-500" size={26} />
        ) : (
          <Circle className="text-gray-300" size={26} />
        )}
      </button>

      <div className="flex-1">
        <h3 className={`font-semibold text-lg ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </h3>
        {task.start_time && (
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <Clock size={14} className="mr-1" />
            <span>{task.start_time} - {task.end_time}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;