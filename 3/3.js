var SHADERS = {
  vertex: [
    "precision mediump float;",

    "attribute vec3 vPos;",
    "attribute vec3 vColor;",
    "varying vec3 fragmentColor;",
    "uniform mat4 mWorld;",
    "uniform mat4 mView;",
    "uniform mat4 mProjection;",

    "void main() {",
    "  fragmentColor = vColor;",
    "  gl_Position = mProjection * mView * mWorld * vec4(vPos, 1.0);",
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

  var mWorld;
  var mView;
  var mProjection;
  var mWorldULoc;

  var cubeIndices;

  function clear() {
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
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

    gl.useProgram(program);
  }


  function setupGeometry() {
    var cubeVerts = [
			-1.0, 1.0, -1.0,    0.5, 0.5, 0.5,
			-1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
			1.0, 1.0, 1.0,      0.5, 0.5, 0.5,
			1.0, 1.0, -1.0,     0.5, 0.5, 0.5,

			// Left
 			-1.0, 1.0, 1.0,     0.75, 0.25, 0.5,
 			-1.0, -1.0, 1.0,    0.75, 0.25, 0.5,
 			-1.0, -1.0, -1.0,   0.75, 0.25, 0.5,
 			-1.0, 1.0, -1.0,    0.75, 0.25, 0.5,
 
			// Right
			1.0, 1.0, 1.0,      0.25, 0.25, 0.75,
			1.0, -1.0, 1.0,     0.25, 0.25, 0.75,
			1.0, -1.0, -1.0,    0.25, 0.25, 0.75,
			1.0, 1.0, -1.0,     0.25, 0.25, 0.75,

			// Front
			1.0, 1.0, 1.0,      1.0, 0.0, 0.15,
			1.0, -1.0, 1.0,     1.0, 0.0, 0.15,
			-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
			-1.0, 1.0, 1.0,     1.0, 0.0, 0.15,

			// Back
			1.0, 1.0, -1.0,     0.0, 1.0, 0.15,
			1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
			-1.0, -1.0, -1.0,   0.0, 1.0, 0.15,
			-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

			// Bottom
			-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
			-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
			1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
			1.0, -1.0, -1.0,    0.5, 0.5, 1.0
    ]

		cubeIndices = [
			// Top
			0, 1, 2,
			0, 2, 3,

			// Left
			5, 4, 6,
			6, 4, 7,

			// Right
			8, 9, 10,
			8, 10, 11,

			// Front
			13, 12, 14,
			15, 14, 12,

			// Back
			16, 17, 18,
			16, 18, 19,

			// Bottom
			21, 20, 22,
			22, 20, 23
		];

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVerts), gl.STATIC_DRAW);

		var ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    var vPosLoc = gl.getAttribLocation(program, "vPos");
    gl.vertexAttribPointer(vPosLoc, 3, gl.FLOAT, gl.FALSE, 
        6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(vPosLoc);

    var vColorLoc = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColorLoc, 3, gl.FLOAT, gl.FALSE, 
        6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(vColorLoc);

    mWorldULoc = gl.getUniformLocation(program, "mWorld");
    mWorld = new Float32Array(16);
    mat4.identity(mWorld);
    gl.uniformMatrix4fv(mWorldULoc, gl.FALSE, mWorld);

    var mViewULoc = gl.getUniformLocation(program, "mView");
    mView = new Float32Array(16);
    mat4.lookAt(mView, [0.0, 0.0, -8.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    gl.uniformMatrix4fv(mViewULoc, gl.FALSE, mView);

    var mProjectionULoc = gl.getUniformLocation(program, "mProjection");
    mProjection = new Float32Array(16);
    mat4.perspective(mProjection, glMatrix.toRadian(45.0), 800 / 600, 0.1, 10.0);
    gl.uniformMatrix4fv(mProjectionULoc, gl.FALSE, mProjection);

  }


  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  function draw(angle) {
    mat4.rotate(mWorld, identityMatrix, angle, [1, 1, 0]);
    mat4.rotate(mWorld, mWorld, angle * 1.25, [1, 0, 0]);
    gl.uniformMatrix4fv(mWorldULoc, gl.FALSE, mWorld);
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

  }


  return {
    init: function(id) {
      var canvas = document.getElementById(id);

      gl = canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl") ||
        canvas.getContext("webkit-3d") ||
        canvas.getContext("moz-webgl");

      gl.enable(gl.DEPTH_TEST);
      gl.frontFace(gl.CCW);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      loadShaderProgram();
      setupGeometry();

      var angle;
      var loop = function() {
        angle = performance.now() / 1000 / 6 * Math.PI * 2;

        clear();
        draw(angle);

        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  };

}());
