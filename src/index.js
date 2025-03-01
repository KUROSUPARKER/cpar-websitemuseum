import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, Image, Text, Environment, useCursor } from '@react-three/drei'
import { easing } from 'maath'
import { useRoute, useLocation } from 'wouter'
import getUuid from 'uuid-by-string'

const GOLDENRATIO = 1.61803398875

// Main App component
function App({ images }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ fov: 70, position: [0, 2, 15] }}>
      <color attach="background" args={['#b60404']} />
      <fog attach="fog" args={['#b60404', 0, 15]} />
      <group position={[0, -0.5, 0]}>
        <Frames images={images} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={80}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.5}
          />
        </mesh>
      </group>
      <Environment preset="city" />
    </Canvas>
  )
}

// Frames component arranges multiple image frames
function Frames({ images, q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
  const ref = useRef()
  const clicked = useRef()
  const [, params] = useRoute('/item/:id')
  const [, setLocation] = useLocation()

  useEffect(() => {
    clicked.current = ref.current.getObjectByName(params?.id)
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true)
      clicked.current.parent.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25))
      clicked.current.parent.getWorldQuaternion(q)
    } else {
      p.set(0, 0, 5.5)
      q.identity()
    }
  })

  useFrame((state, dt) => {
    easing.damp3(state.camera.position, p, 0.4, dt)
    easing.dampQ(state.camera.quaternion, q, 0.4, dt)
  })

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        setLocation(clicked.current === e.object ? '/' : '/item/' + e.object.name)
      }}
      onPointerMissed={() => setLocation('/')}>
      {images.map((props) => (
        <Frame key={props.url} {...props} />
      ))}
    </group>
  )
}

// Frame component renders each individual image with a frame and multi-line text label
function Frame({ url, label, c = new THREE.Color(), ...props }) {
  const image = useRef()
  const frame = useRef()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)
  const [rnd] = useState(() => Math.random())

  // Used for routing, though not displayed
  const name = getUuid(url)
  const isActive = params?.id === name
  useCursor(hovered)

  useFrame((state, dt) => {
    image.current.material.zoom = 2 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2
    easing.damp3(image.current.scale, [0.85 * (!isActive && hovered ? 0.85 : 1), 0.9 * (!isActive && hovered ? 0.905 : 1), 1], 0.1, dt)
    easing.dampC(frame.current.material.color, hovered ? 'orange' : 'white', 0.1, dt)
  })

  return (
    <group {...props}>
      <mesh
        name={name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url} />
      </mesh>

      {/* Display the custom multi-line label */}
      <Text maxWidth={0.2} anchorX="left" anchorY="top" position={[0.55, GOLDENRATIO, 0]} fontSize={0.025}>
        {label}
      </Text>
    </group>
  )
}

// --- Images Array ---
// Convert GitHub "blob" URLs to raw URLs so they load correctly.
// Each image object now includes a custom label.
const images = [
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/assets-cpar/main/BAQUIRAN%20(GROUP%20ASSEMBLAGE).jpg',
    position: [0, 0, 1.5],
    rotation: [0, 0, 0],
    label: "sonnustic angelus\nbaquiran's group\nle assemblage\n122306STEM"
  },
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/asset-cparmuseum/refs/heads/main/Add%20a%20heading%20(1).png',
    position: [-0.8, 0, -0.6],
    rotation: [0, 0, 0],
    label: 'celestial aura\nmorning glow\nthe unity\nA1001'
  },
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/asset-cparmuseum/refs/heads/main/MUYARGAS.jpg',
    position: [0.8, 0, -0.6],
    rotation: [0, 0, 0],
    label: 'whispering winds\nelegant design\ngroup synergy\nB2002'
  },
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/assets-cpar/main/CRUZ.jpg',
    position: [-1.75, 0, 0.25],
    rotation: [0, Math.PI / 2.5, 0],
    label: 'radiant souls\ncosmic rhythm\nassembly mode\nC3003'
  },
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/assets-cpar/main/DIMAANO.jpg',
    position: [-2.15, 0, 1.5],
    rotation: [0, Math.PI / 2.5, 0],
    label: 'vintage vibes\nhistoric blend\nmodern fusion\nD4004'
  },
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/asset-cparmuseum/refs/heads/main/DOLLISEN%20(1).JPG',
    position: [-2, 0, 2.75],
    rotation: [0, Math.PI / 2.5, 0],
    label: 'urban mystic\ncity lights\ncollective vibe\nE5005'
  },
  {
    url: 'https://raw.githubusercontent.com/KUROSUPARKER/assets-cpar/main/MAT-AN.JPG',
    position: [1.75, 0, 0.25],
    rotation: [0, -Math.PI / 2.5, 0],
    label: 'dreamscape vision\nabstract form\ndynamic synergy\nF6006'
  },
  {
    url: "https://raw.githubusercontent.com/KUROSUPARKER/assets-cpar/main/MUYARGAS'.jpg",
    position: [2.15, 0, 1.5],
    rotation: [0, -Math.PI / 2.5, 0],
    label: 'timeless echo\nclassic motif\nartistic assembly\nG7007'
  },
  {
    url: "https://raw.githubusercontent.com/KUROSUPARKER/assets-cpar/main/TORRES'.png",
    position: [2, 0, 2.75],
    rotation: [0, -Math.PI / 2.5, 0],
    label: 'enigmatic marvel\nintricate detail\ngroup masterpiece\nH8008'
  }
]

// Render the app with the images prop
createRoot(document.getElementById('root')).render(<App images={images} />)
