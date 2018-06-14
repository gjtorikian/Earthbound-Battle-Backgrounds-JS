import { readBlock } from './rom'
export const HORIZONTAL = 1
export const HORIZONTAL_INTERLACED = 2
export const VERTICAL = 3
/* The data in effects is stored as uint8, but when we compute with them, we need to cast the results to int16. */
function asInt16 (value) {
  return new Int16Array([value])[0]
}
export default class DistortionEffect {
  constructor (index = 0) {
    this.data = new Uint8Array(17)
    this.read(index)
  }
  /* Is not caching distortion effects doing any harm? */
  //   static handler() {
  //     for (let i = 0; i < 135; ++i) {
  //       ROM.add(new DistortionEffect(i));
  //     }
  //   }
  static sanitize (type) {
    if (type !== HORIZONTAL && type !== VERTICAL) {
      return HORIZONTAL_INTERLACED
    } else {
      return type
    }
  }
  get type () {
    return DistortionEffect.sanitize(this.data[2])
  }
  set type (value) {
    this.data[2] = DistortionEffect.sanitize(this.data[2])
  }
  //   get duration() {
  //     return asInt16(this.data[0] + (this.data[1] << 8));
  //   }
  //   set duration(value) {
  //     this.data[0] = value;
  //     this.data[1] = value >> 8;
  //   }
  get frequency () {
    return asInt16(this.data[3] + (this.data[4] << 8))
  }
  set frequency (value) {
    this.data[3] = value
    this.data[4] = value >> 8
  }
  get amplitude () {
    return asInt16(this.data[5] + (this.data[6] << 8))
  }
  set amplitude (value) {
    this.data[5] = value
    this.data[6] = value >> 8
  }
  get compression () {
    return asInt16(this.data[8] + (this.data[9] << 8))
  }
  set compression (value) {
    this.data[8] = value
    this.data[9] = value >> 8
  }
  get frequencyAcceleration () {
    return asInt16(this.data[10] + (this.data[11] << 8))
  }
  set frequencyAcceleration (value) {
    this.data[10] = value
    this.data[11] = value >> 8
  }
  get amplitudeAcceleration () {
    return asInt16(this.data[12] + (this.data[13] << 8))
  }
  set amplitudeAcceleration (value) {
    this.data[12] = value
    this.data[13] = value >> 8
  }
  get speed () {
    return asInt16(this.data[14])
  }
  set speed (value) {
    this.data[14] = value
  }
  get compressionAcceleration () {
    return asInt16(this.data[15] + (this.data[16] << 8))
  }
  set compressionAcceleration (value) {
    this.data[15] = value
    this.data[16] = value >> 8
  }
  read (index) {
    const main = readBlock(0xF708 + index * 17)
    for (let i = 0; i < 17; ++i) {
      this.data[i] = main.readInt16()
    }
  }
}
