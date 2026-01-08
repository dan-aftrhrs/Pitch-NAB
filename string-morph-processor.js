class StringEngineProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "tension", defaultValue: 0.5, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "decay", defaultValue: 0.1, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "detune", defaultValue: 0.0, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "impulseType", defaultValue: 0.0, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
      { name: "freq", defaultValue: 261.63, minValue: 20.0, maxValue: 2000.0, automationRate: "k-rate" },
      { name: "gate", defaultValue: 0.0, minValue: 0.0, maxValue: 1.0, automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    this.sr = sampleRate;
    this.maxDelay = Math.ceil(this.sr / 20) + 1024;
    
    // Dual delay lines for detuning effect
    this.delayLine1 = new Float32Array(this.maxDelay);
    this.delayLine2 = new Float32Array(this.maxDelay);
    
    this.idx1 = 0;
    this.idx2 = 0;
    
    this.lpState1 = 0;
    this.lpState2 = 0;
    
    this.rng = 0x12345678;
    this.dc_x1 = 0;
    this.dc_y1 = 0;
    
    // For impulse generation
    this.lastGate = 0;
    this.impulseTimer = 0;
  }

  noise() {
    let x = this.rng | 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.rng = x;
    return ((x >>> 0) / 4294967295) * 2 - 1;
  }

  softClip(x) {
    if (x <= -1.25) return -0.8;
    if (x >= 1.25) return 0.8;
    return x - (x * x * x) / 5.0;
  }

  process(inputs, outputs, parameters) {
    const out = outputs[0][0];
    if (!out) return true;

    const tension = parameters.tension[0]; // Controls LPF cutoff (loop brightness)
    const decay = parameters.decay[0];     // Controls duration of impulse burst
    const detune = parameters.detune[0];   // Controls pitch offset of 2nd string
    const impType = parameters.impulseType[0]; // 0: White, 0.5: Pink-ish, 1.0: Pulse
    const freq = parameters.freq[0];
    const gate = parameters.gate[0];

    const delay1 = this.sr / freq;
    // Detune adds up to ~1 semitone offset to the second string
    const detuneFactor = 1.0 + (detune * 0.06); 
    const delay2 = delay1 * detuneFactor;

    // Loop damping based on tension
    // OP-1 Tension often makes it brighter and tighter
    const lpCoeff = 0.01 + (tension * 0.9);
    const feedback = 0.992; // High feedback for string resonance

    for (let i = 0; i < out.length; i++) {
      // 1. Detect Gate Trigger for Impulse
      let impulse = 0;
      if (gate > 0.5 && this.lastGate <= 0.5) {
        this.impulseTimer = Math.floor(this.sr * (0.005 + decay * 0.08));
      }
      this.lastGate = gate;

      if (this.impulseTimer > 0) {
        if (impType < 0.33) {
          impulse = this.noise(); // White Noise
        } else if (impType < 0.66) {
          impulse = this.noise() * (this.impulseTimer / (this.sr * 0.1)); // Shaped Noise
        } else {
          // Pulse/Square-ish transient
          impulse = (this.impulseTimer % 20 > 10) ? 1 : -1;
        }
        this.impulseTimer--;
      }

      // --- String 1 ---
      const r1 = (this.idx1 - delay1 + this.maxDelay) % this.maxDelay;
      const i0_1 = Math.floor(r1);
      const i1_1 = (i0_1 + 1) % this.maxDelay;
      const f1 = r1 - i0_1;
      const sig1 = this.delayLine1[i0_1] * (1 - f1) + this.delayLine1[i1_1] * f1;
      
      this.lpState1 = (lpCoeff * (sig1 + impulse)) + ((1 - lpCoeff) * this.lpState1);
      this.delayLine1[this.idx1] = this.lpState1 * feedback;
      this.idx1 = (this.idx1 + 1) % this.maxDelay;

      // --- String 2 (Detuned) ---
      const r2 = (this.idx2 - delay2 + this.maxDelay) % this.maxDelay;
      const i0_2 = Math.floor(r2);
      const i1_2 = (i0_2 + 1) % this.maxDelay;
      const f2 = r2 - i0_2;
      const sig2 = this.delayLine2[i0_2] * (1 - f2) + this.delayLine2[i1_2] * f2;
      
      this.lpState2 = (lpCoeff * (sig2 + impulse)) + ((1 - lpCoeff) * this.lpState2);
      this.delayLine2[this.idx2] = this.lpState2 * feedback;
      this.idx2 = (this.idx2 + 1) % this.maxDelay;

      // Mix strings
      let mixed = (this.lpState1 + this.lpState2 * detune) * 0.5;
      
      // DC Block
      const dc = mixed - this.dc_x1 + 0.995 * this.dc_y1;
      this.dc_x1 = mixed;
      this.dc_y1 = dc;

      out[i] = this.softClip(dc * 2.5) * 0.6;
    }

    return true;
  }
}

registerProcessor("string-morph-processor", StringEngineProcessor);