const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white active:bg-blue-700',
    outline: 'border-2 border-blue-600 text-blue-600 active:bg-blue-50',
    ghost: 'text-black/80 active:bg-black/5',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;