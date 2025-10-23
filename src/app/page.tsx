'use client';

import { supabase } from '@/utils/supabase/client';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';

// Define the shape of a lesson
type Lesson = {
  id: string;
  title: string | null;
  status: string | null;
};

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [outline, setOutline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial lessons
  useEffect(() => {
    const fetchLessons = async () => {
      const { data } = await supabase
        .from('lessons')
        .select('id, title, status')
        .order('created_at', { ascending: false });
      if (data) setLessons(data);
    };
    fetchLessons();
  }, []);

  // Real-time listener
  useEffect(() => {
    const channel = supabase
      .channel('realtime lessons')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => {
          // Refetch lessons whenever a change happens
          const fetchLessons = async () => {
            const { data } = await supabase
              .from('lessons')
              .select('id, title, status')
              .order('created_at', { ascending: false });
            if (data) setLessons(data);
          };
          fetchLessons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!outline.trim()) return;

    setIsSubmitting(true);

    await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ outline }),
      headers: { 'Content-Type': 'application/json' },
    });

    setOutline('');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-center">Digital Lesson Generator</h1>
      <p className="text-gray-400 mb-8 text-center">
        Enter an outline and watch the lesson get generated in real-time.
      </p>

      <form onSubmit={handleSubmit} className="mb-12">
        <textarea
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          className="w-full p-3 border-2 border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:border-blue-500"
          placeholder="e.g., A simple test on counting numbers from 1 to 10"
          rows={4}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md disabled:bg-gray-500 hover:bg-blue-700 transition-colors"
        >
          {isSubmitting ? 'Generating...' : 'Generate'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Generated Lessons</h2>
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3">Lesson Title</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-t border-gray-700">
                <td className="px-4 py-3">
                  {lesson.status === 'generated' ? (
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {lesson.title || 'Untitled Lesson'}
                    </Link>
                  ) : (
                    <span className="text-gray-400">
                      {lesson.title || 'Lesson is being generated...'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      lesson.status === 'generating'
                        ? 'bg-yellow-500 text-black'
                        : lesson.status === 'generated'
                        ? 'bg-green-500 text-black'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {lesson.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
