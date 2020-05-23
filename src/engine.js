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
    this.ccapture = {};
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

  isRecording() {
    return this.recording && !this.done;
  }

  frameAvailable(canvas, context, imageData) {
    if (this.isRecording()) {
      this.ccapture.capture(canvas);
    }
  }

  setAsRecordingBegan(canvas) {
    console.log("recording has begun");
    this.setToStart = false;
    this.recording = true;
    this.chunks = []; // here we will store our recorded media chunks (Blobs)
    this.ccapture = this.createCCapture();
    this.ccapture.start();
  }

  isReadyToEnd() {
    return this.recording && !this.done;
  }

  setAsRecordingDone() {
    console.log("recording is done");
    this.recording = false;
    this.done = true;
    this.ccapture.stop();
    this.ccapture.save(blob => this.exportGif(blob));
  }

  /**
   * Private Methods
   */

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

  exportGif(blob) {
    const gif = document.createElement('img');
    gif.src = URL.createObjectURL(blob);
    gif.controls = true;
    this.ele.appendChild(gif);
    const a = document.createElement('a');
    a.download = 'earthbound-battle-background.gif';
    a.href = gif.src;
    a.textContent = 'download the earthbound battle background.';
    this.ele.appendChild(a);
  }

  createCCapture() {
    // Create a ccapture that exports a WebM video
    var ccapture = new CCapture( { format: 'gif', workersPath: 'assets/', quality: 100, motionBlurFrames: 0, frameRate: 60 } );

    // Create a ccapture that exports an animated GIF
    // Notices you have to specify the path to the gif.worker.js 
    // var ccapture = new CCapture( { format: 'gif', workersPath: 'js/' } );

    return ccapture;
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
        image.data.set(bitmap)
        context.putImageData(image, 0, 0)
        this.recorder.frameAvailable(canvas, context, image);
        if (this.tick > this.fps * 2) {
          this.tick = 0;
          if (this.recorder.isReadyToStart()) {
            this.recorder.setAsRecordingBegan(canvas);
          } else if (this.recorder.isReadyToEnd()) {
            this.recorder.setAsRecordingDone();
          }
        }
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
