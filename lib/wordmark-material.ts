import { Color, ShaderMaterial, Vector2 } from "three";
import { WAVE } from "./wordmark-model";

const glsl = (n: number) => n.toFixed(9);

/** Rigid block motion and simple studio lighting in a single material/draw. */
export function createWordmarkMaterial() {
  return new ShaderMaterial({
    name: "SiamoWave",
    uniforms: {
      waveAge: { value: WAVE.duration },
      waveOrigin: { value: new Vector2(-8.4, 0) },
      frontColor: { value: new Color(0x111416) },
      sideColor: { value: new Color(0x626d78) },
    },
    vertexShader: `
      attribute vec2 blockCenter;
      uniform float waveAge;
      uniform vec2 waveOrigin;
      varying vec3 vNormal;
      varying float vCap;
      void main() {
        float wave = 0.0;
        if (waveAge > 0.0 && waveAge < ${glsl(WAVE.duration)}) {
          float offset = distance(blockCenter, waveOrigin) - waveAge * ${glsl(WAVE.speed)};
          float spread = offset / ${glsl(WAVE.width)};
          wave = sin(offset / ${glsl(WAVE.wavelength)}) * exp(-spread * spread)
            * (1.0 - waveAge / ${glsl(WAVE.duration)}) * smoothstep(0.0, ${glsl(WAVE.attack)}, waveAge);
        }
        float ax = wave * ${glsl(WAVE.roll)}, az = wave * ${glsl(WAVE.tilt)};
        float cx = cos(ax), sx = sin(ax), cz = cos(az), sz = sin(az);
        mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);
        mat3 rz = mat3(cz, sz, 0.0, -sz, cz, 0.0, 0.0, 0.0, 1.0);
        mat3 rotation = rz * rx;
        vec3 centre = vec3(blockCenter, 0.0);
        vec3 transformed = rotation * (position - centre) + centre
          + vec3(0.0, wave * ${glsl(WAVE.rise)}, wave * ${glsl(WAVE.depth)});
        vNormal = normalMatrix * rotation * normal;
        vCap = abs(normal.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 frontColor;
      uniform vec3 sideColor;
      varying vec3 vNormal;
      varying float vCap;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 key = normalize(vec3(-0.35, 1.15, 0.7));
        vec3 fill = normalize(vec3(0.7, 0.15, -0.6));
        float diffuse = 0.5 + max(dot(n, key), 0.0) * 0.75 + max(dot(n, fill), 0.0) * 0.35;
        vec3 halfVector = normalize(key + vec3(0.0, 0.0, 1.0));
        float specular = pow(max(dot(n, halfVector), 0.0), 36.0) * mix(0.24, 0.055, vCap);
        vec3 color = mix(sideColor, frontColor, vCap) * diffuse + vec3(specular);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
