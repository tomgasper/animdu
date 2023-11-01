export const instancedLineCapVertexShaderSource = `#version 300 es
layout(location=0) in vec2 a_position;
layout(location=1) in vec2 a_point;

uniform mat3 u_transform;
uniform float u_width;

// all shaders have a main function
void main()
{
    gl_Position = vec4( (u_transform * vec3( u_width * a_position + a_point, 1)).xy, 0, 1);
}
`;
export const instancedLineCapFragmentShaderSource = `#version 300 es
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
//# sourceMappingURL=InstancedLineCapShader.js.map