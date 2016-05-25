var SHADERS = {
  vertex: [
    "precision mediump float;",

    "attribute vec2 vPos;",
    "attribute vec3 vColor;",
    "varying vec3 fragmentColor;",

    "void main() {",
    "  fragmentColor = vColor;",
    "  gl_Position = vec4(vPos, 0.0, 1.0);",
    "}"
  ].join("\n"),

  fragment: [
    "precision mediump float;",

    "varying vec3 fragmentColor;",

    "void main() {",
    "  gl_FragColor = vec4(fragmentColor, 1.0);",
    "}"

  ].join("\n")
};


var APP = (function() {
  var gl;
  var program;

  function clear() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function compileShader(src, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("COMPILE ERROR: " + gl.getShaderInfoLog(shader));
      return -1;
    }

    return shader;
  }


  function loadShaderProgram() {
    vShader = compileShader(SHADERS.vertex, gl.VERTEX_SHADER);
    if(vShader == -1)
      return;
    fShader = compileShader(SHADERS.fragment, gl.FRAGMENT_SHADER);
    if(fShader == -1)
      return;

    program = gl.createProgram();

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("LINK ERROR: " + gl.getProgramLogInfo(program));
      return -1;
    }
  }


  function draw() {
    var triangleVerts = [
       0.0,  0.5,  1.0, 0.0, 0.0,
      -0.5, -0.5,  0.0, 1.0, 0.0,
       0.5, -0.5,  0.0, 0.0, 1.0
    ]

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerts), gl.STATIC_DRAW);

    var vPosLoc = gl.getAttribLocation(program, "vPos");
    gl.vertexAttribPointer(vPosLoc, 2, gl.FLOAT, gl.FALSE, 
        5 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(vPosLoc);

    var vColorLoc = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColorLoc, 3, gl.FLOAT, gl.FALSE, 
        5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(vColorLoc);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }


  return {
    init: function(id) {
      var canvas = document.getElementById(id);

      gl = canvas.getContext("webgl");

      clear();

      loadShaderProgram();
      draw();
    }
  };

}());
