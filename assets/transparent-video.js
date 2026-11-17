/* Decode precomputed alpha from the right half; preserve all original subject colors. */
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
    '  vec4 color = texture2D(src, vec2(vUV.x * 0.5, vUV.y));',
    '  float alpha = texture2D(src, vec2(0.5 + vUV.x * 0.5, vUV.y)).r;',
    '  if (alpha < 0.01) discard;',
    '  gl_FragColor = vec4(color.rgb, color.a * alpha);',
    '}'
  ].join('\n')
});
