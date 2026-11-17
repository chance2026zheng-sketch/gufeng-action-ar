/* Remove the near-white video backdrop at render time; retain the original MP4s. */
AFRAME.registerShader('white-key', {
  schema: {src: {type: 'map', is: 'uniform'}},
  vertexShader: [
    'varying vec2 vUV;',
    'void main() { vUV = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D src;',
    'varying vec2 vUV;',
    'void main() {',
    '  vec4 color = texture2D(src, vUV);',
    '  float white = min(color.r, min(color.g, color.b));',
    '  float alpha = 1.0 - smoothstep(0.92, 0.98, white);',
    '  if (alpha < 0.01) discard;',
    '  gl_FragColor = vec4(color.rgb, color.a * alpha);',
    '}'
  ].join('\n')
});
