uniform float uTime;
uniform float uTransition; // 0.0 Atardecer, 1.0 Noche
varying vec2 vUv;

// Función de ruido simple para dar textura orgánica
float hash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.xyz, p.yzx + 19.19);
    return fract(p.x * p.y * p.z);
}

// Ruido 3D para deformar las nubes de hojas
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

// Matriz de rotación para las ramas del árbol
void rotate(inout vec2 p, float a) {
    p = cos(a) * p + sin(a) * vec2(p.y, -p.x);
}

// SDF del Árbol Fractal y sus hojas
float map(vec3 p, out int matId) {
    float d = 1e5;
    matId = 0; // 1: Tronco, 2: Hojas, 3: Colina
    
    // --- 1. Terreno (Colina suave) ---
    float hill = p.y + 2.0 + sin(p.x * 0.4) * 0.3 * cos(p.z * 0.4);
    if (hill < d) { d = hill; matId = 3; }
    
    // --- 2. Estructura del Árbol (Space Folding) ---
    vec3 treeP = p - vec3(0.0, -1.8, 0.0); // Origen en la colina
    float thickness = 0.22;
    
    for (int i = 0; i < 6; i++) {
        // Dibujamos el segmento del tronco/rama actual (Cilindro)
        float branch = length(treeP.xz) - thickness;
        float h = treeP.y;
        branch = max(branch, h - 1.2); // Altura de la rama
        branch = max(branch, -h);
        
        if (branch < d) { d = branch; matId = 1; }
        
        // Posicionamos el espacio para la siguiente ramificación (Máximo 30 grados)
        treeP.y -= 1.0;
        treeP.x = abs(treeP.x); // Duplica el espacio a izquierda y derecha
        rotate(treeP.xy, 0.42); // Inclinación orgánica de las ramas (aprox 24°)
        rotate(treeP.zy, 0.15); // Añade profundidad 3D
        
        thickness *= 0.65; // La rama se vuelve más delgada
    }
    
    // --- 3. Nubes de Hojas Volumétricas ---
    // Colocamos las hojas en el espacio superior donde terminaron las ramas
    vec3 leafP = p - vec3(0.0, 0.5, 0.0);
    float leavesCloud = length(leafP) - 1.6; 
    // Deformamos la esfera con ruido para crear la textura de miles de pétalos
    leavesCloud -= noise(leafP * 4.5 + uTime * 0.2) * 0.35;
    
    if (leavesCloud < d) { d = leavesCloud; matId = 2; }
    
    return d;
}

void main() {
    // Configuración de la Cámara Raymarching
    vec2 uv = vUv - 0.5;
    vec3 ro = vec3(0.0, 0.0, 4.5); // Posición del ojo
    vec3 rd = normalize(vec3(uv, -1.0)); // Dirección del rayo
    
    // --- FONDO DINÁMICO (Cielo del Atardecer a la Noche) ---
    vec3 sunsetSky = mix(vec3(0.95, 0.35, 0.1), vec3(0.15, 0.15, 0.35), vUv.y);
    vec3 nightSky = mix(vec3(0.02, 0.02, 0.08), vec3(0.05, 0.05, 0.18), vUv.y);
    vec3 skyColor = mix(sunsetSky, nightColor, uTransition);
    
    // Dibujar Luna y Saturno matemáticos en el cielo
    if (uTransition > 0.2) {
        float moon = smoothstep(0.04, 0.038, length(vUv - vec2(0.8, 0.85)));
        skyColor = mix(skyColor, vec3(1.0, 0.98, 0.9), moon * uTransition);
        
        float saturn = smoothstep(0.015, 0.013, length(vUv - vec2(0.88, 0.78)));
        skyColor = mix(skyColor, vec3(0.85, 0.75, 0.6), saturn * uTransition);
    }
    
    // --- EJECUCIÓN DEL RAYMARCHING ---
    float t = 0.0;
    int matId = 0;
    vec3 p;
    
    for (int i = 0; i < 80; i++) {
        p = ro + rd * t;
        float res = map(p, matId);
        if (res < 0.001 || t > 10.0) break;
        t += res;
    }
    
    // --- ILUMINACIÓN Y COLORIZACIÓN ---
    vec3 color = skyColor;
    
    if (t < 10.0) {
        // Cálculo de normales básico para las sombras nativas de la GPU
        vec2 eps = vec2(0.002, 0.0);
        int dummyId;
        vec3 n = normalize(vec3(
            map(p + eps.xyy, dummyId) - map(p - eps.xyy, dummyId),
            map(p + eps.yxy, dummyId) - map(p - eps.yxy, dummyId),
            map(p + eps.yyx, dummyId) - map(p - eps.yyx, dummyId)
        ));
        
        // Dirección de la luz del atardecer (Viene desde atrás a la izquierda)
        vec3 lightDir = normalize(vec3(-1.0, 0.4, 0.8));
        float diff = max(dot(n, lightDir), 0.0);
        
        if (matId == 1) { // Tronco (Marrón silueta)
            color = mix(vec3(0.15, 0.08, 0.06), vec3(0.35, 0.2, 0.15), diff);
        } 
        else if (matId == 2) { // Hojas (Rosa Sakura Volumétrico)
            vec3 leafBase = vec3(0.95, 0.65, 0.72); // Tono algodón de la imagen
            color = mix(leafBase * 0.4, leafBase, diff + 0.2);
            // Agregamos un brillo sutil en los bordes para el efecto mágico
            color += vec3(1.0, 0.85, 0.9) * pow(1.0 - max(dot(n, -rd), 0.0), 4.0) * 0.3;
        } 
        else if (matId == 3) { // Colina (Pasto en penumbra)
            color = mix(vec3(0.04, 0.06, 0.04), vec3(0.15, 0.22, 0.12), diff);
        }
    }
    
    gl_FragColor = vec4(color, 1.0);
}