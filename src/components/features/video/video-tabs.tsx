'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, GraduationCap, LibraryBig, Download } from 'lucide-react';
import { Flashcards } from './flashcards';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { DeleteQuestionButton } from './delete-question-button';
import { EditQuestionDialog } from './edit-question-dialog';

interface VideoTabsProps {
  video: any;
  onTimestampClick: (time: number) => void;
}

export function VideoTabs({ video, onTimestampClick }: VideoTabsProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const transcript = video?.transcriptChunks || [];
  const content = video?.generatedContents?.[0];
  const questions = content?.questions || [];
  const flashcards = content?.flashcards || [];

  const parseTimestamp = (ts: string) => {
    const cleanTs = ts.replace(/[\[\]]/g, '');

    if (cleanTs.endsWith('s')) {
      return parseInt(cleanTs.replace('s', ''), 10);
    }

    const parts = cleanTs.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const formatDisplayTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `[${m}:${s.toString().padStart(2, '0')}]`;
  };

  const handleTermClick = (matchedTerm: string) => {
    const index = flashcards.findIndex((f: any) => f.term === matchedTerm);
    if (index !== -1) {
      setActiveCardIndex(index);
    }
    setActiveTab('cards');
  };

  // --- ЭКСПОРТ В MARKDOWN ---
  const handleExportMD = () => {
    if (!content) return;

    let md = `# ${video.title || 'Учебный материал'}\n\n`;
    md += `*Сгенерировано платформой WatchWise | ${new Date().toLocaleDateString('ru-RU')}*\n\n---\n\n`;

    md += `## 1. Конспект\n\n${content.summary}\n\n`;

    if (flashcards.length > 0) {
      md += `## 2. Глоссарий (Термины)\n\n`;

      flashcards.forEach((f: any) => {
        md += `- **${f.term}**: ${f.definition}\n`;
      });
      md += `\n`;
    }

    if (questions.length > 0) {
      md += `## 3. Проверочный тест\n\n`;

      questions.forEach((q: any, i: number) => {
        md += `### Вопрос ${i + 1}. ${q.text}\n`;
        q.options.forEach((opt: string, optIdx: number) => {
          const isCorrect = optIdx === q.correctIdx;
          const mark = isCorrect ? '[x]' : '[ ]';
          md += `- ${mark} ${opt}\n`;
        });
        if (q.explanation) {
          md += `\n> **Пояснение:** ${q.explanation}\n`;
        }
        md += `\n`;
      });
    }

    // Создаем Blob (виртуальный файл в памяти браузера)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Программный клик для скачивания
    const a = document.createElement('a');
    a.href = url;
    // Чистим имя файла от спецсимволов
    const safeTitle = (video.title || 'Lesson')
      .substring(0, 30)
      .replace(/[^a-zа-я0-9]/gi, '_');
    a.download = `WatchWise_${safeTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processText = (text: string) => {
    const parts = text.split(/(\[\d{1,3}:\d{1,2}\]|\[\d+s\])/g);

    return parts.map((part, i) => {
      if (part.match(/^\[\d{1,3}:\d{1,2}\]$|^\[\d+s\]$/)) {
        const seconds = parseTimestamp(part);
        return (
          <Button
            key={`ts-${i}`}
            variant='link'
            className='h-auto p-0 px-1 text-primary font-mono text-[13px] hover:no-underline hover:text-primary/80 align-baseline'
            onClick={() => onTimestampClick(seconds)}
          >
            {formatDisplayTime(seconds)}
          </Button>
        );
      }

      if (flashcards.length > 0) {
        const terms = flashcards
          .map((f: any) => f.term)
          .sort((a: string, b: string) => b.length - a.length);

        const escapedTerms = terms.map((t: string) =>
          t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        );

        const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
        const subParts = part.split(regex);

        return subParts.map((subPart, j) => {
          const matchedTerm = terms.find(
            (t: string) => t.toLowerCase() === subPart.toLowerCase(),
          );

          if (matchedTerm) {
            return (
              <span
                key={`term-${i}-${j}`}
                className='border-b border-dashed border-primary/70 text-primary cursor-pointer hover:bg-primary/10 transition-colors font-semibold'
                title='Перейти к определению'
                onClick={() => handleTermClick(matchedTerm)}
              >
                {subPart}
              </span>
            );
          }
          return subPart;
        });
      }

      return part;
    });
  };

  const processContent = (nodeContent: any): any => {
    if (typeof nodeContent === 'string') {
      return processText(nodeContent);
    }
    if (Array.isArray(nodeContent)) {
      return nodeContent.map((child, i) => (
        <React.Fragment key={i}>{processContent(child)}</React.Fragment>
      ));
    }
    return nodeContent;
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className='w-full h-full flex flex-col'
    >
      <TabsList className='grid w-full grid-cols-3 h-auto p-1 shrink-0'>
        <TabsTrigger
          value='summary'
          className='py-2 px-1 text-[13px] sm:text-sm'
        >
          <FileText className='w-4 h-4 mr-1 sm:mr-2 shrink-0' />
          <span className='truncate'>Саммари</span>
        </TabsTrigger>
        <TabsTrigger value='quiz' className='py-2 px-1 text-[13px] sm:text-sm'>
          <GraduationCap className='w-4 h-4 mr-1 sm:mr-2 shrink-0' />
          <span className='truncate'>Тест</span>
        </TabsTrigger>
        <TabsTrigger value='cards' className='py-2 px-1 text-[13px] sm:text-sm'>
          <LibraryBig className='w-4 h-4 mr-1 sm:mr-2 shrink-0' />
          <span className='truncate'>Карточки</span>
        </TabsTrigger>
      </TabsList>

      <div className='flex-1 mt-4 min-h-0 flex flex-col'>
        <TabsContent
          value='summary'
          className='h-full m-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden'
        >
          <Card className='flex-1 flex flex-col border-none shadow-none min-h-0'>
            <CardHeader className='p-4 pb-2 flex flex-row items-center justify-between space-y-0 shrink-0'>
              <div>
                <CardTitle className='text-lg'>Краткое содержание</CardTitle>
                <CardDescription className='text-xs'>
                  Сгенерировано YandexGPT
                </CardDescription>
              </div>
              {/* Кнопка скачивания MD */}
              {content && (
                <Button
                  onClick={handleExportMD}
                  variant='outline'
                  size='sm'
                  className='font-semibold shadow-sm h-8'
                >
                  <Download className='h-4 w-4 mr-2' />
                  Markdown
                </Button>
              )}
            </CardHeader>
            <ScrollArea className='flex-1 px-4 min-h-0'>
              <div className='text-sm space-y-4 pb-4'>
                {content?.summary ? (
                  <div className='prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed'>
                    <Markdown
                      components={{
                        p: ({ children }) => <p>{processContent(children)}</p>,
                        li: ({ children }) => (
                          <li className='ml-4 list-disc'>
                            {processContent(children)}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong>{processContent(children)}</strong>
                        ),
                      }}
                    >
                      {content.summary}
                    </Markdown>
                  </div>
                ) : transcript.length > 0 ? (
                  <div className='space-y-4 text-muted-foreground'>
                    <p className='text-[10px] font-bold uppercase text-primary tracking-wider'>
                      {video.status === 'FAILED'
                        ? 'Анализ прерван ошибкой, но мы сохранили транскрипт:'
                        : 'Полный транскрипт (анализ не запущен):'}
                    </p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {transcript.map((chunk: any) => (
                      <div
                        key={chunk.id}
                        className='group cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-primary'
                        onClick={() => onTimestampClick(chunk.startTime)}
                      >
                        <span className='text-[10px] font-mono text-primary font-bold'>
                          [{Math.floor(chunk.startTime / 60)}:
                          {Math.floor(chunk.startTime % 60)
                            .toString()
                            .padStart(2, '0')}
                          ]
                        </span>
                        <p className='mt-1 text-foreground text-xs leading-snug'>
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='italic text-muted-foreground text-center py-10'>
                    Здесь появится конспект после анализа.
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent
          value='quiz'
          className='h-full m-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden'
        >
          <Card className='flex-1 flex flex-col border-none shadow-none min-h-0'>
            <ScrollArea className='flex-1 p-4 min-h-0'>
              <div className='space-y-4 pb-4'>
                {questions.length > 0 ? (
                  questions.map((q: any, idx: number) => (
                    <Card
                      key={q.id}
                      className='p-4 border-muted shadow-none shrink-0 group relative'
                    >
                      <div className='flex justify-between items-start gap-4'>
                        <p className='text-sm font-semibold leading-tight flex-1 mt-1'>
                          <span className='text-muted-foreground mr-1'>
                            [{formatDisplayTime(q.timestamp)}]
                          </span>
                          {idx + 1}. {q.text}
                        </p>
                        {content.mode === 'teacher' && (
                          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-card rounded-md border shadow-sm'>
                            <EditQuestionDialog
                              question={q}
                              videoId={video.id}
                            />
                            <DeleteQuestionButton
                              questionId={q.id}
                              videoId={video.id}
                            />
                          </div>
                        )}
                      </div>

                      <div className='mt-4 grid gap-2'>
                        {q.options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className={`text-[12px] p-2.5 rounded border transition-colors ${
                              content.mode === 'teacher' && i === q.correctIdx
                                ? 'bg-primary/10 border-primary/30 font-medium text-foreground'
                                : 'bg-muted/30 text-muted-foreground'
                            }`}
                          >
                            {opt}
                            {content.mode === 'teacher' &&
                              i === q.correctIdx && (
                                <span className='ml-2 text-[10px] text-primary font-bold uppercase tracking-wider'>
                                  Правильный ответ
                                </span>
                              )}
                          </div>
                        ))}
                      </div>

                      {content.mode === 'teacher' && q.explanation && (
                        <div className='mt-3 p-3 bg-muted/50 rounded-md border-l-2 border-primary/50 text-xs italic text-muted-foreground'>
                          <span className='font-semibold text-foreground not-italic mr-1'>
                            Пояснение:
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground border border-dashed rounded-md text-center p-6'>
                    <GraduationCap className='h-8 w-8 mb-2 opacity-20' />
                    <p className='text-sm'>
                      Тестирование станет доступно после анализа
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent
          value='cards'
          className='h-full m-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden'
        >
          <Card className='flex-1 flex flex-col border-none shadow-none min-h-0'>
            <CardHeader className='p-4 pb-2 shrink-0'>
              <CardTitle className='text-lg'>Флеш-карточки</CardTitle>
              <CardDescription className='text-xs'>
                Основные термины для запоминания
              </CardDescription>
            </CardHeader>
            <ScrollArea className='flex-1 px-4 min-h-0'>
              {flashcards.length > 0 ? (
                <div className='pb-6'>
                  <Flashcards
                    cards={flashcards}
                    activeIndex={activeCardIndex}
                  />
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground border border-dashed rounded-md text-center p-6'>
                  <LibraryBig className='h-8 w-8 mb-2 opacity-20' />
                  <p className='text-sm'>
                    Карточки появятся после анализа видео
                  </p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
