import { useState } from 'react';

export default function FlipCards() {
  const [flipped, setFlipped] = useState([false, false, false, false]);

  const toggleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const cards = [
    { front: 'Recognize emotions in others', back: 'Broaden emotional and cognitive awareness in various contexts' },
    { front: 'Understand another person\'s perspective', back: 'Construct High-quality and original problems within phenomena' },
    { front: 'Communicate that understanding to others', back: 'Represent the problem in descriptive terms' },
    { front: '🔑', back: 'Produce useful and new ideas within human-centered design thinking processes' },
  ];
   
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', padding: 16 }}>
      <div style={{ display: 'flex', gap: '5vw', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%' }}>
        {cards.map((card, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {index === 3 && (
              <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <p style={{ margin: 0 }}>Even it connects to...</p>
              </div>
            )}
            <div
              onClick={() => toggleFlip(index)}
              className="perspective"
              style={{ perspective: '1000px', height: 256, width: '22vw', cursor: 'pointer' }}
            >
            <div
              className="relative"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transition: 'transform 0.5s',
                transformStyle: 'preserve-3d',
                transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front */}
              <div
                className="front-face"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: '#fff',
                  wordWrap: 'break-word',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  fontFamily: 'NanumSquareNeo',
                  fontWeight: 700,
                  backfaceVisibility: 'hidden'
                }}
              >
                {card.front}
              </div>

              {/* Back */}
              <div
                className="back-face"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: '#2563eb',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {card.back}
              </div>
            </div>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}