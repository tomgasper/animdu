export const pickVertexShaderSource = `#version 300 es
in vec2 a_vertexPosition;
uniform mat3 u_transform;

// all shaders have a main function
void main()
{
    gl_Position = vec4( (u_transform * vec3(a_vertexPosition, 1)).xy, 0, 1);
}
`;

export const pickfragmentShaderSource = `#version 300 es
precision highp float;

uniform vec4 u_id;
out vec4 outColor;

void main()
{
    outColor = u_id;
}
`;