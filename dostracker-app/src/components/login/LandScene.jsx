import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/**
 * Fond 3D du login — « carte topographique holographique » du foncier.
 *  - relief en courbes de niveau + grille, balayé par une onde de scan
 *  - 3 bornes lumineuses = le parcours d'un dossier (Courrier → SPFEI → Conservation)
 *  - des dossiers (documents) voyagent d'une borne à l'autre avec une traînée
 *  - étincelles, étoiles, bloom, caméra qui dérive + parallaxe souris
 */
const ORANGE = 0xf47920
const GREEN = 0x1fd070
const WHITE = 0xffffff

// Hauteur du relief — miroir exact de hf() dans le vertex shader (hors ondulation animée)
const height = (x, z) => 0.9 * Math.sin(x * 0.28) * Math.cos(z * 0.24) + 0.4 * Math.sin(x * 0.7 + z * 0.5)

const TERRAIN_VERT = /* glsl */ `
  uniform float uTime;
  varying float vH;
  varying vec3 vPos;
  float hf(vec2 p){ return 0.9*sin(p.x*0.28)*cos(p.y*0.24) + 0.4*sin(p.x*0.7+p.y*0.5); }
  void main(){
    vec3 p = position;
    float h = hf(p.xz) + 0.12*sin(length(p.xz)*1.5 - uTime*2.0);
    p.y = h; vH = h; vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const TERRAIN_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uOrange;
  uniform vec3 uGreen;
  varying float vH;
  varying vec3 vPos;
  void main(){
    float s = vH * 3.0;
    float f = fract(s);
    float w = fwidth(s);
    float contour = 1.0 - smoothstep(0.0, w * 1.4, min(f, 1.0 - f));

    vec2 gp = vPos.xz * 0.6;
    vec2 g = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);
    float grid = 1.0 - min(min(g.x, g.y), 1.0);

    float d = length(vPos.xz);
    float fade = 1.0 - smoothstep(7.0, 21.0, d);

    float pr = mod(uTime * 3.5, 28.0);
    float pulse = exp(-pow((d - pr) * 0.9, 2.0));

    vec3 col = mix(uGreen, uOrange, smoothstep(-0.9, 1.2, vH));
    float a = (contour * 0.85 + grid * 0.28) * fade;
    a += pulse * 0.6 * fade * (contour + grid * 0.6 + 0.15);
    col += vec3(1.0) * pulse * 0.45;
    gl_FragColor = vec4(col * 1.4, a);
  }
`

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function labelSprite(text, color) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const g = c.getContext('2d')
  g.font = '700 54px "Segoe UI", system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.shadowColor = color
  g.shadowBlur = 22
  g.fillStyle = '#ffffff'
  g.fillText(text.toUpperCase(), 256, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }))
  s.scale.set(3.2, 0.8, 1)
  return s
}

export default function LandScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 1)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.02)
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)

    const glow = glowTexture()
    const disposables = [glow]

    // ---------- Ciel : dôme dégradé (valeurs linéaires, le post-traitement convertit en sRGB) ----------
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(95, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `
          varying vec3 vP;
          void main(){
            float h = clamp(normalize(vP).y, 0.0, 1.0);
            vec3 top = vec3(0.0006, 0.0016, 0.0045);
            vec3 hor = vec3(0.0060, 0.0100, 0.0160);
            vec3 glow = vec3(0.020, 0.010, 0.002) * exp(-h * 9.0);
            gl_FragColor = vec4(mix(hor, top, pow(h, 0.45)) + glow, 1.0);
          }`,
      })
    )
    scene.add(sky)

    // ---------- Relief ----------
    const terrainGeo = new THREE.PlaneGeometry(46, 46, 150, 150)
    terrainGeo.rotateX(-Math.PI / 2)
    const terrainMat = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uOrange: { value: new THREE.Color(ORANGE) },
        uGreen: { value: new THREE.Color(GREEN) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    scene.add(new THREE.Mesh(terrainGeo, terrainMat))

    // ---------- Bornes (étapes du dossier) ----------
    const NODES = [
      { x: -7, z: 2.5, color: ORANGE, label: 'Courrier' },
      { x: 0, z: -2.5, color: WHITE, label: 'SPFEI' },
      { x: 7, z: 2.5, color: GREEN, label: 'Conservation' },
    ].map((n) => ({ ...n, y: height(n.x, n.z) }))

    const nodeAnim = []
    NODES.forEach((n) => {
      const g = new THREE.Group()
      g.position.set(n.x, n.y, n.z)

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 1),
        new THREE.MeshBasicMaterial({ color: n.color, wireframe: true })
      )
      core.position.y = 1.3
      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.2, 0),
        new THREE.MeshBasicMaterial({ color: n.color })
      )
      inner.position.y = 1.3

      const ringA = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.018, 8, 80),
        new THREE.MeshBasicMaterial({ color: n.color })
      )
      const ringB = ringA.clone()
      ringA.position.y = ringB.position.y = 1.3

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.28, 9, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: n.color, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        })
      )
      beam.position.y = 4.5

      const base = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.0, 64),
        new THREE.MeshBasicMaterial({
          color: n.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
        })
      )
      base.rotation.x = -Math.PI / 2
      base.position.y = 0.05

      const label = labelSprite(n.label, '#' + new THREE.Color(n.color).getHexString())
      label.position.y = 2.7

      g.add(core, inner, ringA, ringB, beam, base, label)
      scene.add(g)
      nodeAnim.push({ core, ringA, ringB, base, beam })
    })

    // ---------- Chemin des dossiers ----------
    const up = (n, dy) => new THREE.Vector3(n.x, n.y + dy, n.z)
    const path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-14, 3.2, 6.5),
        up(NODES[0], 1.3),
        new THREE.Vector3(-3.6, 3.4, -0.2),
        up(NODES[1], 1.3),
        new THREE.Vector3(3.6, 3.4, -0.2),
        up(NODES[2], 1.3),
        new THREE.Vector3(14, 3.2, 6.5),
      ],
      false,
      'catmullrom',
      0.5
    )
    // trait lumineux du chemin
    const pathLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(path.getPoints(200)),
      new THREE.LineBasicMaterial({ color: 0xf9a05a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending })
    )
    scene.add(pathLine)

    const DOCS = 6
    const TRAIL = 28
    const docs = []
    const docGeo = new THREE.BoxGeometry(0.5, 0.035, 0.7)
    const edgeGeo = new THREE.EdgesGeometry(docGeo)
    for (let i = 0; i < DOCS; i++) {
      const group = new THREE.Group()
      group.add(
        new THREE.Mesh(docGeo, new THREE.MeshBasicMaterial({ color: 0xffe2c8 })),
        new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: ORANGE }))
      )
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glow, color: ORANGE, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 })
      )
      halo.scale.set(1.8, 1.8, 1)
      group.add(halo)
      scene.add(group)

      const trailPos = new Float32Array(TRAIL * 3)
      const trailCol = new Float32Array(TRAIL * 3)
      const trailGeo = new THREE.BufferGeometry()
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3))
      trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3))
      const trail = new THREE.Line(
        trailGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      )
      trail.frustumCulled = false
      scene.add(trail)
      docs.push({ group, trail, trailPos, trailCol, offset: i / DOCS, init: false })
    }

    // ---------- Étincelles ----------
    const SPARKS = 420
    const sPos = new Float32Array(SPARKS * 3)
    const sVel = new Float32Array(SPARKS)
    const sCol = new Float32Array(SPARKS * 3)
    const palette = [new THREE.Color(ORANGE), new THREE.Color(GREEN), new THREE.Color(WHITE)]
    const resetSpark = (i, spread = true) => {
      const n = NODES[Math.floor(Math.random() * 3)]
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * (spread ? 3.5 : 1.2)
      sPos[i * 3] = n.x + Math.cos(a) * r
      sPos[i * 3 + 1] = (spread ? Math.random() * 8 : 0.1) + n.y
      sPos[i * 3 + 2] = n.z + Math.sin(a) * r
      sVel[i] = 0.4 + Math.random() * 1.1
      const c = palette[Math.floor(Math.random() * 3)]
      sCol[i * 3] = c.r; sCol[i * 3 + 1] = c.g; sCol[i * 3 + 2] = c.b
    }
    for (let i = 0; i < SPARKS; i++) resetSpark(i)
    const sGeo = new THREE.BufferGeometry()
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    sGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3))
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
      size: 0.22, map: glow, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })))

    // ---------- Étoiles ----------
    const STARS = 700
    const stPos = new Float32Array(STARS * 3)
    for (let i = 0; i < STARS; i++) {
      const r = 45 + Math.random() * 40
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(Math.random() * 0.9 + 0.05) // hémisphère haute
      stPos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      stPos[i * 3 + 1] = r * Math.cos(ph) * 0.7 + 4
      stPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    const stGeo = new THREE.BufferGeometry()
    stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3))
    const stars = new THREE.Points(stGeo, new THREE.PointsMaterial({
      size: 0.35, map: glow, color: 0xcfe3ff, transparent: true, opacity: 0.55, depthWrite: false, fog: false,
    }))
    scene.add(stars)

    // ---------- Post-traitement : bloom ----------
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.3)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    // ---------- Interaction / resize ----------
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    let dist = 22
    const resize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h)
      composer.setSize(w, h)
      bloom.setSize(w, h)
      camera.aspect = w / h
      dist = w / h < 1 ? 34 : w / h < 1.5 ? 26 : 22
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // ---------- Boucle ----------
    const clock = new THREE.Clock()
    const tmp = new THREE.Vector3()
    const ahead = new THREE.Vector3()
    let raf = 0

    const frame = () => {
      const t = clock.getElapsedTime()
      terrainMat.uniforms.uTime.value = t

      // caméra : dérive lente + parallaxe
      mouse.sx += (mouse.x - mouse.sx) * 0.04
      mouse.sy += (mouse.y - mouse.sy) * 0.04
      const az = Math.sin(t * 0.09) * 0.42 + mouse.sx * 0.18
      camera.position.set(Math.sin(az) * dist, 6.8 + Math.sin(t * 0.13) * 0.8 - mouse.sy * 0.9, Math.cos(az) * dist)
      camera.lookAt(0, 0.8, 0)

      // bornes
      nodeAnim.forEach((n, i) => {
        n.core.rotation.y = t * 0.8 + i
        n.core.rotation.x = t * 0.5
        n.ringA.rotation.x = t * 1.1 + i
        n.ringB.rotation.y = t * 0.9 + i
        n.ringB.rotation.z = Math.PI / 3
        const k = (t * 0.6 + i * 0.33) % 1
        n.base.scale.setScalar(1 + k * 1.8)
        n.base.material.opacity = 0.9 * (1 - k)
        n.beam.material.opacity = 0.08 + Math.sin(t * 2 + i) * 0.03
      })

      // dossiers
      docs.forEach((d) => {
        const u = (t * 0.045 + d.offset) % 1
        path.getPointAt(u, tmp)
        path.getPointAt((u + 0.01) % 1, ahead)
        d.group.position.copy(tmp)
        d.group.position.y += Math.sin(t * 3 + d.offset * 10) * 0.06
        d.group.lookAt(ahead)
        d.group.rotation.z += Math.sin(t * 2 + d.offset * 6) * 0.01

        // historique -> traînée
        if (!d.init) {
          for (let i = 0; i < TRAIL; i++) tmp.toArray(d.trailPos, i * 3)
          d.init = true
        }
        d.trailPos.copyWithin(3, 0, (TRAIL - 1) * 3)
        d.group.position.toArray(d.trailPos, 0)
        for (let i = 0; i < TRAIL; i++) {
          const f = 1 - i / (TRAIL - 1)
          d.trailCol[i * 3] = 1.0 * f
          d.trailCol[i * 3 + 1] = 0.55 * f
          d.trailCol[i * 3 + 2] = 0.2 * f
        }
        d.trail.geometry.attributes.position.needsUpdate = true
        d.trail.geometry.attributes.color.needsUpdate = true
      })

      // étincelles
      for (let i = 0; i < SPARKS; i++) {
        sPos[i * 3 + 1] += sVel[i] * 0.018
        sPos[i * 3] += Math.sin(t + i) * 0.002
        if (sPos[i * 3 + 1] > 9) resetSpark(i, false)
      }
      sGeo.attributes.position.needsUpdate = true

      stars.rotation.y = t * 0.004

      composer.render()
      if (!reduceMotion) raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        o.geometry?.dispose?.()
        const m = o.material
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => { x.map?.dispose?.(); x.dispose() })
      })
      disposables.forEach((d) => d.dispose())
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />
}
