var SHADERS = {
  vertex: null,
  fragment: null
};


var APP = (function() {
  var gl;
  var program;

  var mWorld;
  var mView;
  var mProjection;
  var mWorldULoc;

  var cubeIndices;

  var vertices;
  var indices;
  var texcoords;
  var image;

  function init_gl() {
    var canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      canvas.getContext("webkit-3d") ||
      canvas.getContext("moz-webgl");
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }


  function load_resources(callback) {
    var resource_count = 4;

    var loaded = function() {
      resource_count -= 1;
      if(resource_count == 0)
        callback();
    }

    UTIL.load_resource("5.vs", function(msg, data) {
      if(data == null)
        console.log(msg);
      else {
        SHADERS.vertex = data;
        loaded();
      }
    });
    UTIL.load_resource("5.fs", function(msg, data) {
      if(data == null)
        console.log(msg);
      else {
        SHADERS.fragment = data;
        loaded();
      }
    });
    UTIL.load_resource("ironman.json", function(msg, data) {
      if(data == null)
        console.log(msg);
      else {
        vertices = data.meshes[0].vertices;
        indices = [].concat.apply([], data.meshes[0].faces);
        texcoords = data.meshes[0].texturecoords[0];
        loaded();
      }
    });
    UTIL.load_image("ironman.png", function(msg, data) {
      image = data;
      loaded();
    });
  }


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


  function setupGeometry(vertices, indices, texcoords) {

    // vertex data
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    var vPosLoc = gl.getAttribLocation(program, "vPos");
    gl.vertexAttribPointer(vPosLoc, 3, gl.FLOAT, gl.FALSE, 
        3 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(vPosLoc);
    

    // index data
		var ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // texture data
    var tbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    var vTexCoordLoc = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoordLoc, 2, gl.FLOAT, gl.FALSE, 
        2 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(vTexCoordLoc);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); 

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);



    // matrix data
    mWorldULoc = gl.getUniformLocation(program, "mWorld");
    mWorld = new Float32Array(16);
    mat4.identity(mWorld);
    gl.uniformMatrix4fv(mWorldULoc, gl.FALSE, mWorld);

    var mViewULoc = gl.getUniformLocation(program, "mView");
    mView = new Float32Array(16);
    mat4.lookAt(mView, [0.0, 3.0, -2.5], [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]);
    gl.uniformMatrix4fv(mViewULoc, gl.FALSE, mView);

    var mProjectionULoc = gl.getUniformLocation(program, "mProjection");
    mProjection = new Float32Array(16);
    mat4.perspective(mProjection, glMatrix.toRadian(45.0), 800 / 600, 0.1, 10.0);
    gl.uniformMatrix4fv(mProjectionULoc, gl.FALSE, mProjection);

  }


  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);

  function draw(angle) {
    mat4.rotate(mWorld, identityMatrix, glMatrix.toRadian(90.0), [-1, 0, 0]);
    mat4.rotate(mWorld, mWorld, angle, [0, 0, 1]);
    gl.uniformMatrix4fv(mWorldULoc, gl.FALSE, mWorld);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }


  function run_loop() {

    var angle;
    var loop = function() {
      angle = performance.now() / 1000 / 6 * Math.PI * 2;

      clear();
      draw(angle);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }


  return {
    init: function(id) {

      load_resources(function() {
        init_gl();

        loadShaderProgram();
        setupGeometry(vertices, indices, texcoords);

        run_loop();
      });
    }
  };

}());
