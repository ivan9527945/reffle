import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export function CryptoBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current!
    const count = 20000

    // ── SETUP ──────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.01)
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000)
    camera.position.set(0, 0, 100)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width   = '100%'
    renderer.domElement.style.height  = '100%'
    container.appendChild(renderer.domElement)

    // ── POST PROCESSING ────────────────────────────────────────────────────────
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85,
    )
    bloomPass.strength  = 1.8
    bloomPass.radius    = 0.4
    bloomPass.threshold = 0
    composer.addPass(bloomPass)

    // ── OBJECTS ────────────────────────────────────────────────────────────────
    const dummy  = new THREE.Object3D()
    const pColor = new THREE.Color()
    const target = new THREE.Vector3()

    const geometry = new THREE.TetrahedronGeometry(0.25)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const mesh = new THREE.InstancedMesh(geometry, material, count)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(mesh)

    const initColor = new THREE.Color()
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
      ))
      mesh.setColorAt(i, initColor.setHex(0x00ff88))
    }

    const clock = new THREE.Clock()

    // ── API STUBS ──────────────────────────────────────────────────────────────
    const PARAMS: Record<string, number> = {
      signalSpeed:   1.8,
      fireIntensity: 0.72,
      brainSize:     44,
      circuitDense:  3.5,
      coreGlow:      0.65,
    }
    const addControl = (id: string, _l: string, _min: number, _max: number, val: number): number =>
      id in PARAMS ? PARAMS[id] : val
    const setInfo  = (_t: string, _d: string) => {}
    const annotate = (_id: string, _pos: THREE.Vector3, _label: string) => {}

    // ── ANIMATION ──────────────────────────────────────────────────────────────
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      // Read controls once — values are static per frame
      const signalSpeed   = addControl('signalSpeed',   'Signal Speed',    0.1, 5.0, 1.8)
      const fireIntensity = addControl('fireIntensity', 'Fire Intensity',  0.0, 1.0, 0.72)
      const brainSize     = addControl('brainSize',     'Brain Size',      25,  75,  44)
      const coreGlow      = addControl('coreGlow',      'Core Glow',       0.0, 1.0, 0.65)
      const t = time * signalSpeed

      for (let i = 0; i < count; i++) {
        const norm  = i / count

        // Deterministic per-particle seeds — no allocation
        const seed  = i * 1.6180339887
        const seedB = i * 2.2360679774
        const seedC = i * 0.7071067811
        const seedD = i * 1.4142135623

        const fA = seed  * 7919.0 - Math.floor(seed  * 7919.0)
        const fB = seedB * 6271.0 - Math.floor(seedB * 6271.0)
        const fC = seedC * 4987.0 - Math.floor(seedC * 4987.0)
        const fD = seedD * 3571.0 - Math.floor(seedD * 3571.0)

        const layer = i % 9

        // ── BRAIN SHAPE ───────────────────────────────────────────────────────
        const phi    = fA * 3.1415926
        const theta  = fB * 6.2831853
        const sinPhi = Math.sin(phi)
        const cosPhi = Math.cos(phi)
        const sinTh  = Math.sin(theta)
        const cosTh  = Math.cos(theta)

        const baseR  = brainSize
        const bx0    = baseR * 1.15 * sinPhi * cosTh
        const by0    = baseR * 0.82 * cosPhi
        const bz0    = baseR * 0.95 * sinPhi * sinTh

        const hemi    = bx0 > 0 ? 1.0 : -1.0
        const fissure = Math.exp(-bx0 * bx0 * 0.0012) * 5.5
        const bx = bx0 + hemi * fissure
        const by = by0
        const bz = bz0

        const gyriFreq = 6.0
        const gyri = 1.8 * (
          Math.sin(phi * gyriFreq + fC * 4.0) *
          Math.cos(theta * gyriFreq * 0.7 + fD * 3.0)
        )
        const nx = sinPhi * cosTh
        const ny = cosPhi
        const nz = sinPhi * sinTh
        const gx = bx + nx * gyri
        const gy = by + ny * gyri
        const gz = bz + nz * gyri

        let px = 0, py = 0, pz = 0, hue = 0, sat = 1.0, lit = 0.5

        // ── LAYER 0-2 · CORTEX SHELL ─────────────────────────────────────────
        if (layer <= 2) {
          const jitter = 0.9 + fC * 1.2
          const pulse  = Math.sin(t * 1.4 + fA * 9.7) * 0.5
          px = gx + nx * (jitter + pulse)
          py = gy + ny * (jitter + pulse)
          pz = gz + nz * (jitter + pulse)
          hue = 0.095 + 0.025 * Math.sin(norm * 11.0 + t * 0.3)
          sat = 0.95
          lit = 0.28 + 0.18 * fA + 0.12 * Math.abs(pulse)

        // ── LAYER 3-4 · WHITE MATTER CIRCUITS ────────────────────────────────
        } else if (layer <= 4) {
          const tractIdx = Math.floor(fC * 180.0)
          const tractAng = tractIdx * 0.03490658
          const tractPos = fB
          const tractRad = brainSize * (0.30 + 0.55 * tractPos)
          const latBand  = Math.floor(fD * 9.0) * 0.3490658
          const cosLat   = Math.cos(latBand)
          const sinLat   = Math.sin(latBand)
          px = tractRad * Math.cos(tractAng) * sinLat
          py = tractRad * cosLat * (0.85 + 0.15 * Math.sin(t * 0.5 + tractIdx * 0.4))
          pz = tractRad * Math.sin(tractAng) * sinLat
          const flicker = Math.sin(t * 3.0 + tractPos * 6.28 + tractIdx * 1.3) * fireIntensity
          hue = 0.08 + 0.03 * Math.sin(tractPos * 8.0 + t * 0.8)  // fix: was Mathin(
          sat = 1.0
          lit = 0.22 + 0.30 * tractPos + 0.28 * Math.abs(flicker)

        // ── LAYER 5-6 · SIGNAL WAVEFRONTS ────────────────────────────────────
        } else if (layer <= 6) {
          const axonIdx   = Math.floor(fA * 60.0)
          const axonAng   = axonIdx * 0.10471975
          const axonLat   = Math.floor(fD * 6.0) * 0.5235987
          const signalT   = fB + t * 0.55 + axonIdx * 0.07
          const signalPos = signalT - Math.floor(signalT)
          const sigR      = brainSize * (0.08 + 0.88 * signalPos)  // fix: was rainSize
          const cosALat   = Math.cos(axonLat)
          const sinALat   = Math.sin(axonLat)
          px = sigR * Math.cos(axonAng) * sinALat
          py = sigR * cosALat
          pz = sigR * Math.sin(axonAng) * sinALat
          const spike = Math.exp(-Math.pow((signalPos - 0.9)  * 12.0, 2.0))
          const tail  = Math.exp(-Math.pow((signalPos - 0.85) *  4.0, 2.0)) * 0.4
          hue = 0.07 + 0.04 * spike
          sat = 1.0
          lit = 0.35 + 0.55 * (spike + tail) * fireIntensity

        // ── LAYER 7 · EQUATORIAL ARC RING ────────────────────────────────────
        } else if (layer === 7) {
          const ringAngle  = fA * 6.2831853 + t * 0.22
          const ringTilt   = fB * 0.5 - 0.25
          const ringR      = brainSize * (1.02 + 0.04 * Math.sin(t * 2.0 + fA * 12.0))
          const ringSpread = 1.5 * fC - 0.75
          px = ringR * Math.cos(ringAngle)
          py = ringR * Math.sin(ringTilt) + ringSpread
          pz = ringR * Math.sin(ringAngle)
          const ringPulse = Math.sin(t * 4.0 + fA * 6.28) * 0.5 + 0.5
          hue = 0.10 + 0.02 * ringPulse
          sat = 1.0
          lit = 0.50 + 0.40 * ringPulse * coreGlow

        // ── LAYER 8 · MOLTEN CORE ─────────────────────────────────────────────
        } else {
          const coreR   = brainSize * 0.18 * (0.4 + 0.6 * fA)
          const coreAng = fB * 6.2831853 + t * (1.5 + fC * 2.0)
          const coreEl  = (fD - 0.5) * 1.8
          const twist   = Math.sin(t * 2.3 + fA * 5.0) * 0.8
          px = coreR * Math.cos(coreAng + twist)
          py = coreR * Math.sin(coreEl) + Math.sin(t * 1.7 + fB * 4.0) * brainSize * 0.04
          pz = coreR * Math.sin(coreAng + twist * 0.7)
          const radNorm = coreR / (brainSize * 0.18 + 0.001)
          hue = 0.06 + 0.06 * radNorm
          sat = 0.90 + 0.10 * radNorm
          lit = 0.80 - 0.45 * radNorm + 0.15 * coreGlow * Math.abs(Math.sin(t * 3.1 + fA * 7.0))
        }

        // ── SLOW GLOBAL ROTATION (Y-axis) ─────────────────────────────────────
        const rotA   = t * 0.07
        const cosR   = Math.cos(rotA)
        const sinR   = Math.sin(rotA)
        const finalX = px * cosR - pz * sinR
        const finalZ = px * sinR + pz * cosR

        target.set(finalX, py, finalZ)
        pColor.setHSL(hue, sat, Math.max(0.01, Math.min(0.99, lit)))

        if (i === 0) {
          setInfo(
            'JARVIS Machine Brain',
            '22,000 neural signal particles. Cortex shell · Circuit axons · Signal wavefronts · Arc ring · Molten core.',
          )
          annotate('center', new THREE.Vector3(0, 0, 0), 'CORE')
        }

        positions[i].lerp(target, 0.1)
        dummy.position.copy(positions[i])
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, pColor)
      }

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

      composer.render()
    }

    animate()

    // ── RESIZE ─────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.1,
      }}
    />
  )
}
