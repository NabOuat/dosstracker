import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Fond 3D du login : un cadastre vu en perspective.
 * - grille de parcelles extrudées (orange / vert / blanc = couleurs CI)
 * - une parcelle « active » dont le contour se redessine (dossier en cours de traitement)
 * - particules flottantes (courriers / pièces en circulation)
 * - caméra qui suit légèrement la souris
 */
const COLORS = [0xf47920, 0x00853f, 0xffffff]
const GRID = 14
const CELL = 1.1

export default function LandScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0f1923, 0.055)

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
    camera.position.set(0, 9, 12)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xffffff, 1.1)
    sun.position.set(6, 12, 4)
    scene.add(sun)

    // ---- Parcelles ----
    const group = new THREE.Group()
    scene.add(group)
    const parcels = []
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)
    const seed = (i) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        const i = x * GRID + z
        const r = seed(i)
        const mat = new THREE.MeshStandardMaterial({
          color: COLORS[Math.floor(seed(i + 99) * 3)],
          roughness: 0.55,
          metalness: 0.1,
          transparent: true,
          opacity: 0.16 + r * 0.22,
        })
        const m = new THREE.Mesh(boxGeo, mat)
        const w = CELL * (0.62 + seed(i + 7) * 0.3)
        const d = CELL * (0.62 + seed(i + 13) * 0.3)
        const h = 0.08 + seed(i + 3) * 0.55
        m.scale.set(w, h, d)
        m.position.set((x - GRID / 2) * CELL, h / 2, (z - GRID / 2) * CELL)
        m.userData = { baseH: h, phase: r * Math.PI * 2 }
        group.add(m)
        parcels.push(m)
      }
    }

    // ---- Contour de la parcelle active (se redessine en boucle) ----
    const outlinePts = [
      [-1.6, -1.2], [-0.2, -1.7], [1.5, -1.0], [1.9, 0.6], [0.4, 1.6], [-1.3, 1.1],
    ].map(([x, z]) => new THREE.Vector3(x, 0.75, z))
    outlinePts.push(outlinePts[0].clone())
    const curve = new THREE.CatmullRomCurve3(outlinePts, false, 'catmullrom', 0.05)
    const total = 240
    const outlineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(total))
    const outline = new THREE.Line(
      outlineGeo,
      new THREE.LineBasicMaterial({ color: 0xf9a05a, transparent: true, opacity: 0.95 })
    )
    outline.geometry.setDrawRange(0, 0)
    scene.add(outline)

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    scene.add(beacon)

    // Colonne de lumière au centre de la parcelle
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 5, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xf47920, transparent: true, opacity: 0.35 })
    )
    beam.position.set(0.1, 2.9, 0)
    scene.add(beam)

    // ---- Particules ----
    const N = 220
    const pos = new Float32Array(N * 3)
    const vel = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = Math.random() * 7
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22
      vel[i] = 0.1 + Math.random() * 0.25
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0xf9a05a, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })
    )
    scene.add(points)

    // ---- Interaction / resize ----
    const mouse = { x: 0, y: 0 }
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // ---- Boucle ----
    const clock = new THREE.Clock()
    let raf = 0
    const frame = () => {
      const t = clock.getElapsedTime()

      group.rotation.y = t * 0.04
      outline.rotation.y = beacon.rotation.y = beam.rotation.y = group.rotation.y

      parcels.forEach((m) => {
        const k = 1 + Math.sin(t * 0.8 + m.userData.phase) * 0.18
        const h = m.userData.baseH * k
        m.scale.y = h
        m.position.y = h / 2
      })

      const cycle = (t % 6) / 4 // 4 s de tracé, 2 s de pause
      const progress = Math.min(cycle, 1)
      outline.geometry.setDrawRange(0, Math.floor(progress * (total + 1)))
      outline.material.opacity = cycle > 1 ? Math.max(0, 1 - (cycle - 1) * 1.6) : 0.95
      const p = curve.getPoint(progress)
      beacon.position.copy(p).applyAxisAngle(new THREE.Vector3(0, 1, 0), group.rotation.y)
      beacon.visible = cycle <= 1
      beam.material.opacity = 0.2 + Math.sin(t * 2) * 0.1

      const arr = pGeo.attributes.position.array
      for (let i = 0; i < N; i++) {
        arr[i * 3 + 1] += vel[i] * 0.01
        if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = 0
      }
      pGeo.attributes.position.needsUpdate = true

      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04
      camera.position.y += (9 - mouse.y * 1.2 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
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
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose())
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />
}
