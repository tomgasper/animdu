export class InputManager
{
    constructor(gl, canvas, scenes)
    {
        this.gl = gl;
        this.canvas = canvas;
        this.scenesToTrack = scenes;
    }

    queryObjects(pos)
    {
        if (!this.scenesToTrack || this.scenesToTrack.length < 1) return;

        this.scenesToTrack.forEach( (scene) => {
            let objectsToQuery = scene.getSceneObjs();

            objectsToQuery.forEach( (obj) => {
                console.log(pos);
                console.log(obj.position);
                if (obj.position[0] == pos.x && obj.position[1] == pos.y) console.log(obj.ID); 
            });
        })
    }

    getMousePos(event, target) {
        target = target || event.target;
        var rect = target.getBoundingClientRect();
    
        const pos = { 
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
      
        return pos;
      }
    
      // assumes target or event.target is canvas
    getRelativeMousePosition(event, target) {
        target = target || event.target;
        var pos = this.getMousePos(event, target);
      
        pos.x = pos.x * target.width  / this.canvas.clientWidth;
        pos.y = pos.y * target.height / this.canvas.clientHeight;
      
        return pos;  
      }

      handleOnClick(event, target)
      {
        const pos = this.getRelativeMousePosition(event,target);

        this.queryObjects(pos);
      }

}