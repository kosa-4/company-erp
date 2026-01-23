'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Float, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
// import { motion } from 'framer-motion-3d'; // Unused

const TOTAL_SLIDES = 23;
// 1.png ~ 23.png paths
const SLIDE_URLS = Array.from({ length: TOTAL_SLIDES }, (_, i) => `/ppt/${i + 1}.png`);

const SLIDE_WIDTH = 12.3;
const SLIDE_HEIGHT = 6.7;

export const PresentationScene = ({ currentSlide }: { currentSlide: number }) => {
  return (
    <group>
      <AutoFitCamera />
      
      {/* 1. Background Base Color (Fog Removed for clarity) */}
      <color attach="background" args={['#ffffff']} />

      {/* 2. Interactive/Motion Background Elements - REMOVED */}
      
      {/* 3. Subtle Floor Grid */}
      <Grid 
        position={[0, -4, 0]} 
        args={[30, 30]} 
        cellSize={1.5} 
        cellThickness={1}
        cellColor="#e5e7eb" 
        sectionSize={4.5} 
        sectionThickness={1.2}
        sectionColor="#d1d5db" 
        fadeDistance={25}
        fadeStrength={1.5}
      />
      
      {/* 4. Lights */}
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.5} />
      
      {/* Environment for nice reflections */}
      <Environment preset="city" />

      {/* Floating slides container */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, -0.1, 0]}>
            {SLIDE_URLS.map((url, i) => {
                const offset = i - currentSlide;
                
                // Massive Cinema Spacing
                const x = offset * 12; // Very wide spacing
                const z = -Math.abs(offset) * 5; 
                const rY = -offset * 0.15; // Subtle rotation
                
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
      </Float>
    </group>
  );
};

// Subtle animated background shapes


// Automatically adjusts camera distance to fit the slide perfectly
const AutoFitCamera = () => {
    useFrame((state, delta) => {
        const aspect = state.viewport.aspect;
        const fov = state.camera instanceof THREE.PerspectiveCamera ? state.camera.fov : 45;
        
        // Add some padding (margin)
        const targetW = SLIDE_WIDTH * 1.2; 
        const targetH = SLIDE_HEIGHT * 1.2; 
        
        // Calculate distance needed for vertical fit
        const vFovRad = THREE.MathUtils.degToRad(fov);
        const distH = targetH / (2 * Math.tan(vFovRad / 2));
        
        // Calculate distance needed for horizontal fit
        const distW = targetW / (2 * Math.tan(vFovRad / 2) * aspect);
        
        // Choose the larger distance to ensure full visibility
        const targetZ = Math.max(distH, distW, 8);
        
        // Smoothly move camera
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 3);
    });
    return null;
};

// Wrapper handles the smooth animation of each slide to its target state
const SlideWrapper = ({ url, isActive, targetPosition, targetRotation }: any) => {
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
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation[1], delta * 4);
    });

    return (
        <group ref={meshRef}>
            {/* The 3D Box Slide */}
            {/* The 3D Box Slide */}
            <mesh>
                {/* Width, Height, Depth */}
                <boxGeometry args={[SLIDE_WIDTH, SLIDE_HEIGHT, thickness]} />
                {/* Materials array: [Right, Left, Top, Bottom, Front, Back] */}
                
                {/* Sides: Clean Light Gray (No Metal) */}
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
