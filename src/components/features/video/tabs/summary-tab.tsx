import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { formatDisplayTime, parseTimestamp } from '@/lib/time-utils';
import { Flashcard, TranscriptChunk } from '@/shared/types';
import { FeedbackBlock } from '../feedback-block';

interface SummaryTabProps {
  summary: string | undefined;
  transcript: TranscriptChunk[];
  flashcards: Flashcard[];
  videoStatus: string;
  onTimestampClick: (time: number) => void;
  onTermClick: (term: string) => void;
  generatedContentId: string | undefined;
}

export function SummaryTab({
  summary,
  transcript,
  flashcards,
  videoStatus,
  onTimestampClick,
  onTermClick,
  generatedContentId,
}: SummaryTabProps) {
  const termsRegex = useMemo(() => {
    if (!flashcards || flashcards.length === 0) return null;
    const terms = flashcards
      .map((f) => f.term)
      .sort((a, b) => b.length - a.length);
    const escapedTerms = terms.map((t) =>
      t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    return {
      regex: new RegExp(`(${escapedTerms.join('|')})`, 'gi'),
      terms,
    };
  }, [flashcards]);

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

      if (termsRegex) {
        const subParts = part.split(termsRegex.regex);
        return subParts.map((subPart, j) => {
          const matchedTerm = termsRegex.terms.find(
            (t) => t.toLowerCase() === subPart.toLowerCase(),
          );

          if (matchedTerm) {
            return (
              <span
                key={`term-${i}-${j}`}
                className='border-b border-dashed border-primary/70 text-primary cursor-pointer hover:bg-primary/10 transition-colors font-semibold'
                title='Перейти к определению'
                onClick={() => onTermClick(matchedTerm)}
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

  const processContent = (nodeContent: React.ReactNode): React.ReactNode => {
    if (typeof nodeContent === 'string') return processText(nodeContent);
    if (Array.isArray(nodeContent)) {
      return nodeContent.map((child, i) => (
        <React.Fragment key={i}>{processContent(child)}</React.Fragment>
      ));
    }
    return nodeContent;
  };

  return (
    <ScrollArea className='flex-1 px-4 min-h-0'>
      <div className='text-sm space-y-4 pb-4'>
        {summary ? (
          <div className='prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed'>
            <Markdown
              components={{
                p: ({ children }) => <p>{processContent(children)}</p>,
                li: ({ children }) => (
                  <li className='ml-4 list-disc'>{processContent(children)}</li>
                ),
                strong: ({ children }) => (
                  <strong>{processContent(children)}</strong>
                ),
              }}
            >
              {summary}
            </Markdown>
            {generatedContentId && (
              <FeedbackBlock generatedContentId={generatedContentId} />
            )}
          </div>
        ) : transcript.length > 0 ? (
          <div className='space-y-4 text-muted-foreground'>
            <p className='text-[10px] font-bold uppercase text-primary tracking-wider'>
              {videoStatus === 'FAILED'
                ? 'Анализ прерван ошибкой, но мы сохранили транскрипт:'
                : 'Полный транскрипт (анализ не запущен):'}
            </p>
            {transcript.map((chunk) => (
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
  );
}
