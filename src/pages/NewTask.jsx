import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

const NewTask = () => {
  const navigate = useNavigate();
  const { createTask, isCreating } = useTasks();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/tasks');
  };

  const onSubmit = (formData) => {
    setSubmitError('');

    createTask(formData, {
      onSuccess: (result) => {
        if (result?.twenty?.error) {
          setSubmitError(
            `Twenty CRM (${result.twenty.status}): ${result.twenty.error}`,
          );
          return;
        }

        navigate('/tasks');
      },
      onError: (error) => {
        setSubmitError(error?.message || 'Не удалось создать задачу');
      },
    });
  };

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-6">Новая задача</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Название
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Например, Подготовить отчёт"
            {...register('title', {
              required: 'Введите название задачи',
              validate: (value) =>
                value.trim().length > 0 || 'Введите название задачи',
            })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Описание
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Добавьте детали задачи (необязательно)"
            {...register('description')}
          />
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isCreating ? 'Сохранение...' : 'Создать'}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="rounded-md border border-gray-300 px-4 py-2"
          >
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTask;
