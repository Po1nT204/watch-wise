import { Prisma } from '@prisma/client';

export type Flashcard = Prisma.FlashcardGetPayload<object>;
export type QuizQuestion = Prisma.QuizQuestionGetPayload<object>;
export type Tag = Prisma.TagGetPayload<object>;
export type TranscriptChunk = Prisma.TranscriptChunkGetPayload<object>;

export type VideoWithRelations = Prisma.VideoGetPayload<{
  include: {
    progress: { include: { tags: true } };
    generatedContents: {
      include: { questions: true; flashcards: true };
    };
    transcriptChunks: true;
  };
}>;

export type GlobalFlashcard = Prisma.FlashcardGetPayload<{
  include: {
    content: {
      include: { video: true };
    };
  };
}>;

export type AnalysisMode = 'student' | 'teacher';
export type AnalysisDifficulty = 'easy' | 'medium' | 'hard';
export type AnalysisAudience = 'schoolboy' | 'student' | 'expert';
export type AnalysisFocus = 'theory' | 'practice' | 'facts';

export interface AnalysisSettings {
  mode: AnalysisMode;
  difficulty: AnalysisDifficulty;
  questionsCount: number;
  audience: AnalysisAudience;
  focus: AnalysisFocus;
}
