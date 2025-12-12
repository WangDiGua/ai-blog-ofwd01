import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../../context/store';

// --- Shaders (From your provided code) ---

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
uniform float uProgress;

// Uniforms for parameters
uniform float uDistortionIntensity;
uniform float uDistortionSpeed;
uniform float uDistortionScale;
uniform float uNoise1Weight;
uniform float uNoise2Weight;
uniform float uNoise3Weight;
uniform float uNoise2Scale;
uniform float uNoise3Scale;
uniform float uNoise2Speed;
uniform float uNoise3Speed;
uniform float uEdgeWidth;
uniform float uChromaticAberration;
uniform float uEdgeFog;
uniform float uVignetteIntensity;
uniform float uNormalMapInfluence;
uniform float uNormalMapScale;
uniform float uNormalMapOffset;
uniform float uFlowSpeed;
uniform float uFlowStrength;
uniform float uFbmSpeed;
uniform float uFbmAmplitude;
uniform float uFbmFrequency;
uniform float uFbmLacunarity;
uniform float uFbmGain;

varying vec2 vUv;

// ========== GRADIENT NOISE ==========
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289_2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float gradientNoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289_2(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion
float fbm(vec2 p, float time) {
  float value = 0.0;
  float amplitude = uFbmAmplitude;
  float frequency = uFbmFrequency;
  
  for(int i = 0; i < 5; i++) {
    value += amplitude * gradientNoise(p * frequency + time * uFbmSpeed);
    frequency *= uFbmLacunarity;
    amplitude *= uFbmGain;
  }
  return value;
}

// ========== NORMAL MAP GENERATION ==========
vec3 generateNormalMap(vec2 uv, float time) {
  float offset = uNormalMapOffset;
  
  float center = fbm(uv, time);
  float right = fbm(uv + vec2(offset, 0.0), time);
  float top = fbm(uv + vec2(0.0, offset), time);
  
  float dx = (right - center) / offset;
  float dy = (top - center) / offset;
  
  vec3 normal = normalize(vec3(-dx, -dy, 1.0));
  
  return normal * 0.5 + 0.5;
}

// ========== FROSTED GLASS DISTORTION ==========
vec2 getFrostedGlassDistortion(vec2 uv, float time, float intensity) {
  float noise1 = fbm(uv * uDistortionScale, time * uDistortionSpeed);
  float noise2 = fbm(uv * uDistortionScale * uNoise2Scale, time * uDistortionSpeed * uNoise2Speed);
  float noise3 = fbm(uv * uDistortionScale * uNoise3Scale, time * uDistortionSpeed * uNoise3Speed);
  
  vec2 distortion = vec2(noise1 * uNoise1Weight + noise2 * uNoise2Weight + noise3 * uNoise3Weight);
  
  float flowAngle = time * uFlowSpeed + noise1;
  distortion += vec2(cos(flowAngle), sin(flowAngle)) * uFlowStrength;
  
  return distortion * intensity;
}

// ========== POST-PROCESSING EFFECTS ==========
vec3 chromaticAberration(sampler2D tex, vec2 uv, vec2 direction, float strength) {
  vec2 offset = direction * strength;
  float r = texture2D(tex, uv + offset).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - offset).b;
  return vec3(r, g, b);
}

float vignette(vec2 uv, float intensity) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  return 1.0 - smoothstep(0.3, 0.8, dist) * intensity;
}

// ========== MAIN ==========
void main() {
  vec2 uv = vUv;
  
  // Scale UV to keep aspect ratio if needed, but for simple logo we keep it 1:1 mapped
  // float scale = 0.5;
  // uv = (uv - 0.5) / scale + 0.5;
  
  // Create animated progress mask
  float maskStart = uProgress - uEdgeWidth;
  float maskEnd = uProgress;
  float progressMask = smoothstep(maskStart, maskEnd, uv.x);
  
  // Generate normal map
  vec3 normalMap = generateNormalMap(uv * uNormalMapScale, uTime);
  
  // Get frosted glass distortion
  float distortionIntensity = uDistortionIntensity * progressMask;
  vec2 glassDistortion = getFrostedGlassDistortion(uv, uTime, distortionIntensity);
  
  // Apply normal map influence
  glassDistortion += (normalMap.xy - 0.5) * uNormalMapInfluence * progressMask;
  
  // Final distorted UV
  vec2 distortedUv = uv + glassDistortion;
  
  // Check bounds
  if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    // Sample texture with chromatic aberration
    vec2 aberrationDir = (normalMap.xy - 0.5) * 2.0;
    float aberrationStrength = uChromaticAberration * progressMask;
    vec3 color = chromaticAberration(uTexture, distortedUv, aberrationDir, aberrationStrength);
    
    // Add frosted glass fog effect
    float edgeFog = smoothstep(maskStart + 0.05, maskEnd - 0.05, uv.x);
    edgeFog = 1.0 - edgeFog;
    color = mix(color, vec3(1.0), edgeFog * uEdgeFog * progressMask);
    
    // Apply vignette
    float vig = vignette(distortedUv, uVignetteIntensity * progressMask);
    color *= vig;
    
    // Sample original texture alpha
    float alpha = texture2D(uTexture, distortedUv).a;
    
    gl_FragColor = vec4(color, alpha);
  }
}
`;

export const LiquidLogo = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);
    const { theme } = useStore();

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Setup Scene
        const width = 120; // Logo Width
        const height = 40; // Logo Height
        const scene = new THREE.Scene();
        
        const aspect = width / height;
        const frustumSize = 1;
        const camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            1000
        );
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // 2. Generate Text Texture dynamically
        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        if (!ctx) return;
        
        // Double resolution for crisp text
        textCanvas.width = width * 2;
        textCanvas.height = height * 2;
        
        ctx.font = '700 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = 'white'; // Keep white for shader, we use filter for coloring
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('iBlog', textCanvas.width / 2, textCanvas.height / 2);

        const texture = new THREE.CanvasTexture(textCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // 3. Create Mesh with Shader
        const geometry = new THREE.PlaneGeometry(aspect, 1, 32, 32);
        
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uTexture: { value: texture },
                uProgress: { value: 1.2 }, // Start "Clean" (uProgress > 1 means no distortion)
                // Tuned Parameters from your code
                uDistortionIntensity: { value: 0.08 },
                uDistortionSpeed: { value: 0.3 },
                uDistortionScale: { value: 8.0 },
                uNoise1Weight: { value: 0.5 },
                uNoise2Weight: { value: 0.3 },
                uNoise3Weight: { value: 0.2 },
                uNoise2Scale: { value: 2.0 },
                uNoise3Scale: { value: 4.0 },
                uNoise2Speed: { value: 0.7 },
                uNoise3Speed: { value: 0.5 },
                uEdgeWidth: { value: 0.15 },
                uChromaticAberration: { value: 0.003 },
                uEdgeFog: { value: 0.15 },
                uVignetteIntensity: { value: 0.2 },
                uNormalMapInfluence: { value: 0.02 },
                uNormalMapScale: { value: 4.0 },
                uNormalMapOffset: { value: 0.001 },
                uFlowSpeed: { value: 0.1 },
                uFlowStrength: { value: 0.2 },
                uFbmSpeed: { value: 0.1 },
                uFbmAmplitude: { value: 0.5 },
                uFbmFrequency: { value: 1.0 },
                uFbmLacunarity: { value: 2.0 },
                uFbmGain: { value: 0.5 },
            },
            transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // 4. Hover Animation Logic
        const handleMouseEnter = () => {
            if (animationRef.current) animationRef.current.kill();
            // Loop the distortion effect (clean -> distorted -> clean)
            animationRef.current = gsap.to(material.uniforms.uProgress, {
                value: 0, 
                duration: 2.5,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true
            });
        };

        const handleMouseLeave = () => {
            if (animationRef.current) animationRef.current.kill();
            // Return to clean state
            animationRef.current = gsap.to(material.uniforms.uProgress, {
                value: 1.2,
                duration: 0.5,
                ease: "power2.out"
            });
        };

        const container = containerRef.current;
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        // 5. Render Loop
        const clock = new THREE.Clock();
        let animationId: number;

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsedTime;
            renderer.render(scene, camera);
            animationId = requestAnimationFrame(tick);
        };

        tick();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            if (animationRef.current) animationRef.current.kill();
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            texture.dispose();
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    // Theme handling: 
    // In Light mode: invert to make it black. 
    // In Dark mode: keep it white.
    // Removed mix-blend-mode to prevent color shifts on scroll.
    return (
        <div 
            ref={containerRef} 
            className="w-[120px] h-[40px] select-none"
            style={{ 
                filter: theme === 'dark' ? 'none' : 'invert(1)',
                cursor: 'pointer'
            }}
        />
    );
};