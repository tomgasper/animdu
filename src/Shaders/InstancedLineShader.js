export const instancedLineVertexShaderSource = `#version 300 es
layout(location=0) in vec2 a_position;
layout(location=1) in vec2 a_pointA;
layout(location=2) in vec2 a_pointB;

uniform mat3 u_transform;
uniform float u_width;

// all shaders have a main function
void main()
{
    vec2 xBasis = a_pointB - a_pointA;
    vec2 yBasis = normalize(vec2(-xBasis.y,xBasis.x));

    vec2 point = a_pointA + xBasis * a_position.x +yBasis * u_width * a_position.y;

    gl_Position = vec4( (u_transform * vec3(point, 1)).xy, 0, 1);
}
`;

export const instancedLineFragmentShaderSource = `#version 300 es
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