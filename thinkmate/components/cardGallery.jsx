import React from "react";
import styles from "../styles/Rational.module.css";

export default function CardGallery({ cardsList = [], cards = [] }) {
  // Normalize input: support either `cardsList` (array of arrays) or `cards` (flat array)
  const inputLists = Array.isArray(cardsList) && cardsList.length
    ? cardsList
    : (Array.isArray(cards) && cards.length ? [cards] : []);

  const cards1 = Array.isArray(inputLists[0]) ? inputLists[0] : [];
  const cards2 = Array.isArray(inputLists[1]) ? inputLists[1] : cards1;

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <div >
        <div className="overflow-hidden">
          {cards1.length > 0 && (
            <div className={styles.scrollContainerLeft}>
              {[...cards1, ...cards1].map((card, index) => (
                <a
                  key={`c1-${index}`}
                  className={`${card?.hoverStyles?.bgColor ?? 'bg-gray-700'} ${styles.cardItem}`}
                  href={card?.href || '#'}
                  target={card?.external ? '_blank' : undefined}
                  rel={card?.external ? 'noopener noreferrer' : undefined}
                >
                  {card?.label}
                </a>
              ))}
            </div>
          )}

          {cards2.length > 0 && (
            <div className={styles.scrollContainerRight}>
              {[...cards2, ...cards2].map((card, index) => (
                <a
                  key={`c2-${index}`}
                  className={`${card?.hoverStyles?.bgColor ?? 'bg-gray-700'} ${styles.cardItem}`}
                  href={card?.href || '#'}
                  target={card?.external ? '_blank' : undefined}
                  rel={card?.external ? 'noopener noreferrer' : undefined}
                >
                  {card?.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

