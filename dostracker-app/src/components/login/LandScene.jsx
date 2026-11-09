import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Fond 3D du login — le foncier rural, de la parcelle au certificat.
 *
 * Une campagne au crépuscule : un patchwork de parcelles cultivées, quelques arbres.
 * Toutes les ~15 s, une parcelle est régularisée, en 4 temps calmes :
 *   1. des bornes sont plantées aux 4 coins
 *   2. le périmètre est tracé (bornage)
 *   3. la parcelle est reconnue (teinte verte)
 *   4. le certificat foncier apparaît au-dessus, puis s'efface
 * Pas de bloom, pas de néons : lumière douce, mouvements lents.
 */
const SIZE = 13 // grille SIZE x SIZE
const STEP = 3.5 // pas entre parcelles
const PARCEL = 3.0 // taille d'une parcelle (le reste = limites/chemins)
const CYCLE = 15 // secondes par parcelle régularisée

const PALETTE = ['#5d7a3c', '#7a8a40', '#8c7340', '#9c7a43', '#4f6c40', '#6b5d3b', '#3f5f47']
const ACTIVE_CELLS = [[3, 7], [9, 6], [3, 4], [9, 8]] // de part et d'autre de la carte de login

const height = (x, z) => 0.5 * Math.sin(x * 0.15) * Math.cos(z * 0.13) + 0.25 * Math.sin(x * 0.35 + z * 0.3)
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (v) => 1 - Math.pow(1 - clamp01(v), 3)
const rand = (i) => Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1

// Texture « rangs de culture » : bandes alternées de la couleur de la parcelle
function cropTexture(hex) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  g.fillStyle = hex
  g.fillRect(0, 0, 64, 64)
  g.fillStyle = 'rgba(0,0,0,0.13)'
  for (let y = 0; y < 64; y += 8) g.fillRect(0, y, 64, 4)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,0.9)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// Le certificat foncier (papier crème, bandeau aux couleurs CI, sceau)
function certificateTexture() {
  const W = 340
  const H = 440
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = '#f7f1e3'
  g.fillRect(0, 0, W, H)
  g.strokeStyle = '#b9a67a'
  g.lineWidth = 3
  g.strokeRect(12, 12, W - 24, H - 24)
  const band = W - 24
  g.fillStyle = '#f47920'; g.fillRect(12, 12, band / 3, 12)
  g.fillStyle = '#ffffff'; g.fillRect(12 + band / 3, 12, band / 3, 12)
  g.fillStyle = '#00853f'; g.fillRect(12 + (2 * band) / 3, 12, band / 3, 12)
  g.fillStyle = '#2a2a2a'
  g.textAlign = 'center'
  g.font = '700 22px Georgia, serif'
  g.fillText('RÉPUBLIQUE DE CÔTE D’IVOIRE', W / 2, 62)
  g.font = '700 30px Georgia, serif'
  g.fillStyle = '#00642f'
  g.fillText('CERTIFICAT FONCIER', W / 2, 118)
  g.fillStyle = '#6b6b6b'
  g.font = '15px Georgia, serif'
  g.fillText('Parcelle rurale — délimitée et bornée', W / 2, 148)
  g.fillStyle = '#cfc6ae'
  for (let i = 0; i < 6; i++) g.fillRect(44, 190 + i * 26, i % 3 === 2 ? 170 : 252, 5)
  g.strokeStyle = '#f47920'
  g.lineWidth = 4
  g.beginPath(); g.arc(W - 90, H - 92, 38, 0, Math.PI * 2); g.stroke()
  g.fillStyle = 'rgba(244,121,32,0.18)'
  g.beginPath(); g.arc(W - 90, H - 92, 38, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#f47920'
  g.font = '700 22px Georgia, serif'
  g.fillText('AFOR', W - 90, H - 85)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export default function LandScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0) // le ciel est le dégradé CSS du conteneur
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x5a4630, 0.018) // = couleur de l'horizon du ciel CSS
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 150)

    scene.add(new THREE.HemisphereLight(0xffe2c0, 0x2b2a22, 1.05))
    const sun = new THREE.DirectionalLight(0xffc890, 1.0)
    sun.position.set(-14, 9, 7)
    scene.add(sun)

    const disposables = []
    const track = (o) => { disposables.push(o); return o }

    // ---------- Sol (terre) ----------
    const ground = new THREE.Mesh(
      track(new THREE.PlaneGeometry(160, 160)),
      track(new THREE.MeshLambertMaterial({ color: 0x2c261c }))
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.1
    scene.add(ground)

    // ---------- Parcelles ----------
    const textures = PALETTE.map((hex) => track(cropTexture(hex)))
    const parcelGeo = track(new THREE.BoxGeometry(PARCEL, 0.16, PARCEL))
    const parcelMats = textures.map((map) => track(new THREE.MeshLambertMaterial({ map })))
    const origin = -((SIZE - 1) / 2) * STEP
    const cellPos = (ix, iz) => {
      const x = origin + ix * STEP
      const z = origin + iz * STEP
      return new THREE.Vector3(x, height(x, z), z)
    }
    for (let ix = 0; ix < SIZE; ix++) {
      for (let iz = 0; iz < SIZE; iz++) {
        const i = ix * SIZE + iz
        const m = new THREE.Mesh(parcelGeo, parcelMats[Math.floor(rand(i) * PALETTE.length)])
        m.position.copy(cellPos(ix, iz))
        m.rotation.y = Math.floor(rand(i + 50) * 4) * (Math.PI / 2) // sens des rangs
        scene.add(m)
      }
    }

    // ---------- Arbres (aux croisements de chemins) ----------
    const trunkGeo = track(new THREE.CylinderGeometry(0.06, 0.09, 0.55, 6))
    const crownGeo = track(new THREE.IcosahedronGeometry(0.5, 0))
    const trunkMat = track(new THREE.MeshLambertMaterial({ color: 0x4a3524 }))
    const crownMats = [0x2f5a35, 0x3b6b3a, 0x2a4f33].map((c) => track(new THREE.MeshLambertMaterial({ color: c, flatShading: true })))
    const trees = []
    for (let k = 0; k < 60; k++) {
      const x = origin + Math.floor(rand(k + 200) * (SIZE + 1)) * STEP - STEP / 2
      const z = origin + Math.floor(rand(k + 400) * (SIZE + 1)) * STEP - STEP / 2
      const g = new THREE.Group()
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 0.27
      const crown = new THREE.Mesh(crownGeo, crownMats[k % 3])
      crown.position.y = 0.85
      crown.scale.setScalar(0.8 + rand(k + 900) * 0.7)
      g.add(trunk, crown)
      g.position.set(x, height(x, z), z)
      scene.add(g)
      trees.push({ g, phase: rand(k) * 6.28 })
    }

    // ---------- Régularisation d'une parcelle ----------
    const POSTS_TIME = 0.55
    const hl = PARCEL / 2
    const corners = [[-hl, -hl], [hl, -hl], [hl, hl], [-hl, hl]]
    const active = new THREE.Group()
    scene.add(active)

    const postGeo = track(new THREE.BoxGeometry(0.11, 0.8, 0.11))
    const capGeo = track(new THREE.SphereGeometry(0.1, 10, 8))
    const postMat = track(new THREE.MeshLambertMaterial({ color: 0xf3ede0 }))
    const capMat = track(new THREE.MeshLambertMaterial({ color: 0xf47920 }))
    const posts = corners.map(([cx, cz]) => {
      const p = new THREE.Group()
      const body = new THREE.Mesh(postGeo, postMat)
      body.position.y = 0.4
      const cap = new THREE.Mesh(capGeo, capMat)
      cap.position.y = 0.82
      p.add(body, cap)
      p.position.set(cx, 0.08, cz)
      active.add(p)
      return p
    })

    const lineGeo = track(new THREE.BoxGeometry(PARCEL, 0.05, 0.09))
    const lineMat = track(new THREE.MeshBasicMaterial({ color: 0xf9a05a, transparent: true }))
    const sides = corners.map(([cx, cz], i) => {
      const [nx, nz] = corners[(i + 1) % 4]
      const pivot = new THREE.Group()
      pivot.position.set(cx, 0.2, cz)
      pivot.rotation.y = -Math.atan2(nz - cz, nx - cx)
      const seg = new THREE.Mesh(lineGeo, lineMat)
      seg.position.x = PARCEL / 2
      pivot.add(seg)
      active.add(pivot)
      return pivot
    })

    const tintMat = track(new THREE.MeshBasicMaterial({ color: 0x2fd27a, transparent: true, opacity: 0, depthWrite: false }))
    const tint = new THREE.Mesh(track(new THREE.PlaneGeometry(PARCEL - 0.1, PARCEL - 0.1)), tintMat)
    tint.rotation.x = -Math.PI / 2
    tint.position.y = 0.19
    active.add(tint)

    const certTex = track(certificateTexture())
    const certMat = track(new THREE.MeshBasicMaterial({ map: certTex, transparent: true, opacity: 0, side: THREE.DoubleSide }))
    const cert = new THREE.Mesh(track(new THREE.PlaneGeometry(2.3, 2.95)), certMat)
    active.add(cert)

    // ---------- Poussières en suspension ----------
    const glow = track(glowTexture())
    const N = 90
    const dPos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      dPos[i * 3] = (rand(i + 1) - 0.5) * 44
      dPos[i * 3 + 1] = 0.5 + rand(i + 2) * 7
      dPos[i * 3 + 2] = (rand(i + 3) - 0.5) * 44
    }
    const dGeo = track(new THREE.BufferGeometry())
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
    scene.add(new THREE.Points(dGeo, track(new THREE.PointsMaterial({
      size: 0.16, map: glow, color: 0xffd9a0, transparent: true, opacity: 0.3, depthWrite: false,
    }))))

    // ---------- Interaction / resize ----------
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    let dist = 30
    const resize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h)
      camera.aspect = w / h
      dist = w / h < 1 ? 46 : w / h < 1.5 ? 36 : 30
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // ---------- Boucle ----------
    const t0 = performance.now()
    let raf = 0
    let currentCell = -1

    const frame = () => {
      const t = reduceMotion ? 9.5 : (performance.now() - t0) / 1000
      const cycleIdx = Math.floor(t / CYCLE)
      const c = t % CYCLE

      // changement de parcelle
      if (cycleIdx !== currentCell) {
        currentCell = cycleIdx
        const [ix, iz] = ACTIVE_CELLS[cycleIdx % ACTIVE_CELLS.length]
        active.position.copy(cellPos(ix, iz))
        active.position.y += 0.08
      }
      const fade = 1 - clamp01((c - 13) / 2) // disparition douce en fin de cycle

      // 1. bornes
      posts.forEach((p, i) => {
        p.scale.set(1, Math.max(0.001, ease((c - i * POSTS_TIME) / 0.9) * fade), 1)
      })
      // 2. périmètre
      sides.forEach((s, i) => {
        const k = ease((c - 2.5 - i * 1.25) / 1.25)
        s.scale.x = Math.max(0.001, k)
        s.visible = k > 0.001
      })
      lineMat.opacity = fade
      // 3. reconnaissance
      tintMat.opacity = 0.3 * ease((c - 7) / 1.5) * fade
      // 4. certificat
      const ck = ease((c - 8.5) / 1.5) * fade
      certMat.opacity = ck
      cert.position.set(0, 2.9 + ck * 0.5 + Math.sin(t * 1.1) * 0.06, 0)
      cert.rotation.y = Math.sin(t * 0.5) * 0.35
      cert.scale.setScalar(0.85 + 0.15 * ck)

      // arbres : léger balancement
      trees.forEach(({ g, phase }) => { g.rotation.z = Math.sin(t * 0.6 + phase) * 0.015 })

      // poussières : dérive très lente
      for (let i = 0; i < N; i++) {
        dPos[i * 3 + 1] += 0.0025
        dPos[i * 3] += Math.sin(t * 0.2 + i) * 0.0012
        if (dPos[i * 3 + 1] > 8) dPos[i * 3 + 1] = 0.4
      }
      dGeo.attributes.position.needsUpdate = true

      // caméra : dérive lente + parallaxe discrète
      mouse.sx += (mouse.x - mouse.sx) * 0.03
      mouse.sy += (mouse.y - mouse.sy) * 0.03
      const az = Math.sin(t * 0.045) * 0.22 + mouse.sx * 0.1
      camera.position.set(Math.sin(az) * dist, 13 - mouse.sy * 0.8, Math.cos(az) * dist)
      camera.lookAt(0, 0.3, 2)

      renderer.render(scene, camera)
      if (!reduceMotion) raf = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      disposables.forEach((d) => { d.map?.dispose?.(); d.dispose?.() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      aria-hidden
      // Ciel crépusculaire : l'horizon (≈ 12 % de la hauteur) a la couleur du brouillard de la scène
      style={{ background: 'linear-gradient(180deg, #0d1822 0%, #20404a 6%, #6d5236 12%, #5a4630 17%, #5a4630 100%)' }}
    />
  )
}
