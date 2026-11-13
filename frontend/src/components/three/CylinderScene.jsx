import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RotateCcw } from 'lucide-react'
import { choosePi, circumference, fmt } from '../../lib/cylinder.js'

export const PART_COLORS = { tutup: '#FACC15', alas: '#FB923C', selimut: '#60A5FA' }
const SEGMENTS = 96

/** Sprite teks (label ukuran) yang selalu menghadap kamera. */
function makeLabel(text, color = '#172554', h = 0.32) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const font = 'bold 44px Inter, system-ui, sans-serif'
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + 36
  canvas.width = w
  canvas.height = 68
  ctx.font = font
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  const r = 18
  ctx.beginPath()
  ctx.roundRect(2, 2, w - 4, 64, r)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 18, 36)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  sprite.renderOrder = 10
  sprite.scale.set((h * w) / 68, h, 1)
  return sprite
}

/**
 * Geometri selimut yang bisa "dibuka".
 * u = 0 → tabung utuh; u = 1 → persegi panjang datar.
 * Selimut dilengkungkan dengan jari-jari R = r / (1 − u) sehingga panjang busur tetap 2πr.
 */
function blanketPositions(R0, H, u) {
  const W = 2 * Math.PI * R0
  const flat = u > 0.9995
  const Rb = flat ? Infinity : R0 / (1 - u)
  const pos = []
  for (let j = 0; j <= 1; j++) {
    for (let i = 0; i <= SEGMENTS; i++) {
      const s = (W * i) / SEGMENTS - W / 2
      let x, z
      if (flat) { x = s; z = 0 } else {
        const phi = s / Rb
        x = Rb * Math.sin(phi)
        z = Rb * Math.cos(phi) - Rb
      }
      pos.push(x, j * H, z)
    }
  }
  return pos
}

function buildBlanketGeometry() {
  const g = new THREE.BufferGeometry()
  const idx = []
  const n = SEGMENTS + 1
  for (let i = 0; i < SEGMENTS; i++) {
    const a = i, b = i + 1, c = n + i, d = n + i + 1
    idx.push(a, b, d, a, d, c)
  }
  g.setIndex(idx)
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 2 * 3), 3))
  return g
}

/**
 * Props:
 *  r, t       ukuran nyata (cm)
 *  mode       'closed' | 'open' | 'blanket'
 *  unfold     0..1
 *  showLabels tampilkan label r, t, 2πr
 *  highlight  'tutup' | 'alas' | 'selimut' | null
 *  onPartClick(part)
 */
export default function CylinderScene({
  r = 7, t = 10, mode = 'closed', unfold = 0, showLabels = true, highlight = null,
  onPartClick, className = 'h-72 sm:h-80', ariaLabel = 'Model tabung 3D',
}) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const clickRef = useRef(onPartClick)
  const [error, setError] = useState(false)
  clickRef.current = onPartClick

  // --- inisialisasi sekali ---------------------------------------------
  useEffect(() => {
    const mount = mountRef.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setError(true)
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'none'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200)
    camera.position.set(3.2, 2.6, 5.2)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 2
    controls.maxDistance = 20

    scene.add(new THREE.AmbientLight(0xffffff, 1.3))
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe0e7ff, 0.9))
    const dir = new THREE.DirectionalLight(0xffffff, 1.8)
    dir.position.set(4, 6, 5)
    scene.add(dir)
    const back = new THREE.DirectionalLight(0xffffff, 0.6)
    back.position.set(-4, -2, -5)
    scene.add(back)

    const root = new THREE.Group()
    scene.add(root)
    const mat = (c) => new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: 0.55, metalness: 0.05, emissive: 0x000000 })

    const selimut = new THREE.Mesh(buildBlanketGeometry(), mat(PART_COLORS.selimut))
    selimut.name = 'selimut'
    const topPivot = new THREE.Group()
    const bottomPivot = new THREE.Group()
    const discGeo = new THREE.CircleGeometry(1, SEGMENTS)
    discGeo.rotateX(-Math.PI / 2) // menghadap +y
    const tutup = new THREE.Mesh(discGeo, mat(PART_COLORS.tutup))
    tutup.name = 'tutup'
    const alasGeo = discGeo.clone()
    const alas = new THREE.Mesh(alasGeo, mat(PART_COLORS.alas))
    alas.name = 'alas'
    topPivot.add(tutup)
    bottomPivot.add(alas)
    root.add(selimut, topPivot, bottomPivot)

    // garis tepi selimut agar bentuk lebih jelas
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a })
    const edgeTop = new THREE.Line(new THREE.BufferGeometry(), edgeMat)
    const edgeBottom = new THREE.Line(new THREE.BufferGeometry(), edgeMat)
    root.add(edgeTop, edgeBottom)

    const labels = new THREE.Group()
    root.add(labels)
    const rLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x172554, depthTest: false }))
    rLine.renderOrder = 9
    root.add(rLine)

    const resize = () => {
      const w = mount.clientWidth || 300
      const h = mount.clientHeight || 300
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    // klik bagian (bedakan dari geser/putar)
    const raycaster = new THREE.Raycaster()
    let down = null
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY } }
    const onUp = (e) => {
      if (!down || !clickRef.current) return
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y)
      down = null
      if (moved > 6) return
      const rect = renderer.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects([selimut, tutup, alas].filter((m) => m.visible && m.parent?.visible !== false), false)
      if (hits[0]) clickRef.current(hits[0].object.name)
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)

    renderer.setAnimationLoop(() => {
      controls.update()
      renderer.render(scene, camera)
    })

    sceneRef.current = { scene, camera, controls, root, selimut, tutup, alas, topPivot, bottomPivot, edgeTop, edgeBottom, labels, rLine, renderer, lastFit: null }

    return () => {
      ro.disconnect()
      renderer.setAnimationLoop(null)
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      controls.dispose()
      scene.traverse((o) => {
        o.geometry?.dispose?.()
        if (o.material) {
          o.material.map?.dispose?.()
          o.material.dispose?.()
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
      sceneRef.current = null
    }
  }, [])

  // --- perbarui geometri saat ukuran/mode/bentangan berubah -----------------
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    const u = Math.max(0, Math.min(1, unfold))
    const scale = 3 / Math.max(2 * r, t)
    const R0 = r * scale
    const H = t * scale

    const pos = blanketPositions(R0, H, u)
    s.selimut.geometry.attributes.position.array.set(pos)
    s.selimut.geometry.attributes.position.needsUpdate = true
    s.selimut.geometry.computeVertexNormals()
    s.selimut.geometry.computeBoundingSphere()

    const n = SEGMENTS + 1
    const edge = (row) => {
      const pts = []
      for (let i = 0; i < n; i++) pts.push(new THREE.Vector3(pos[(row * n + i) * 3], pos[(row * n + i) * 3 + 1], pos[(row * n + i) * 3 + 2]))
      return pts
    }
    s.edgeTop.geometry.setFromPoints(edge(1))
    s.edgeBottom.geometry.setFromPoints(edge(0))

    // tutup & alas: engsel di titik depan tepi selimut
    s.tutup.scale.set(R0, 1, R0)
    s.alas.scale.set(R0, 1, R0)
    s.tutup.position.set(0, 0.002, -R0)
    s.alas.position.set(0, -0.002, -R0)
    s.alas.rotation.x = Math.PI // menghadap ke bawah (sisi luar)
    s.topPivot.position.set(0, H, 0)
    s.bottomPivot.position.set(0, 0, 0)
    s.topPivot.rotation.x = (u * Math.PI) / 2
    s.bottomPivot.rotation.x = (-u * Math.PI) / 2

    s.topPivot.visible = mode === 'closed'
    s.bottomPivot.visible = mode !== 'blanket'

    // pusatkan model pada titik asal
    s.root.position.set(0, -H / 2, R0 * (1 - u))

    for (const [name, mesh] of [['tutup', s.tutup], ['alas', s.alas], ['selimut', s.selimut]]) {
      mesh.material.emissive.set(highlight === name ? 0x4c1d95 : 0x000000)
      mesh.material.emissiveIntensity = highlight === name ? 0.55 : 0
    }

    const width = u > 0.05 ? Math.max(2 * Math.PI * R0 * u + 2 * R0 * (1 - u), 2 * R0) : 2 * R0
    const height = H + (mode !== 'blanket' ? 4 * R0 * u : 0)
    const fit = Math.max(width, height, 2.4) * 1.25 + 1.5
    const lh = fit * 0.06 // tinggi label sebanding ukuran model agar tetap terbaca
    const k = lh / 0.32

    // label
    s.labels.children.forEach((c) => { c.material.map?.dispose(); c.material.dispose() })
    s.labels.clear()
    s.rLine.visible = false
    if (showLabels) {
      const W = 2 * Math.PI * R0
      const last = (SEGMENTS) * 3
      const edgeX = pos[last], edgeZ = pos[last + 2]
      const tLabel = makeLabel(`t = ${fmt(t)} cm`, '#172554', lh)
      tLabel.position.set(u > 0.5 ? W / 2 + 0.55 * k : Math.max(edgeX, R0) + 0.6 * k, H / 2, u > 0.5 ? 0 : edgeZ * 0.5)
      s.labels.add(tLabel)
      if (mode !== 'blanket') {
        // garis jari-jari pada lingkaran yang terlihat: tutup (tertutup) atau alas (tanpa tutup)
        const disc = mode === 'closed' ? s.tutup : s.alas
        const center = new THREE.Vector3()
        disc.updateWorldMatrix(true, false)
        s.root.updateWorldMatrix(true, false)
        const toRoot = (v) => s.root.worldToLocal(disc.localToWorld(v.clone()))
        const c = toRoot(center)
        const edgePt = toRoot(new THREE.Vector3(1, 0, 0))
        s.rLine.geometry.setFromPoints([c, edgePt])
        s.rLine.visible = true
        const rLabel = makeLabel(`r = ${fmt(r)} cm`, '#9a3412', lh)
        const lift = (mode === 'closed' ? 0.32 : -0.35) * k
        rLabel.position.copy(c.clone().lerp(edgePt, 0.5)).add(new THREE.Vector3(0, lift, 0))
        s.labels.add(rLabel)
      }
      if (u > 0.6) {
        const pLabel = makeLabel(`panjang = 2πr = ${fmt(circumference(r, choosePi(r).pi), 2)} cm`, '#1d4ed8', lh)
        pLabel.position.set(0, H + 0.3 * k, 0.05)
        if (mode === 'closed') pLabel.position.set(W / 4 + R0 * 0.6, H + 0.3 * k, 0.05)
        s.labels.add(pLabel)
      }
    }

    // sesuaikan jarak kamera dengan ukuran model (tanpa mengubah sudut pandang siswa)
    if (s.lastFit === null || Math.abs(fit - s.lastFit) > 0.2) {
      const dirV = s.camera.position.clone().sub(s.controls.target).normalize()
      if (u > 0.85 && (s.lastFit === null || fit > s.lastFit)) dirV.lerp(new THREE.Vector3(0, 0.15, 1), 0.7).normalize()
      s.camera.position.copy(s.controls.target.clone().add(dirV.multiplyScalar(fit)))
      s.lastFit = fit
    }
  }, [r, t, mode, unfold, showLabels, highlight])

  const resetView = () => {
    const s = sceneRef.current
    if (!s) return
    const d = s.camera.position.distanceTo(s.controls.target)
    s.camera.position.copy(new THREE.Vector3(3.2, 2.6, 5.2).normalize().multiplyScalar(d))
    s.controls.target.set(0, 0, 0)
  }

  if (error) {
    return (
      <div className={`grid place-items-center rounded-2xl bg-slate-100 p-6 text-center text-slate-600 ${className}`}>
        Perangkat ini belum mendukung tampilan 3D (WebGL). Gunakan gambar jaring-jaring di bawah sebagai gantinya.
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-blue-50 to-white ring-1 ring-slate-200 ${className}`}>
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" role="img" aria-label={ariaLabel} />
      <button onClick={resetView} className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-600 shadow ring-1 ring-slate-200 hover:bg-white" aria-label="Atur ulang sudut pandang">
        <RotateCcw className="size-3.5" /> Reset
      </button>
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/80 px-2 py-0.5 text-[11px] text-slate-500">Seret untuk memutar · cubit/scroll untuk zoom</p>
    </div>
  )
}
