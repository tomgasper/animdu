export const lineVertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader
// It will receive data from a buffer

layout(location=0) in vec2 a_vertexPosition;
uniform mat3 u_transform;

// all shaders have a main function
void main()
{
    // this clipping is now in projection matrix
    // vec2 zeroToTwo = (position / u_resolution)*2.0;
    // vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4( (u_transform * vec3(a_vertexPosition, 1)).xy, 0, 1);
}
`;

export const lineFragmentShaderSource = `#version 300 es
// pick precision
precision highp float;

uniform vec4 u_color;

// declare an output for the fragment shader
out vec4 outColor;

void main()
{
    outColor = u_color;
}
`;