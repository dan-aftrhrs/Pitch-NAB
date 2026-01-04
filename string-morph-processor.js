class StringMorphProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "tension", defaultValue: 0.3, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "damping", defaultValue: 0.6, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "excitation", defaultValue: 0.4, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "material", defaultValue: 0.5, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "freq", defaultValue: 261.63, minValue: 20.0, maxValue: 2000.0, automationRate: "k-rate" },
      { name: "gate", defaultValue: 0.0, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    this.sr = sampleRate;
    this.maxDelay = Math.ceil(this.sr / 20) + 1024;
    this.delayLine = new Float32Array(this.maxDelay);
    this.idx = 0;
    this.lpState = 0;
    
    // Body Resonances (Approximate Cello Formants)
    // Lower Q values to capture broader harmonics and prevent "whistling"
    this.bodyFilters = [
      { f: 110, q: 4, gain: 1.6, z1: 0, z2: 0, y1: 0, y2: 0 },
      { f: 185, q: 3.5, gain: 1.2, z1: 0, z2: 0, y1: 0, y2: 0 },
      { f: 310, q: 3, gain: 1.0, z1: 0, z2: 0, y1: 0, y2: 0 }
    ];

    this.dc_x1 = 0;
    this.dc_y1 = 0;
    this.rng = 0x12345678;
  }

  noise() {
    let x = this.rng | 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.rng = x;
    return ((x >>> 0) / 4294967295) * 2 - 1;
  }

  // Classic Bow Table mapping for stick-slip friction
  bowTable(v) {
    const sample = Math.abs(v) + 0.75;
    return Math.pow(sample, -4.0);
  }

  softClip(x) {
    if (x <= -1.25) return -0.8;
    if (x >= 1.25) return 0.8;
    return x - (x * x * x) / 5.0;
  }

  processBiquad(x, state, f, q) {
    const w0 = 2 * Math.PI * f / this.sr;
    const alpha = Math.sin(w0) / (2 * q);
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;

    const y = (b0/a0)*x + (b1/a0)*state.z1 + (b2/a0)*state.z2 - (a1/a0)*state.y1 - (a2/a0)*state.y2;
    state.z2 = state.z1;
    state.z1 = x;
    state.y2 = state.y1;
    state.y1 = y;
    return y;
  }

  process(inputs, outputs, parameters) {
    const out = outputs[0][0];
    if (!out) return true;

    const tension = parameters.tension[0];
    const damping = parameters.damping[0];
    const excitation = parameters.excitation[0];
    const material = parameters.material[0];
    const freq = parameters.freq[0];
    const gate = parameters.gate[0];

    const delaySamples = this.sr / freq;
    
    // Smooth loop gain transition
    let loopGain = 0.994 + (damping * 0.005);
    if (loopGain > 0.9997) loopGain = 0.9997;

    const lpCoeff = 0.06 + (tension * 0.88);

    for (let i = 0; i < out.length; i++) {
      const readIdx = (this.idx - delaySamples + this.maxDelay) % this.maxDelay;
      const i0 = Math.floor(readIdx);
      const i1 = (i0 + 1) % this.maxDelay;
      const frac = readIdx - i0;
      
      const sig = this.delayLine[i0] * (1 - frac) + this.delayLine[i1] * frac;

      let interaction = 0;
      if (gate > 0.001) {
        // Friction model
        const bowVelocity = 0.06 + (gate * excitation * 0.3);
        const bowPressure = 0.35 + (excitation * 0.55);
        const velDiff = bowVelocity - sig;
        
        // Apply friction force
        const friction = velDiff * this.bowTable(velDiff) * bowPressure;
        
        // Mechanical texture
        const bowNoise = this.noise() * 0.008 * gate;
        interaction = friction + bowNoise;
      }

      let nextVal = (sig + interaction) * loopGain;
      // Internal hard limit to prevent instability
      nextVal = Math.max(-1.8, Math.min(1.8, nextVal));
      
      this.lpState = (lpCoeff * nextVal) + ((1 - lpCoeff) * this.lpState);
      
      this.delayLine[this.idx] = this.lpState;
      this.idx = (this.idx + 1) % this.maxDelay;

      // Resonance modeling
      let bodySig = 0;
      const saturation = this.softClip(this.lpState * 1.6);
      for (const filter of this.bodyFilters) {
        bodySig += this.processBiquad(saturation, filter, filter.f, filter.q) * filter.gain;
      }

      const blend = 0.3 + (material * 0.65);
      let output = (this.lpState * (1 - blend)) + (bodySig * blend);

      // Final DC removal and gain
      const dc = output - this.dc_x1 + 0.996 * this.dc_y1;
      this.dc_x1 = output;
      this.dc_y1 = dc;

      out[i] = this.softClip(dc * 1.8) * 0.5;
    }

    return true;
  }
}

registerProcessor("string-morph-processor", StringMorphProcessor);