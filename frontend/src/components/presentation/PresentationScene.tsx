'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const TOTAL_SLIDES = 22;
const SLIDE_URLS = Array.from({ length: TOTAL_SLIDES }, (_, i) => `/ppt/${i + 1}.png`);

const SLIDE_WIDTH = 12.3;
const SLIDE_HEIGHT = 6.7;

export const PresentationScene = ({ currentSlide }: { currentSlide: number }) => {
  return (
    <group>
      <AutoFitCamera />
      
      {/* 1. Background Base Color */}
      <color attach="background" args={['#f5f5f5']} />

      {/* 2. Lights */}
      <ambientLight intensity={0.8} />
      <spotLight position={[0, 10, 10]} angle={0.5} penumbra={1} intensity={1} />
      <pointLight position={[-10, 0, -10]} intensity={0.5} />
      
      {/* Environment */}
      <Environment preset="city" />

      {/* 3. Slides Container "Card Deck Layout" */}
      <group position={[0, 0, 0]}>
          {SLIDE_URLS.map((url, i) => {
              const offset = i - currentSlide;
              
              // Card Deck / Cover Flow Layout
              const x = offset * 2.5; // Tight overlap like a deck
              const z = -Math.abs(offset) * 3.5; // Recede into background
              const rY = -offset * 0.25; // Fan curve
              
              return (
                  <SlideWrapper 
                      key={url}
                      url={url} 
                      isActive={i === currentSlide}
                      targetPosition={[x, 0, z]}
                      targetRotation={[0, rY, 0]}
                  />
              );
          })}
      </group>

      {/* 4. Contact Shadows for Floating Deck */}
      <ContactShadows 
         position={[0, -4, 0]} 
         opacity={0.65} 
         scale={50} 
         blur={2} 
         far={10} 
         color="#000000"
      />
    </group>
  );
};

// Automatically adjusts camera distance to fit the slide perfectly
const AutoFitCamera = () => {
    useFrame((state, delta) => {
        const aspect = state.viewport.aspect;
        const fov = state.camera instanceof THREE.PerspectiveCamera ? state.camera.fov : 45;
        
        const targetW = SLIDE_WIDTH * 1.2; 
        const targetH = SLIDE_HEIGHT * 1.2; 
        
        const vFovRad = THREE.MathUtils.degToRad(fov);
        const distH = targetH / (2 * Math.tan(vFovRad / 2));
        const distW = targetW / (2 * Math.tan(vFovRad / 2) * aspect);
        
        const targetZ = Math.max(distH, distW, 8);
        
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 3);
    });
    return null;
};

interface SlideWrapperProps {
    url: string;
    isActive: boolean;
    targetPosition: [number, number, number];
    targetRotation: [number, number, number];
}

// Wrapper handles the smooth animation of each slide to its target state
const SlideWrapper = ({ url, isActive, targetPosition, targetRotation }: SlideWrapperProps) => {
    const meshRef = useRef<THREE.Group>(null);
    const texture = useTexture(url);
    const thickness = 0.2; 

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        
        // Position lerp
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetPosition[0], delta * 4);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPosition[1], delta * 4);
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetPosition[2], delta * 4);
        
        // Rotation lerp
        // No mouse tilt, just clean interpolation to target state
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation[0], delta * 4);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation[1], delta * 4);
    });

    return (
        <group ref={meshRef}>
            {/* The 3D Box Slide */}
            <mesh>
                <boxGeometry args={[SLIDE_WIDTH, SLIDE_HEIGHT, thickness]} />
                
                {/* Sides: Clean Light Gray */}
                <meshStandardMaterial attach="material-0" color="#eeeeee" roughness={0.5} />
                <meshStandardMaterial attach="material-1" color="#eeeeee" roughness={0.5} />
                <meshStandardMaterial attach="material-2" color="#eeeeee" roughness={0.5} />
                <meshStandardMaterial attach="material-3" color="#eeeeee" roughness={0.5} />
                
                {/* Front: Basic Material for Original Image Clarity */}
                <meshBasicMaterial 
                    attach="material-4" 
                    map={texture} 
                    toneMapped={false} 
                />
                
                {/* Back: Clean White */}
                <meshStandardMaterial attach="material-5" color="#ffffff" roughness={0.5} />
            </mesh>
        </group>
    );
}
