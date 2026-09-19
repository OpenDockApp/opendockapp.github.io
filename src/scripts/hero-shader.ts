// A small, dependency-free WebGL gradient. The CSS gradient remains if WebGL is unavailable.
const canvas = document.querySelector<HTMLCanvasElement>('.hero-shader');
if (canvas) initializeGradient(canvas);

function initializeGradient(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;
  const vertex = compile(gl, gl.VERTEX_SHADER, `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      float t = time * 0.12;
      vec2 p = uv;
      p.x += 0.12 * sin(uv.y * 5.0 + t);
      p.y += 0.10 * cos(uv.x * 4.0 - t * 0.8);
      float blue = exp(-7.0 * length((p - vec2(0.68 + 0.12 * sin(t), 0.43)) * vec2(1.0, 1.3)));
      float cyan = exp(-8.0 * length((p - vec2(0.28, 0.36 + 0.13 * cos(t))) * vec2(1.0, 1.2)));
      float violet = exp(-9.0 * length(p - vec2(0.56, 0.66 + 0.1 * sin(t * 0.7))));
      vec3 paper = vec3(0.969, 0.969, 0.949);
      vec3 color = paper;
      color = mix(color, vec3(0.39, 0.62, 0.99), blue * 0.43);
      color = mix(color, vec3(0.46, 0.85, 0.96), cyan * 0.32);
      color = mix(color, vec3(0.63, 0.66, 0.98), violet * 0.24);
      gl_FragColor = vec4(color, 1.0);
    }
  `);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let lost = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  function draw() {
    if (lost) return;
    gl!.uniform2f(resolution, canvas.width, canvas.height);
    gl!.uniform1f(time, elapsed / 1000);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
  }
  function tick(now: number) {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches || lost) return;
    if (now - previous >= 1000 / 30) {
      elapsed += Math.min(now - previous, 50);
      previous = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (visible && !document.hidden && !lost) {
      draw();
      if (!reducedMotion.matches) { previous = performance.now(); frame = requestAnimationFrame(tick); }
    }
  }
  const resize = new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    draw();
  });
  resize.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  canvas.addEventListener('webglcontextlost', () => { lost = true; cancelAnimationFrame(frame); });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); });
  window.addEventListener('pageshow', sync);
  sync();
}
function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}
