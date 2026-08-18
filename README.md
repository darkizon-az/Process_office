# Process Office Feedback

Full-stack MVP для сбора и анализа обратной связи о работе процессного офиса. Стек: Next.js App Router, TypeScript strict, Tailwind CSS, Prisma + PostgreSQL, Zod, bcrypt, httpOnly JWT-сессия, Recharts, ExcelJS и Vitest.

## Запуск

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Опрос: `http://localhost:3000/s/feedback-2026`. Админ-панель: `http://localhost:3000/login`.

Переменные окружения описаны в `.env.example`. Для production обязательно задайте случайный `SESSION_SECRET` длиной не менее 32 символов и production `DATABASE_URL`.

Для первого заполнения базы задайте `ADMIN_EMAIL` и сильный `ADMIN_PASSWORD`. Повторный запуск seed не изменяет существующие данные; сброс разрешается только при `SEED_RESET=true`.

## Проверки

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CSAT — доля оценок 4–5 по `OVERALL_SATISFACTION`. NPS — доля 9–10 минус доля 0–6. Индекс качества — среднее индивидуальных средних `EXPECTATIONS_MATCH` и `PRACTICAL_VALUE`, если есть обе оценки. Индекс сотрудничества считается для ответа при наличии минимум трёх применимых оценок. INVALIDATED и TEST исключаются из метрик; «Не применимо» не равно нулю. Средние округляются до 2 знаков, проценты до 1, NPS до целого.

Ограничения MVP: нет рассылки приглашений и гарантии «один человек — один ответ»; idempotency защищает только от технического дубля. Конструктор ограничен копированием и версионированием готовой структуры, без drag-and-drop и полноценного BI-конструктора. Для production дополнительно рекомендуются rate limiting, CSRF-защита, резервное копирование и централизованный мониторинг.
