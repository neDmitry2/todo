# Todo — задачи и расписание

Веб-приложение для ведения списка дел с привязкой к календарю: главная с обзором дня, календарь, список задач, планирование слотов и простая статистика по выполненным задачам за сегодня.

## Возможности

- **Главная** (`/`) — расписание на сегодня и задачи дня, быстрый переход в календарь, отметка выполнения и редактирование в боковой панели.
- **Календарь** (`/calendar`) — месячный/недельный вид на базе `react-big-calendar`, события строятся из задач и их расписания.
- **Задачи** (`/tasks`) — полный список; создание новой задачи (`/tasks/new`) с заголовком и описанием.
- **Расписание задачи** (`/tasks/:taskId/schedule`) — интервал времени для конкретной задачи; данные хранятся в таблице событий и сливаются с задачами при загрузке.
- **Статистика** (`/stats`) — задачи, выполненные сегодня, и суммарное время по длительности слотов.

Нижняя навигация: Главная, Календарь, Задачи, Статистика.

## Стек

- [React](https://react.dev/) 19, [Vite](https://vitejs.dev/) 8
- [React Router](https://reactrouter.com/) 7
- [TanStack Query](https://tanstack.com/query) — загрузка и мутации задач
- [Supabase](https://supabase.com/) — PostgreSQL и клиент `@supabase/supabase-js`
- [Tailwind CSS](https://tailwindcss.com/) 4, [date-fns](https://date-fns.org/), [react-hook-form](https://react-hook-form.com/), [Lucide](https://lucide.dev/) / эмодзи в навбаре

Основной код интерфейса — JSX; точки входа сборки и конфигурация — TypeScript.

## Требования

- Node.js с поддержкой текущих версий зависимостей (рекомендуется LTS).
- Проект в Supabase с таблицами **`tasks`** и **`events`**, согласованными с кодом сервиса задач.

Минимально ожидаемые поля (по использованию в приложении):

- `tasks`: идентификатор, `user_id`, `title`, `description`, `is_completed`, `completed_at`, `created_at` (и другие столбцы, если вы их добавите).
- `events`: идентификатор, `user_id`, `task_id`, `title`, `start_time`, `end_time`, `is_all_day`, `updated_at`.

Настройте [политики RLS](https://supabase.com/docs/guides/auth/row-level-security) и права так, чтобы анонимный ключ мог выполнять нужные `select` / `insert` / `update` / `delete` для вашего сценария.

### Пользователь в коде

Сейчас все запросы привязаны к фиксированному `user_id` в `src/services/taskService.js` (заглушка для разработки).
## Переменные окружения

В корне репозитория создайте файл `.env` (или `.env.local` — в зависимости от вашей практики) с переменными Vite:

```env
VITE_SUPABASE_URL=https://<ваш-проект>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Значения берутся в панели Supabase: **Project Settings → API**.

## Установка и запуск

```bash
npm install
npm run dev
```

Приложение откроется по адресу, который выведет Vite (обычно `http://localhost:5173`).

Другие скрипты:

- `npm run build` — проверка TypeScript и production-сборка
- `npm run preview` — локальный просмотр собранного бандла
- `npm run lint` — ESLint

## Структура (кратко)

| Путь | Назначение |
|------|------------|
| `src/App.jsx` | Роуты и `QueryClientProvider` |
| `src/pages/` | Экраны: дашборд, календарь, список, форма, расписание, статистика |
| `src/components/` | Навбар, карточка задачи, панель редактирования, UI-компоненты |
| `src/hooks/useTasks.js` | React Query: список задач и мутации |
| `src/services/taskService.js` | Обращения к Supabase (`tasks` + `events`) |
| `src/utils/scheduleMerge.js` | Слияние событий с задачами; локальные дата/время |
| `src/utils/calendarAdapter.js` | Преобразование задач в события календаря |
| `src/lib/supabase.ts` | Клиент Supabase |

---
