export const pickVertexShaderSource = `#version 300 es
layout(location=0) in vec2 a_vertexPosition;
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
    //outColor = vec4(0.5f,0.5,0.5,1);
}
`;
//# sourceMappingURL=PickerShader.js.map