import React from "react";

import { useState, useEffect } from "react";
import { useAppContext } from "../AppContext";

import { RenderableObject } from "../../RenderableObject";

import { _front_TextEntry } from "./_front_TextEntry";

export const _front_PanelObject = () => {
    const context = useAppContext();
  
    const [ keyPressed, setKeyPressed ] = useState(null);
    const [ activeObj, setActiveObj ] = useState<RenderableObject | null>(null);
  
    useEffect(() => {
      if ( !context || !context.inputManager || !context.sceneManager) return;
      const { inputManager, sceneManager, appAPI } = context;
  
      
  
      const _front_KeyEvent = (data) => {
        setKeyPressed(data.key);

        if (data.key == "p")
        {
            appAPI?.createRectangle();
        }
      };
  
      const _front_ActiveObjIDChange = (data) => {
        const obj = sceneManager.getObjByID(data.key);
        setActiveObj(obj);
      };
  
    inputManager.subscribe("keyEvent", _front_KeyEvent);
  
    sceneManager.subscribe("changeActiveObjID", _front_ActiveObjIDChange);
  
    return () => {
      inputManager.unsubscribe("keyEvent", _front_KeyEvent);
    };
  }, [context]);
  
    if (activeObj)
    {
      return (
        <div className="PanelObject_container">
          <div className="PanelObject_header">Object Panel</div>
          <_front_TextEntry name={"Name"} value={activeObj.name} />
          <_front_TextEntry name={"Position X"} value={activeObj.properties.position[0]} />
          <_front_TextEntry name={"Position Y"} value={activeObj.properties.position[1]} />
        </div>
      )
    }
    else {
      return <div className="PanelObject_container">
        No object mate!
      </div>
    }
  };