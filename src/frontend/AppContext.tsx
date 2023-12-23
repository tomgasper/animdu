import React from 'react';
import { createContext, useContext, useEffect, useState } from "react";

import { main } from '../index';

import { InputManager } from '../App/InputManager';
import { SceneManager } from '../App/SceneManager';

import { AppAPI } from './AppAPI';

import "./_frontend_style.css";

interface AppContextInterface {
    gl: WebGL2RenderingContext | null;
    inputManager: InputManager | null;
    sceneManager: SceneManager | null;
    appAPI: AppAPI | null;
};

export const AppContext = createContext<AppContextInterface | null>(null);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children, canvasRef }) => {
  const [gl, setGl] = useState< WebGL2RenderingContext| null >(null);
  const [inputManager, setInputManager] = useState<InputManager | null>(null);
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
  const [appAPI, setAppAPI] = useState<AppAPI | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const glContext = canvasRef.current.getContext("webgl2", { stencil: true});
      setGl(glContext);

      const newInputManager = new InputManager(canvasRef.current, window);
      setInputManager(newInputManager);

      const newSceneManager = new SceneManager();
      setSceneManager(newSceneManager);

      let appRef =
      {
        ref: {}
      }

      main(glContext, canvasRef.current, newInputManager, newSceneManager, appRef);

      const newAppAPI = new AppAPI(appRef.ref);
      setAppAPI(newAppAPI);
    }
  }, [canvasRef]);

  return (
    <AppContext.Provider value={{gl, inputManager, sceneManager, appAPI}}>
      {children}
    </AppContext.Provider>
  )
}
