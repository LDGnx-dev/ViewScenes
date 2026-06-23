uniform float uTransition;
uniform vec2 uCloudOffset; // Uniform inyectado para la aleatoriedad por recarga
varying vec2 vUv;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float nebulaNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i + vec2(0.0,0.0)), hash21(i + vec2(1.0,0.0)), f.x),
               mix(hash21(i + vec2(0.0,1.0)), hash21(i + vec2(1.0,1.0)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float amt = 0.5;
    for (int i = 0; i < 4; i++) {
        v += amt * nebulaNoise(p);
        p *= 2.0;
        amt *= 0.5;
    }
    return v;
}

void main() {
    // ==========================================
    // 1. GRADIENTES DEL CIELO (DÍA / ATARDECER / NOCHE)
    // ==========================================
    vec3 dayBottom = vec3(0.60, 0.82, 0.98);
    vec3 dayTop    = vec3(0.25, 0.55, 0.85);
    vec3 daySky    = mix(dayBottom, dayTop, vUv.y);
    
    vec3 sunsetBottom = vec3(0.98, 0.38, 0.08);
    vec3 sunsetMiddle = vec3(0.72, 0.15, 0.24);
    vec3 sunsetTop    = vec3(0.18, 0.10, 0.28);
    vec3 sunsetSky    = mix(mix(sunsetBottom, sunsetMiddle, vUv.y), sunsetTop, smoothstep(0.4, 1.0, vUv.y));
    
    vec3 nightBottom  = vec3(0.012, 0.035, 0.09);
    vec3 nightTop     = vec3(0.002, 0.004, 0.01);
    vec3 nightSky     = mix(nightBottom, nightTop, vUv.y);
    
    vec3 finalSky;
    if (uTransition <= 0.4) {
        float t = uTransition / 0.4;
        finalSky = mix(daySky, sunsetSky, smoothstep(0.0, 1.0, t));
    } else {
        float t = (uTransition - 0.4) / 0.6;
        finalSky = mix(sunsetSky, nightSky, smoothstep(0.0, 1.0, t));
    }
    
    // ==========================================
    // 2. NUBES GIGANTES Y ALEATORIAS
    // ==========================================
    float nightFactor = smoothstep(0.3, 0.8, uTransition);
    float cloudFactor = 1.0 - nightFactor;
    
    if (cloudFactor > 0.01) {
        // CORRECCIÓN: Bajamos la frecuencia a 1.4 en X para que las nubes sean enormes
        // E inyectamos uCloudOffset para romper el patrón fijo en cada carga
        vec2 cloudUv = vec2(vUv.x * 1.4, vUv.y * 3.2) + uCloudOffset;
        
        float d = fbm(cloudUv);
        // Ajustamos la densidad de la máscara para mayor visibilidad
        float cloudMask = smoothstep(0.35, 0.62, d * (vUv.y + 0.35));
        
        if (cloudMask > 0.0) {
            // Falso volumen por relieve sombreado desplazado
            float dShadow = fbm(cloudUv + vec2(-0.05, -0.06));
            float shadowDetail = smoothstep(0.35, 0.65, dShadow);
            
            vec3 cloudLightDay   = vec3(1.0, 0.98, 0.96);
            vec3 cloudShadowDay  = vec3(0.65, 0.74, 0.84);
            
            vec3 cloudLightSun   = vec3(1.0, 0.75, 0.48);
            vec3 cloudShadowSun  = vec3(0.35, 0.16, 0.24);
            
            vec3 currentCloudLight  = mix(cloudLightDay, cloudLightSun, min(uTransition / 0.4, 1.0));
            vec3 currentCloudShadow = mix(cloudShadowDay, cloudShadowSun, min(uTransition / 0.4, 1.0));
            
            vec3 finalCloudColor = mix(currentCloudShadow, currentCloudLight, shadowDetail);
            
            finalSky = mix(finalSky, finalCloudColor, cloudMask * cloudFactor * 0.85);
        }
    }
    
    // ==========================================
    // 3. ELEMENTOS DE LA NOCHE (LUNA, SATURNO, ESTRELLAS)
    // ==========================================
    if (uTransition > 0.3) {
        float nightGlow = smoothstep(0.3, 1.0, uTransition);

        // Vía Láctea
        vec2 nebulaUv = vec2(vUv.x * 2.2 - vUv.y * 1.2, vUv.y * 2.8);
        float nebula = fbm(nebulaUv * 1.5);
        vec3 nebulaColor = vec3(0.08, 0.20, 0.45) * smoothstep(0.15, 0.65, nebula);
        finalSky += nebulaColor * nightGlow * 0.45;

        // Estrellas
        vec2 starGrid = vUv * 200.0;
        vec2 id = floor(starGrid);
        vec2 localUv = fract(starGrid) - 0.5;
        float n = hash21(id);
        if (n > 0.982) {
            float starRadius = 0.05 + (n - 0.982) * 5.0;
            float starShape = smoothstep(starRadius, starRadius - 0.06, length(localUv));
            vec3 sCol = (n > 0.995) ? vec3(1.0, 0.88, 0.82) : vec3(0.92, 0.96, 1.0);
            finalSky += (starShape * sCol * 0.85) * nightGlow;
        }

        // Luna esférica pulida
        vec2 moonCenter = vec2(0.74, 0.76);
        float distToMoon = length(vUv - moonCenter);
        float moonGlow = smoothstep(0.18, 0.0, distToMoon);
        finalSky += vec3(0.88, 0.93, 1.0) * moonGlow * 0.22 * nightGlow;
        
        float moonRadius = 0.045;
        if (distToMoon < moonRadius) {
            vec2 mUv = (vUv - moonCenter) / moonRadius;
            float r2 = dot(mUv, mUv);
            float z = sqrt(1.0 - r2);
            vec2 sphereUv = mUv / (z + 0.5);

            float maria = fbm(sphereUv * 8.0 + 1.5);
            float fineCraters = fbm(sphereUv * 28.0) * 0.12;
            float rayPattern = smoothstep(0.4, 0.0, length(sphereUv - vec2(-0.2, -0.3)));
            float rays = hash21(floor(sphereUv * 45.0)) * rayPattern * 0.15;

            vec3 moonBaseColor = vec3(0.96, 0.96, 0.93);
            moonBaseColor -= vec3(smoothstep(0.3, 0.7, maria) * 0.22);
            moonBaseColor += vec3(rays);
            moonBaseColor -= vec3(fineCraters);

            float terminator = smoothstep(-0.8, 0.3, mUv.x);
            vec3 earthshineColor = vec3(0.04, 0.06, 0.12);
            vec3 finalMoonSurface = mix(earthshineColor, moonBaseColor, terminator);
            
            float edgeAA = smoothstep(moonRadius, moonRadius - 0.001, distToMoon);
            finalSky = mix(finalSky, finalMoonSurface, edgeAA * nightGlow);
        }

        // Saturno
        vec2 sPos = vUv - vec2(0.86, 0.72);
        float angle = -0.38;
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 rPos = rot * sPos;
        float planet = smoothstep(0.012, 0.010, length(rPos));
        float ringShape = length(rPos * vec2(1.0, 2.7));
        float outerRing = smoothstep(0.026, 0.024, ringShape) * smoothstep(0.018, 0.020, ringShape);
        float innerRing = smoothstep(0.017, 0.016, ringShape) * smoothstep(0.012, 0.013, ringShape);
        float totalRings = max(outerRing, innerRing * 0.5);
        if (length(sPos) < 0.03) {
            finalSky = mix(finalSky, vec3(0.88, 0.78, 0.58), max(planet, totalRings * 0.85) * nightGlow);
        }
    }
    
    gl_FragColor = vec4(finalSky, 1.0);
}