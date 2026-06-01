import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Имя должно содержать минимум 2 символа' }),
  email: z.string().email({ message: 'Введите корректный Email' }),
  password: z
    .string()
    .min(6, { message: 'Пароль должен быть не менее 6 символов' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Введите корректный Email' }),
  password: z.string().min(1, { message: 'Введите пароль' }),
});

export const VideoUrlSchema = z.object({
  url: z
    .string()
    .min(1, { message: 'Введите ссылку' })
    .url({ message: 'Введите корректный URL' })
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be|vkvideo\.ru|vk\.com\/video).+$/,
      {
        message: 'Поддерживаются ссылки на YouTube и VK Video',
      },
    ),
});

export const SettingsSchema = z.object({
  name: z.string().min(2, 'Имя слишком короткое').optional(),
  bio: z.string().max(500, 'Описание слишком длинное').optional().nullable(),
  age: z.number().min(10).max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  links: z.record(z.string(), z.string()).optional().nullable(),
});

export const FlashcardSchema = z.object({
  term: z.string(),
  definition: z.string(),
});

export const QuizQuestionSchema = z.object({
  text: z.string(),
  timestamp: z.number().nonnegative(),
  options: z.array(z.string()).min(2),
  correctIdx: z.number().min(0),
  explanation: z.string().optional().nullable(),
});

export const AIGeneratedContentSchema = z.object({
  summary: z.string(),
  questions: z.array(QuizQuestionSchema).optional().default([]),
  flashcards: z.array(FlashcardSchema).optional().default([]),
  tags: z.array(z.string()).max(3).optional().default([]),
});

export const EditQuestionSchema = z.object({
  id: z.string().min(1),
  videoId: z.string().min(1),
  text: z.string().min(3, { message: 'Текст вопроса слишком короткий' }),
  timestamp: z.number().nonnegative(),
  options: z
    .array(
      z.string().min(1, { message: 'Вариант ответа не может быть пустым' }),
    )
    .min(2, { message: 'Нужно минимум 2 варианта ответа' }),
  correctIdx: z.number().min(0),
  explanation: z.string().optional().nullable(),
});

export const EditFormSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  text: z.string().min(3, 'Слишком короткий вопрос'),
  timestamp: z.union([z.string(), z.number()]),
  options: z
    .array(
      z.object({
        value: z.string().min(1, 'Вариант не может быть пустым'),
      }),
    )
    .min(2, 'Минимум 2 варианта ответа'),
  correctIdx: z.string(),
  explanation: z.string().optional(),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const AiFeedbackSchema = z.object({
  generatedContentId: z.string().min(1),
  isLiked: z.boolean(),
  comment: z.string().max(1000).optional().nullable(),
});
