import { Plus } from 'lucide-react';

const FAB = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center active:scale-95 active:bg-blue-700 transition-all z-50"
      aria-label="Add Task"
    >
      <Plus size={32} />
    </button>
  );
};

export default FAB;