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
import { FileText, GraduationCap, LibraryBig } from 'lucide-react';
import { Flashcards } from './flashcards';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';

interface VideoTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      {/* Контейнер с min-h-0 позволяет внутреннему скроллу работать правильно */}
      <div className='flex-1 mt-4 min-h-0 flex flex-col'>
        {/* Обрати внимание на data-[state=active]:flex flex-col — это делает вкладку flex-контейнером, когда она открыта */}
        <TabsContent
          value='summary'
          className='h-full m-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden'
        >
          <Card className='flex-1 flex flex-col border-none shadow-none min-h-0'>
            <CardHeader className='p-4 pb-2 shrink-0'>
              <CardTitle className='text-lg'>Краткое содержание</CardTitle>
              <CardDescription className='text-xs'>
                Сгенерировано YandexGPT
              </CardDescription>
            </CardHeader>
            {/* flex-1 и min-h-0 забирают оставшееся место под скролл */}
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
                      Полный транскрипт (анализ не запущен):
                    </p>
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
                      className='p-4 border-muted shadow-none shrink-0'
                    >
                      <p className='text-sm font-semibold leading-tight'>
                        {idx + 1}. {q.text}
                      </p>
                      <div className='mt-3 grid gap-2'>
                        {q.options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className='text-[12px] p-2 rounded border bg-muted/30 text-muted-foreground'
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
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
