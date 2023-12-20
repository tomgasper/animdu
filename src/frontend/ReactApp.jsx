// App.jsx
import React, { useEffect } from 'react';
import { main } from '../index';

const App = () => {
  useEffect(() => {
    main(); // Wywołaj funkcję inicjalizującą WebGL
  }, []);

  return (
    <div id="webGLAppContainer">
      <canvas id="glcanvas"></canvas>
    </div>
  );
};

export default App;