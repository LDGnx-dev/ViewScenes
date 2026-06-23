# Sakura Twilight — 3D Interactive Diorama

Un diorama tridimensional que representa un paisaje contemplativo bajo un cerezo japonés (*Sakura*). El proyecto transiciona orgánicamente a través de tres fases temporales (Día, Tarde y Noche) mientras dos figuras contemplan el entorno iluminadas por corazones

Desarrollado con **React Three Fiber (R3F)** y **Three.js**, optimizado para garantizar tasas de refresco estables en dispositivos móviles.

---

## Características Principales

- **Simulación Dinámica de Viento:** Sistema de partículas vegetativas que reaccionan a ondas senoidales en tiempo real.
- **Ciclo de Luz Orgánico:** Transición suavizada (*lerp*) de iluminación ambiental, direccional y materiales adaptativos según la fase del día.
- **Atmósfera Lumínica:** Nubes procedurales volumétricas y emisores de luz de neón focalizados en los núcleos del diorama.
- **Estética Minimalista:** Siluetas integradas en el entorno tridimensional.

## Optimizaciones para Web Móvil

Para asegurar un rendimiento fluido a 60 FPS estables en dispositivos sin comprometer la densidad visual se implementaron las siguientes técnicas gráficas:

1. **Instanciación por Clúster (Geometría Unificada):** En lugar de renderizar más de 22,000 instancias individuales de geometría de césped, se diseñó un ramillete compuesto estático de 3 briznas por nodo. Esto redujo los ciclos del bucle en la CPU en un **80%**, manteniendo una densidad idéntica con solo 4,500 instancias JSX.
2. **Gestión del Buffer de Profundidad (`renderOrder`):** Control estricto de las capas de dibujo de WebGL para forzar al césped a cubrir parcialmente la base de las figuras en primer plano de forma nativa, evitando cálculos pesados de colisión tridimensional.
3. **Control de Z-Fighting:** Muestreo esférico controlado con desfases milimétricos en el eje vertical (`y`) para los pétalos caídos en la colina.

## Stack Tecnológico

- **Framework Principal:** React (Vite)
- **Gráficos 3D:** Three.js
- **Abstracción React:** @react-three/fiber
- **Matemáticas Vectoriales:** Multiplicación matricial nativa de Three.js

---

## Instalación y Desarrollo Local

Clona el repositorio e instala las dependencias para ejecutar el entorno de desarrollo local:

```bash
# Clonar el proyecto
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)

# Entrar al directorio
cd tu-repositorio

# Instalar dependencias
npm install

# Correr servidor local (Vite)
npm run dev
