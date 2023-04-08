export const vertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader
// It will receive data from a buffer

layout(location=0) in vec2 a_vertexPosition;
layout(location=1) in vec2 a_texcoord;

uniform mat3 u_transform;

out vec2 v_texcoord;

// all shaders have a main function
void main()
{
    // this clipping is now in projection matrix
    // vec2 zeroToTwo = (position / u_resolution)*2.0;
    // vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4( (u_transform * vec3(a_vertexPosition, 1)).xy, 0, 1);

    v_texcoord = a_texcoord;
}
`;

export const fragmentShaderSource = `#version 300 es
// pick precision
precision highp float;

// input
in vec2 v_texcoord;

// grab the texture
uniform sampler2D u_texture;

uniform vec4 u_color;

// declare an output for the fragment shader
out vec4 outColor;

void main()
{
    // outColor = texture(u_texture, v_texcoord);
    outColor = u_color;
}
`;