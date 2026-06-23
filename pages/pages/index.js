import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fidzexpemhtrglmiolxd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZHpleHBlbWh0cmdsaW9seGQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxOTExNDI4MSwiZXhwIjoxNzUwNjUwMjgxfQ.7qZVxvZCYGTnhqVNjJjxXvbEJoLcXDXnJkRr8iJ6K1E';
const GROQ_API_KEY = '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';
const PAYSTACK_PUBLIC_KEY = 'pk_test_4815f2d7d60d5de26feb7a13cde040a78ab8fb84';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LectureGenius() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [courseSubject, setCourseSubject] = useState('');
  const [studentName, setStudentName] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = new TextDecoder().decode(new Uint8Array(e.target.result));
        resolve(text.substring(0, 15000));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const extractConceptsWithGroq = async (pdfText) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{
            role: 'system',
            content: 'Extract 15-20 KEY CONCEPTS. Return only JSON with key_concepts array.'
          }, {
            role: 'user',
            content: `Extract concepts:\n\n${pdfText}`
          }],
          temperature: 0.3,
          max_tokens: 2500
        })
      });
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      throw new Error('Failed to extract: ' + error.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile || !courseSubject || !studentName) {
      alert('Fill all fields');
      return;
    }
    setLoading(true);
    try {
      const pdfText = await extractTextFromPDF(pdfFile);
      const concepts = await extractConceptsWithGroq(pdfText);
      const flashcards = concepts.key_concepts.map((c) => ({
        front: `What is ${c.name}?`,
        back: `${c.definition}\n\nExample: ${c.example}`,
        difficulty: c.difficulty
      }));
      let studyGuide = `STUDY GUIDE: ${courseSubject}\n\n`;
      concepts.key_concepts.forEach((c) => {
        studyGuide += `📌 ${c.name}\n${c.definition}\n\n`;
      });
      await supabase.from('study_materials').insert([{
        student_id: studentName,
        file_name: pdfFile.name,
        course_subject: courseSubject,
        extracted_concepts: concepts,
        flashcards: flashcards,
        study_guide: studyGuide,
        status: 'ready'
      }]);
      setMaterials({ concepts, flashcards, studyGuide });
      setCurrentPage('results');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentPage === 'upload') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ color: '#ffd700', textAlign: 'center' }}>📚 LectureGenius</h1>
          <form onSubmit={handleUpload} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px' }}>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '5px' }} required />
            <input type="text" value={courseSubject} onChange={(e) => setCourseSubject(e.target.value)} placeholder="Course subject" style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '5px' }} required />
            <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0])} style={{ width: '100%', marginBottom: '10px' }} required />
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#ffd700', color: '#000', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Processing...' : 'Extract Concepts'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentPage === 'results' && materials) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
        <h1 style={{ color: '#ffd700', textAlign: 'center' }}>✨ Study Guide Ready</h1>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {materials.concepts.key_concepts.map((c, i) => (
            <div key={i} style={{ background: '#1a1a1a', padding: '15px', marginBottom: '10px', borderLeft: '4px solid #ffd700', borderRadius: '5px' }}>
              <h3 style={{ color: '#ffd700' }}>{c.name}</h3>
              <p>{c.definition}</p>
              <p><strong>Example:</strong> {c.example}</p>
            </div>
          ))}
          <button onClick={() => setCurrentPage('flashcards')} style={{ width: '100%', background: '#ffd700', color: '#000', padding: '10px', marginTop: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            📇 Flashcards
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === 'flashcards' && materials) {
    const card = materials.flashcards[flashcardIndex];
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={() => setIsFlipped(!isFlipped)} style={{ background: isFlipped ? '#1a4d1a' : '#1a1a1a', border: '2px solid #ffd700', borderRadius: '10px', padding: '30px', textAlign: 'center', cursor: 'pointer', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', width: '100%', maxWidth: '500px' }}>
          <p style={{ fontSize: '1.2rem' }}>{isFlipped ? card.back : card.front}</p>
        </div>
        <p style={{ color: '#ffd700' }}>{flashcardIndex + 1} / {materials.flashcards.length}</p>
        <button onClick={() => { setFlashcardIndex(Math.max(0, flashcardIndex - 1)); setIsFlipped(false); }} style={{ width: '100%', background: '#ffd700', color: '#000', padding: '10px', marginTop: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          ← Previous
        </button>
        <button onClick={() => { setFlashcardIndex(Math.min(materials.flashcards.length - 1, flashcardIndex + 1)); setIsFlipped(false); }} style={{ width: '100%', background: '#ffd700', color: '#000', padding: '10px', marginTop: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          Next →
        </button>
        <button onClick={() => setCurrentPage('results')} style={{ width: '100%', background: '#333', color: '#fff', padding: '10px', marginTop: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          ← Back
        </button>
      </div>
    );
  }

  return null;
}
