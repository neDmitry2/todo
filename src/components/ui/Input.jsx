const Input = ({ label, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};

export default Input;