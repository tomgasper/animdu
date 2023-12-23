// App.jsx
import React, {  useEffect, useState, useRef } from 'react';
import { AppContextProvider } from './AppContext';

import { _front_PanelObject } from './Panels/_front_PanelObject';

const App = () => {
  const canvasRef = useRef(null);

  return (
    <AppContextProvider canvasRef={canvasRef}>
      <_front_PanelObject />
    <div id="webGLAppContainer">
      <canvas ref={canvasRef} id="glcanvas"></canvas>
    </div>
    </AppContextProvider>
  );
};

export default App;