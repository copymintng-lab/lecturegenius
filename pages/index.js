export default function Home() {
  return (
    <div style={{ background: '#000', color: '#fff', padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#ffd700', fontSize: '3rem', marginBottom: '20px' }}>📚 LectureGenius</h1>
      <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '30px' }}>AI-powered study guide generator for Nigerian university students</p>
      <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', border: '2px solid #ffd700', maxWidth: '500px' }}>
        <p style={{ color: '#4caf50', fontSize: '1.8rem', marginBottom: '15px' }}>✅ App is Live!</p>
        <p style={{ color: '#ffd700', fontSize: '1.1rem', lineHeight: '1.6' }}>
          📄 Upload PDF<br/>
          🧠 Extract Concepts<br/>
          📇 Study with Flashcards<br/>
          📥 Download Study Guide
        </p>
      </div>
    </div>
  )
}
