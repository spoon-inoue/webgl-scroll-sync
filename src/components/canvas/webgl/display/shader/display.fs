#version 300 es
precision highp float;

uniform sampler2D map;
uniform float aspect;
uniform float seed;

#define h(f2, f) hash(vec3(f2, f))

vec3 hash(vec3 v) {
  uvec3 x = floatBitsToUint(v + vec3(.1, .2, .3));
  x = (x >> 8 ^ x.yzx) * 0x456789ABu;
  x = (x >> 8 ^ x.yzx) * 0x6789AB45u;
  x = (x >> 8 ^ x.yzx) * 0x89AB4567u;
  return vec3(x) / vec3(-1u);
}

mat2 rot(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

in vec2 vUv;
out vec4 O;

void main() {
  vec2 suv = vUv * 2. - 1.;

  if (1. < aspect)  suv *= vec2(aspect, 1);
  else              suv /= vec2(1, aspect);
  
  suv *= rot(acos(-1.) * 0.25);

  vec2 quv = suv, fuv, iuv;
  float i;
  for(; i < 4.; i++) {
    fuv = fract(quv);
    iuv = floor(quv);
    if (h(iuv, seed).x < 0.4 + (i / 4.) * 0.5) break;
    quv *= 2.0;
  }

  if (i == 4.) i--;

  float a = abs(1. - aspect);

  suv = fuv * 2. - 1.;
  vec2 auv = abs(suv);
  float th = 1. - pow(2., i) * (0.005 + a * 0.005);
  float d = step(auv.x, th) * step(auv.y, th);

  vec3 col = texture(map, vUv).rgb;
  col *= d;

  if (h(iuv, seed).y < 0.3) {
    col = 1. - col;
  }

  O = vec4(col, d);
}