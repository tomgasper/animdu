export const resetMousePointer = (body) =>
{
    if (body.style.cursor !== "default")
    {
        body.style.cursor = "default";
    }
};