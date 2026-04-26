# WatchWise — Interactive AI Video Learning Platform

![Project Status](https://img.shields.io/badge/Status-MVP_Ready-green)
![Refactoring](https://img.shields.io/badge/Stage-Refactoring-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

**WatchWise** — это веб-платформа, которая трансформирует пассивный просмотр образовательных видео (YouTube, VK Video) в активный процесс обучения. Система использует технологии искусственного интеллекта (Yandex Cloud) для автоматической генерации конспектов, тестов и флеш-карточек, а также реализует уникальную механику «Умной паузы».

> Проект разрабатывается в рамках Выпускной Квалификационной Работы (ВКР).

## 🌟 Основные возможности

- **Мультиплатформенность:** Поддержка видео с YouTube и VK Video.
- **AI-Генерация контента:** Конспекты, тесты, флеш-карточки и автоматическое тегирование.
- **Умная пауза (Smart Pause):** Видеоплеер автоматически останавливается в ключевые моменты, предлагая ответить на вопрос по пройденному материалу.
- **Личный кабинет & Геймификация:** Отслеживание прогресса, накопление XP, уровни и история просмотров.
- **Редактор преподавателя:** Возможность корректировать сгенерированные тесты.

## 🛠 Технологический стек

- **Core:** [Next.js 15](https://nextjs.org/) (App Router), TypeScript.
- **Frontend:** Tailwind CSS, shadcn/ui, Zustand.
- **Backend & DB:** Server Actions, PostgreSQL, Prisma ORM.
- **AI & Media Pipeline:** YandexGPT, Yandex SpeechKit, Yandex Object Storage (S3), `ytdlp-nodejs`.
- **Reliability:** Zod (Validation), Pino (Logging), p-retry (Resilience).

## 🚀 Запуск проекта локально

Для запуска понадобятся **Node.js** (v18+) и **Docker**.

1.  **Клонируйте репозиторий:**

    ```bash
    git clone [https://github.com/your-username/watch-wise.git](https://github.com/your-username/watch-wise.git)
    cd watch-wise
    ```

2.  **Установите зависимости:**

    ```bash
    npm install
    ```

3.  **Настройте переменные окружения (.env):**
    Создайте файл `.env` в корне проекта. Вам понадобятся следующие ключи:

    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/watchwise?schema=public"

    # Next Auth
    AUTH_SECRET="your-super-secret-key"
    AUTH_GOOGLE_ID="your-google-oauth-id"
    AUTH_GOOGLE_SECRET="your-google-oauth-secret"

    # Yandex Cloud (AI & S3)
    YANDEX_API_KEY="your-yandex-api-key"
    YANDEX_FOLDER_ID="your-yandex-folder-id"
    YANDEX_STORAGE_ACCESS_KEY="your-s3-access-key"
    YANDEX_STORAGE_SECRET_KEY="your-s3-secret-key"
    YANDEX_STORAGE_BUCKET_NAME="your-bucket-name"
    ```

4.  **Запустите базу данных (через Docker):**

    ```bash
    docker compose up -d
    ```

5.  **Выполните миграции БД:**

    ```bash
    npx prisma migrate dev
    ```

6.  **Запустите проект:**
    `bash
    npm run dev
    `
    Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📂 Документация

Подробная техническая документация находится в папке `docs/`:

- `architecture.md` — архитектурные правила и структура.
- `plan.md` — план разработки и решения проблем.
- `requirements.md` — функциональные требования.
