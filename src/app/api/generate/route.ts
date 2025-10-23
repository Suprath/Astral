import { Inngest } from 'inngest';
import { serve } from 'inngest/next';
import { supabase } from '@/utils/supabase/client'; // Import the initialized client

// Create an Inngest client
export const inngest = new Inngest({ id: 'digital-lessons-app' });

// Background function
const generateLessonWithPlaceholder = inngest.createFunction(
  { id: 'generate-lesson-placeholder' },
  { event: 'lesson/generate' },
  async ({ event, step }) => {
    const { lessonId, outline } = event.data;

    // --- Placeholder Logic ---
    await step.sleep('simulate-ai-generation', '5s');

    const generatedTitle = `Generated Lesson for: "${outline.substring(0, 30)}..."`;
    const generatedContent = `This is the placeholder content for the lesson about "${outline}".`;

    await step.run('update-supabase', async () => {
      const { error } = await supabase
        .from('lessons')
        .update({
          status: 'generated',
          title: generatedTitle,
          content: generatedContent,
        })
        .eq('id', lessonId);

      if (error) {
        console.error('Failed to update lesson:', error);
        throw error;
      }
    });

    return { body: `Successfully generated placeholder for lesson ${lessonId}` };
  }
);

// Serve the Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateLessonWithPlaceholder],
});
