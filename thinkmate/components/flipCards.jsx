import { useState } from 'react';

export default function FlipCards() {
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [hoverIndex, setHoverIndex] = useState(-1);

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '20vh' }}>
      <div style={{ display: 'flex', gap: '5vw', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%' }}>
        {cards.map((card, index) => {
          const transformStr = `${flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'}${hoverIndex === index ? ' translateY(-8px)' : ''}`;
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {index === 3 && (
                <div style={{textAlign: 'center' }}>
                  <p style={{ marginBottom: '1rem' }}>These problem comprehension and construction connects to </p>
                </div>
              )}

              <div
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
              >
                <div
                  onClick={() => toggleFlip(index)}
                  className="perspective"
                  style={{ perspective: '1000px', height: '20rem', width: '15rem', cursor: 'pointer' }}
                >
                  <div
                    className="relative"
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.28s cubic-bezier(.22,.8,.3,1)',
                      transformStyle: 'preserve-3d',
                      transform: transformStr
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
                        background: index === 3 ? 'linear-gradient(135deg, #f2f2f2 0%, #6C5838 50%)' : 'linear-gradient(135deg, #f2f2f2 0%, #9E8C6C 70%)',
                        wordWrap: 'break-word',
                        borderRadius: 12,
                        boxShadow: '2px 20px 30px rgba(0,0,0,0.24)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: index === 3 ? '3rem' : '1.1rem',
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
                        background: index === 3 ? '#6C5838' : '#9E8C6C',
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
            </div>
          );
        })}
      </div>
    </div>
  );
}