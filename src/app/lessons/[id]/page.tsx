import { supabase } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { id: string } };

export default async function LessonPage({ params }: Props) {
  const { data: lesson } = await supabase
    .from('lessons')
    .select('title, content, status')
    .eq('id', params.id)
    .single();

  if (!lesson) notFound();

  return (
    <main className="max-w-3xl mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <Link href="/" className="text-blue-400 hover:underline mb-8 block">
        &larr; Back to All Lessons
      </Link>
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
        <div className="prose prose-invert max-w-none text-gray-300">
          <p>This page is ready to display the lesson content.</p>
        </div>
      </div>
    </main>
  );
}
