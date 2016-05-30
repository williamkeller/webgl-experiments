precision mediump float;

attribute vec3 vPos;
attribute vec2 vTexCoord;
varying vec2 fragmentCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

void main() {
  fragmentCoord = vTexCoord;
  gl_Position = mProjection * mView * mWorld * vec4(vPos, 1.0);
}
