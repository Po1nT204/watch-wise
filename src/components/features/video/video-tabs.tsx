'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, GraduationCap, LibraryBig, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  VideoWithRelations,
  QuizQuestion,
  Flashcard,
  AnalysisMode,
} from '@/shared/types';
import { exportVideoToMarkdown } from '@/lib/export-utils';
import { SummaryTab } from './tabs/summary-tab';
import { QuizTab } from './tabs/quiz-tab';
import { CardsTab } from './tabs/cards-tab';

interface VideoTabsProps {
  video: VideoWithRelations;
  onTimestampClick: (time: number) => void;
}

export function VideoTabs({ video, onTimestampClick }: VideoTabsProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const transcript = video?.transcriptChunks || [];
  const content = video?.generatedContents?.[0];
  const questions = (content?.questions || []) as QuizQuestion[];
  const flashcards = (content?.flashcards || []) as Flashcard[];

  const handleTermClick = (matchedTerm: string) => {
    const index = flashcards.findIndex((f) => f.term === matchedTerm);
    if (index !== -1) {
      setActiveCardIndex(index);
    }
    setActiveTab('cards');
  };

  const handleExportMD = () => {
    if (content) {
      exportVideoToMarkdown(video, content, flashcards, questions);
    }
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
              {content && (
                <Button
                  onClick={handleExportMD}
                  variant='outline'
                  size='sm'
                  className='font-semibold shadow-sm h-8'
                >
                  <Download className='h-4 w-4 mr-2' /> Markdown
                </Button>
              )}
            </CardHeader>
            <SummaryTab
              summary={content?.summary}
              transcript={transcript}
              flashcards={flashcards}
              videoStatus={video.status}
              onTimestampClick={onTimestampClick}
              onTermClick={handleTermClick}
              generatedContentId={content?.id}
            />
          </Card>
        </TabsContent>

        <TabsContent
          value='quiz'
          className='h-full m-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden'
        >
          <Card className='flex-1 flex flex-col border-none shadow-none min-h-0'>
            <QuizTab
              questions={questions}
              mode={(content?.mode as AnalysisMode) || 'student'}
              videoId={video.id}
            />
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
            <CardsTab
              flashcards={flashcards}
              activeCardIndex={activeCardIndex}
            />
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
