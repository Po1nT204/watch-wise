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

// export const VideoUrlSchema = z.object({
//   url: z
//     .string()
//     .min(1, { message: 'Введите ссылку' })
//     .url({ message: 'Введите корректный URL' })
//     .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, {
//       message: 'Поддерживаются только ссылки на YouTube',
//     }),
// });

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
