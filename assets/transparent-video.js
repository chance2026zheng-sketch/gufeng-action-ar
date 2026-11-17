/* Remove only pale background connected to the frame edge, preserving enclosed whites. */
AFRAME.registerComponent('transparent-video', {
  schema: {src: {type: 'selector'}},
  init: function () {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', {willReadFrequently: true});
    this.texture = new AFRAME.THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = AFRAME.THREE.SRGBColorSpace;
    this.material = new AFRAME.THREE.MeshBasicMaterial({map: this.texture, transparent: true, depthWrite: false, side: AFRAME.THREE.DoubleSide});
    this.lastTime = -1;
    this.bind = () => {const mesh = this.el.getObject3D('mesh'); if (mesh) mesh.material = this.material;};
    this.el.addEventListener('object3dset', this.bind);
    this.bind();
  },
  tick: function () {
    const v = this.data.src;
    if (!v || v.readyState < 2 || v.currentTime === this.lastTime) return;
    this.lastTime = v.currentTime;
    const w = Math.round(v.videoWidth * Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight)));
    const h = Math.round(v.videoHeight * Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight)));
    if (!w || !h) return;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.seen = new Uint8Array(w*h); this.queue = new Int32Array(w*h);
    }
    this.ctx.drawImage(v, 0, 0, w, h);
    const frame = this.ctx.getImageData(0, 0, w, h), d = frame.data;
    const seen = this.seen, queue = this.queue; seen.fill(0);
    let head = 0, tail = 0;
    const add = (i) => {
      if (seen[i]) return;
      seen[i] = 1;
      const p = i*4, lo = Math.min(d[p],d[p+1],d[p+2]), hi = Math.max(d[p],d[p+1],d[p+2]);
      if (lo >= 228 && hi-lo <= 20) queue[tail++] = i;
    };
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
    for(let y=1;y<h-1;y++){add(y*w);add(y*w+w-1);}
    while(head<tail){
      const i=queue[head++], x=i%w;
      d[i*4+3]=0;
      if(x>0)add(i-1); if(x<w-1)add(i+1);
      if(i>=w)add(i-w); if(i<w*(h-1))add(i+w);
    }
    this.ctx.putImageData(frame,0,0);
    this.texture.needsUpdate = true;
  },
  remove: function () {
    this.el.removeEventListener('object3dset',this.bind);
    this.texture.dispose(); this.material.dispose();
  }
});
