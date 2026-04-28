import { VideoWithRelations, Flashcard, QuizQuestion } from '@/shared/types';

export const exportVideoToMarkdown = (
  video: VideoWithRelations,
  content: NonNullable<VideoWithRelations['generatedContents']>[0],
  flashcards: Flashcard[],
  questions: QuizQuestion[],
) => {
  if (!content) return;

  let md = `# ${video.title || 'Учебный материал'}\n\n`;
  md += `*Сгенерировано платформой WatchWise | ${new Date().toLocaleDateString('ru-RU')}*\n\n---\n\n`;

  md += `## 1. Конспект\n\n${content.summary}\n\n`;

  if (flashcards.length > 0) {
    md += `## 2. Глоссарий (Термины)\n\n`;
    flashcards.forEach((f: Flashcard) => {
      md += `- **${f.term}**: ${f.definition}\n`;
    });
    md += `\n`;
  }

  if (questions.length > 0) {
    md += `## 3. Проверочный тест\n\n`;
    questions.forEach((q: QuizQuestion, i: number) => {
      md += `### Вопрос ${i + 1}. ${q.text}\n`;
      (q.options as string[]).forEach((opt: string, optIdx: number) => {
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

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (video.title || 'Lesson')
    .substring(0, 30)
    .replace(/[^a-zа-я0-9]/gi, '_');
  a.download = `WatchWise_${safeTitle}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
