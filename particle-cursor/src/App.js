import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [matrixColumns, setMatrixColumns] = useState([]);

  useEffect(() => {
    const numColumns = Math.floor(window.innerWidth / 30); // Berechnung der Anzahl der Spalten basierend auf Schriftgröße
    const initialColumns = new Array(numColumns).fill([]); // Initiale leere Spalten

    setMatrixColumns(initialColumns);

    // Intervall für Animation
    const interval = setInterval(() => {
      setMatrixColumns((prevColumns) => {
        return prevColumns.map((column) => {
          // Neue Zeichen für jede Spalte hinzufügen
          const newChar = String.fromCharCode(Math.floor(Math.random() * 96) + 33); // Zufälliges Zeichen
          // Begrenze Spaltenhöhe auf etwa 2/3 des Fensters und füge neue Zeichen oben hinzu
          return [newChar, ...column].slice(0, Math.floor(window.innerHeight / 15 * 2 / 3));
        });
      });
    }, 50); // Zeichen alle 50ms generieren (schneller)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className="matrix-background">
        {/* Matrix-Animation */}
        {matrixColumns.map((column, index) => (
          <div
            key={index}
            className="matrix-column"
            style={{ left: `${(index * 100) / matrixColumns.length}%` }} // Verteilt Spalten gleichmäßig über den Bildschirm
          >
            {column.map((char, i) => (
              <div
                key={i}
                className="matrix-char"
                style={{
                  animationDelay: `${i * 0.5}s`, // Verzögerung für jede Zeile
                  animationDuration: `${Math.random() * 2 + 1}s`, // Zufällige Geschwindigkeit
                }}
              >
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>
      <h1>Willkommen zur Matrix-Animation!</h1>
    </div>
  );
}

export default App;
