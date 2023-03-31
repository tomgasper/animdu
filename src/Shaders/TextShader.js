export const textVertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader
// It will receive data from a buffer

in vec2 a_vertexPosition;
in vec2 a_texcoord;

uniform mat3 u_transform;
uniform mat3 u_projection;

out vec2 v_texcoord;

// all shaders have a main function
void main()
{
    gl_Position = vec4( (u_projection * u_transform * vec3(a_vertexPosition, 1)).xy, 0, 1);

    v_texcoord = a_texcoord;
}
`;

export const textFragmentShaderSource = `#version 300 es
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
    outColor = texture(u_texture, v_texcoord);
}
`;