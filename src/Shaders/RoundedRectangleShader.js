

export const roundedRectShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader
// It will receive data from a buffer

layout(location=0) in vec2 a_vertexPosition;
layout(location=1) in vec2 a_upper_left;
layout(location=2) in vec2 a_width_height;
layout(location=3) in float a_corner_radius;

uniform mat3 u_transform;

out vec2 v_texcoord;

out vec2 centre_norm_coords;
out vec2 size;
out float corner_radius;

void main()
{
    // this clipping is now in projection matrix
    // vec2 zeroToTwo = (position / u_resolution)*2.0;
    // vec2 clipSpace = zeroToTwo - 1.0;

    // vec2 top_middle = (u_transform * vec3(0,width_height.x/2.0f,1)).xy;
    // vec2 left_middle = (u_transform * vec3(width_height.y/2.0f, 0,1)).xy;

    vec2 top_middle = (u_transform * vec3(0,-50,1)).xy;
    vec2 left_middle = (u_transform * vec3(-50,0,1)).xy;

    gl_Position = vec4( (u_transform * vec3(a_vertexPosition, 1)).xy, 0, 1);

    centre_norm_coords = (u_transform * vec3(0,0,1)).xy;
    size = vec2(distance(left_middle, centre_norm_coords), distance(top_middle, centre_norm_coords) );
    corner_radius = a_corner_radius;
}
`;

export const roundedRectFragmentShaderSource = `#version 300 es
precision highp float;

in vec2 centre_norm_coords;
in vec2 size;
in float corner_radius;

uniform vec4 u_color;
uniform vec2 u_res;

// declare an output for the fragment shader
out vec4 outColor;

float roundedBoxSDF( vec2 centre, vec2 size, float radius )
{
  return length(max(abs(centre)-size + radius,0.0))-radius;
}

void main()
{
    float edgeSoftness = 1.0f/u_res.x;

    vec2 pos = gl_FragCoord.xy / u_res.xy;
    vec2 aspectRatio = vec2(u_res.x/u_res.y, 1.0f);
    vec2 centre = (centre_norm_coords + 1.0f)/2.0f;

    vec2 dist_r = vec2(size.x,size.y);

    pos *= aspectRatio;
    centre *= aspectRatio;
    dist_r *= aspectRatio;

    float distance = roundedBoxSDF(pos - centre, dist_r/2.0f, dist_r.y * corner_radius);
    float smoothedAlpha = 1.0f - smoothstep(0.0f, edgeSoftness * 2.0f, distance);
    outColor = vec4(u_color.rgb, smoothedAlpha);

    if (outColor.a <= 0.85) discard;
}
`;