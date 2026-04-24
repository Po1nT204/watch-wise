'use client';

import { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateQuizQuestion } from '@/server-actions/quiz';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { QuizQuestion } from '@/shared/types';
import { EditFormSchema } from '@/shared/schemas';

type FormValues = z.infer<typeof EditFormSchema>;

interface EditQuestionDialogProps {
  question: QuizQuestion;
  videoId: string;
}

export function EditQuestionDialog({
  question,
  videoId,
}: EditQuestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      id: String(question.id),
      videoId: String(videoId),
      text: String(question.text),
      timestamp: question.timestamp,
      options: (question.options as string[]).map((opt: string) => ({
        value: opt,
      })),
      correctIdx: String(question.correctIdx),
      explanation: question.explanation ? String(question.explanation) : '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const onSubmit = (values: FormValues) => {
    // Преобразуем данные в формат, который ожидает серверный экшен (числа и плоский массив)
    const payload = {
      id: values.id,
      videoId: values.videoId,
      text: values.text,
      timestamp: Number(values.timestamp),
      correctIdx: Number(values.correctIdx),
      explanation: values.explanation || null,
      options: values.options.map((o) => o.value),
    };

    startTransition(async () => {
      const result = await updateQuizQuestion(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Вопрос успешно обновлен');
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:text-primary'
        >
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Редактирование вопроса</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 pt-4'
          >
            <div className='grid grid-cols-[1fr_120px] gap-4'>
              <FormField
                control={form.control}
                name='text'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текст вопроса</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='resize-none h-20'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='timestamp'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Таймкод (сек)</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <FormLabel>Варианты ответа (выберите правильный)</FormLabel>
              <FormField
                control={form.control}
                name='correctIdx'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className='space-y-3'
                        disabled={isPending}
                      >
                        {fields.map((item, index) => (
                          <div
                            key={item.id}
                            className='flex items-center gap-3'
                          >
                            <FormItem className='flex items-center space-x-0 space-y-0'>
                              <FormControl>
                                <RadioGroupItem
                                  value={index.toString()}
                                  className='mt-1'
                                />
                              </FormControl>
                            </FormItem>

                            <FormField
                              control={form.control}
                              name={`options.${index}.value`}
                              render={({ field: inputField }) => (
                                <FormItem className='flex-1 space-y-0'>
                                  <FormControl>
                                    <Input
                                      {...inputField}
                                      className={
                                        field.value === index.toString()
                                          ? 'border-primary ring-1 ring-primary/20'
                                          : ''
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9 text-muted-foreground hover:text-destructive shrink-0'
                              onClick={() => remove(index)}
                              disabled={fields.length <= 2 || isPending}
                            >
                              <Trash className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() => append({ value: 'Новый вариант' })}
                disabled={isPending}
              >
                <Plus className='h-4 w-4 mr-2' /> Добавить вариант
              </Button>
            </div>

            <FormField
              control={form.control}
              name='explanation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пояснение (опционально)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder='Отображается после ответа пользователя'
                      className='resize-none h-16'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Отмена
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Сохранить изменения
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
