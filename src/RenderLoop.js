export class RenderLoop
{
    constructor(callback)
    {
        this.callback = callback;

        this.startTime;
        this.previousTime;

        this.done = false;

        // this reference gets lost so binding to the class is needed
        this.stepCall = this.step.bind(this);
    }

    step(time)
    {
        if (this.startTime === undefined) 
        {
            this.startTime = time;
        }
        
        const elapsed = time - this.startTime;

        if (this.previousTime !== time)
        {
            this.callback(elapsed);
        }

        this.previousTime = time;

        if (!this.done)
        {
            window.requestAnimationFrame( this.stepCall );
        }
    }
}