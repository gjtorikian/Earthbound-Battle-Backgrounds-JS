let frameID = -1
export const SNES_WIDTH = 256
export const SNES_HEIGHT = 224

class Recorder {
  constructor() {
    this.setToStart = false;
    this.recording = false;
    this.done = false;
    this.chunks = [];
    this.rec = {};
    this.ele = {};
  }

  record(ele) {
    if (this.recording === false && this.setToStart === false) {
      console.log("Recording beginning on next path");
      this.setToStart = true;
      this.recording = false;
      this.done = false;
      this.ele = ele;
    } else {
      console.log("Recording in progress, not resetting");
    }
  }

  isReadyToStart() {
    return this.setToStart && !this.recording;
  }

  setAsRecordingBegan(canvas) {
    this.setToStart = false;
    this.recording = true;
    this.chunks = []; // here we will store our recorded media chunks (Blobs)
    const stream = canvas.captureStream(); // grab our canvas MediaStream
    this.rec = new MediaRecorder(stream); // init the recorder

    // every time the recorder has new data, we will store it in our array
    this.rec.ondataavailable = e => chunks.push(e.data);
    // only when the recorder stops, we construct a complete Blob from all the chunks
    this.rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/webm'}));
    this.rec.start();

  }

  exportVid(blob) {
    const vid = document.createElement('video');
    vid.src = URL.createObjectURL(blob);
    vid.controls = true;
    this.ele.appendChild(vid);
    const a = document.createElement('a');
    a.download = 'earthbound-battle-background.webm';
    a.href = vid.src;
    a.textContent = 'download the earthbound battle background.';
    this.ele.appendChild(a);
  }

  isReadyToEnd() {
    return this.recording && !this.done;
  }

  setAsRecordingDone() {
    this.recording = false;
    this.done = true;
    this.rec.stop();
  }

}

export default class Engine {
  constructor (layers = [], opts) {
    this.layers = layers
    this.fps = opts.fps
    this.aspectRatio = opts.aspectRatio
    this.frameSkip = opts.frameSkip
    this.alpha = opts.alpha
    this.canvas = opts.canvas
    this.tick = 0
    this.recorder = new Recorder()
  }
  animate (debug) {
    let then = Date.now()
    let elapsed
    const fpsInterval = 1000 / this.fps
    let bitmap
    const canvas = this.canvas
    const context = canvas.getContext('2d')
    if (this.layers[0].entry && !this.layers[1].entry) {
      this.alpha[0] = 1
      this.alpha[1] = 0
    }
    if (!this.layers[0].entry && this.layers[1].entry) {
      this.alpha[0] = 0
      this.alpha[1] = 1
    }
    context.imageSmoothingEnabled = false
    canvas.width = SNES_WIDTH
    canvas.height = SNES_HEIGHT
    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    const drawFrame = () => {
      frameID = requestAnimationFrame(drawFrame)
      const now = Date.now()
      elapsed = now - then
      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval)
        for (let i = 0; i < this.layers.length; ++i) {
          if (debug) {
            console.log(canvas.toDataURL())
          }
          bitmap = this.layers[i].overlayFrame(image.data, this.aspectRatio, this.tick, this.alpha[i], i === 0)
        }
        this.tick += this.frameSkip
        if (this.tick > this.fps * 2) {
          this.tick = 0;
          if (this.recorder.isReadyToStart()) {
            this.recorder.setAsRecordingBegan(canvas);
          } else if (this.recorder.isReadyToEnd()) {
            this.recorder.setAsRecordingDone();
          }
        }
        image.data.set(bitmap)
        context.putImageData(image, 0, 0)
      }
    }
    if (frameID > 0) {
      global.cancelAnimationFrame(frameID)
    }
    drawFrame()
  }

  save(htmlElementToAttachTo) {
    this.recorder.record(htmlElementToAttachTo);
  }
}
