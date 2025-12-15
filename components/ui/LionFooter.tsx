import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- Helper Functions ---
function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
}

function rule3(v: number, vmin: number, vmax: number, tmin: number, tmax: number) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;
}

// --- 3D Classes ---

class Fan {
    isBlowing = false;
    speed = 0;
    acc = 0;
    redMat = new THREE.MeshLambertMaterial({ color: 0xad3525, flatShading: true });
    greyMat = new THREE.MeshLambertMaterial({ color: 0x653f4c, flatShading: true });
    yellowMat = new THREE.MeshLambertMaterial({ color: 0xfdd276, flatShading: true });
    
    threegroup: THREE.Group;
    core: THREE.Mesh;
    propeller: THREE.Group;
    sphere: THREE.Mesh;
    tPosX = 0;
    tPosY = 0;
    targetSpeed = 0;

    constructor() {
        this.threegroup = new THREE.Group();

        var coreGeom = new THREE.BoxGeometry(10, 10, 20);
        var sphereGeom = new THREE.BoxGeometry(10, 10, 3);
        var propGeom = new THREE.BoxGeometry(10, 30, 2);
        propGeom.translate(0, 25, 0);

        this.core = new THREE.Mesh(coreGeom, this.greyMat);

        // propellers
        var prop1 = new THREE.Mesh(propGeom, this.redMat);
        prop1.position.z = 15;
        var prop2 = prop1.clone();
        prop2.rotation.z = Math.PI / 2;
        var prop3 = prop1.clone();
        prop3.rotation.z = Math.PI;
        var prop4 = prop1.clone();
        prop4.rotation.z = -Math.PI / 2;

        this.sphere = new THREE.Mesh(sphereGeom, this.yellowMat);
        this.sphere.position.z = 15;

        this.propeller = new THREE.Group();
        this.propeller.add(prop1);
        this.propeller.add(prop2);
        this.propeller.add(prop3);
        this.propeller.add(prop4);

        this.threegroup.add(this.core);
        this.threegroup.add(this.propeller);
        this.threegroup.add(this.sphere);
    }

    update(xTarget: number, yTarget: number, deltaTime: number) {
        this.threegroup.lookAt(new THREE.Vector3(0, 80, 60));
        this.tPosX = rule3(xTarget, -200, 200, -250, 250);
        this.tPosY = rule3(yTarget, -200, 200, 250, -250);

        this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) * deltaTime * 4;
        this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) * deltaTime * 4;

        this.targetSpeed = (this.isBlowing) ? 15 * deltaTime : 5 * deltaTime;
        if (this.isBlowing && this.speed < this.targetSpeed) {
            this.acc += .01 * deltaTime;
            this.speed += this.acc;
        } else if (!this.isBlowing) {
            this.acc = 0;
            this.speed *= Math.pow(.4, deltaTime);
        }
        this.propeller.rotation.z += this.speed;
    }
}

class Lion {
    threegroup = new THREE.Group();
    windTime = 0;
    maneParts: any[] = [];
    mustaches: THREE.Mesh[] = [];
    
    // Materials
    yellowMat = new THREE.MeshLambertMaterial({ color: 0xfdd276, flatShading: true });
    redMat = new THREE.MeshLambertMaterial({ color: 0xad3525, flatShading: true });
    pinkMat = new THREE.MeshLambertMaterial({ color: 0xe55d2b, flatShading: true });
    whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    purpleMat = new THREE.MeshLambertMaterial({ color: 0x451954, flatShading: true });
    greyMat = new THREE.MeshLambertMaterial({ color: 0x653f4c, flatShading: true });
    blackMat = new THREE.MeshLambertMaterial({ color: 0x302925, flatShading: true });

    // Body Parts
    body: THREE.Mesh;
    head: THREE.Group;
    mane: THREE.Group;
    leftEye: THREE.Mesh;
    rightEye: THREE.Mesh;
    leftIris: THREE.Mesh;
    rightIris: THREE.Mesh;
    leftKnee: THREE.Mesh;
    rightKnee: THREE.Mesh;
    lips: THREE.Mesh;
    smile: THREE.Mesh;
    mouth: THREE.Mesh;
    rightEar: THREE.Mesh;
    leftEar: THREE.Mesh;
    nose: THREE.Mesh;
    
    // Target Variables for Animation
    tHeagRotY = 0; tHeadRotX = 0; tHeadPosX = 0; tHeadPosY = 0; tHeadPosZ = 0;
    tEyeScale = 1; tIrisYScale = 1; tIrisZScale = 1; tIrisPosY = 0;
    tLeftIrisPosZ = 0; tRightIrisPosZ = 0;
    tLipsPosX = 0; tLipsPosY = 0;
    tSmilePosX = 0; tMouthPosZ = 0; tSmilePosZ = 0; tSmilePosY = 0; tSmileRotZ = 0;
    tRightKneeRotZ = 0; tLeftKneeRotZ = 0;

    constructor() {
        // Geometries
        var bodyGeom = new THREE.CylinderGeometry(30, 80, 140, 4);
        var maneGeom = new THREE.BoxGeometry(40, 40, 15);
        var faceGeom = new THREE.BoxGeometry(80, 80, 80);
        var spotGeom = new THREE.BoxGeometry(4, 4, 4);
        var mustacheGeom = new THREE.BoxGeometry(30, 2, 1);
        mustacheGeom.translate(15, 0, 0);

        var earGeom = new THREE.BoxGeometry(20, 20, 20);
        var noseGeom = new THREE.BoxGeometry(40, 40, 20);
        var eyeGeom = new THREE.BoxGeometry(5, 30, 30);
        var irisGeom = new THREE.BoxGeometry(4, 10, 10);
        var mouthGeom = new THREE.BoxGeometry(20, 20, 10);
        var smileGeom = new THREE.TorusGeometry(12, 4, 2, 10, Math.PI);
        var lipsGeom = new THREE.BoxGeometry(40, 15, 20);
        var kneeGeom = new THREE.BoxGeometry(25, 80, 80);
        kneeGeom.translate(0, 50, 0);
        var footGeom = new THREE.BoxGeometry(40, 20, 20);

        // Body
        this.body = new THREE.Mesh(bodyGeom, this.yellowMat);
        this.body.position.z = -60;
        this.body.position.y = -30;

        // Knees
        this.leftKnee = new THREE.Mesh(kneeGeom, this.yellowMat);
        this.leftKnee.position.set(65, -110, -20);
        this.leftKnee.rotation.z = -.3;

        this.rightKnee = new THREE.Mesh(kneeGeom, this.yellowMat);
        this.rightKnee.position.set(-65, -110, -20);
        this.rightKnee.rotation.z = .3;

        // Feet
        const backLeftFoot = new THREE.Mesh(footGeom, this.yellowMat);
        backLeftFoot.position.set(75, -90, 30);
        const backRightFoot = new THREE.Mesh(footGeom, this.yellowMat);
        backRightFoot.position.set(-75, -90, 30);
        const frontRightFoot = new THREE.Mesh(footGeom, this.yellowMat);
        frontRightFoot.position.set(-22, -90, 40);
        const frontLeftFoot = new THREE.Mesh(footGeom, this.yellowMat);
        frontLeftFoot.position.set(22, -90, 40);

        // Mane
        this.mane = new THREE.Group();
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                var manePart = new THREE.Mesh(maneGeom, this.redMat);
                manePart.position.x = (j * 40) - 60;
                manePart.position.y = (k * 40) - 60;

                var amp, zOffset;
                var periodOffset = Math.random() * Math.PI * 2;

                if ((j === 0 && k === 0) || (j === 0 && k === 3) || (j === 3 && k === 0) || (j === 3 && k === 3)) {
                    amp = -10 - Math.floor(Math.random() * 5);
                    zOffset = -5;
                } else if (j === 0 || k === 0 || j === 3 || k === 3) {
                    amp = -5 - Math.floor(Math.random() * 5);
                    zOffset = 0;
                } else {
                    amp = 0;
                    zOffset = 0;
                }

                this.maneParts.push({ mesh: manePart, amp: amp, zOffset: zOffset, periodOffset: periodOffset, xInit: manePart.position.x, yInit: manePart.position.y });
                this.mane.add(manePart);
            }
        }
        this.mane.position.y = -10;
        this.mane.position.z = 80;

        // Face
        var face = new THREE.Mesh(faceGeom, this.yellowMat);
        face.position.z = 135;

        // Mustaches
        var mustache1 = new THREE.Mesh(mustacheGeom, this.greyMat);
        mustache1.position.set(30, -5, 175);
        var mustache2 = mustache1.clone();
        mustache2.position.set(35, -12, 175);
        var mustache3 = mustache1.clone();
        mustache3.position.set(30, -19, 175);
        var mustache4 = mustache1.clone();
        mustache4.rotation.z = Math.PI;
        mustache4.position.set(-30, -5, 175);
        var mustache5 = mustache2.clone();
        mustache5.rotation.z = Math.PI;
        mustache5.position.set(-35, -12, 175);
        var mustache6 = mustache3.clone();
        mustache6.rotation.z = Math.PI;
        mustache6.position.set(-30, -19, 175);

        this.mustaches.push(mustache1, mustache2, mustache3, mustache4, mustache5, mustache6);

        // Spots
        var spot1 = new THREE.Mesh(spotGeom, this.redMat);
        spot1.position.set(39, 0, 150);
        var spot2 = spot1.clone();
        spot2.position.set(39, -10, 160);
        var spot3 = spot1.clone();
        spot3.position.set(39, -15, 140);
        var spot4 = spot1.clone();
        spot4.position.set(39, -20, 150);
        var spot5 = spot1.clone();
        spot5.position.set(-39, 0, 150);
        var spot6 = spot2.clone();
        spot6.position.set(-39, -10, 160);
        var spot7 = spot3.clone();
        spot7.position.set(-39, -15, 140);
        var spot8 = spot4.clone();
        spot8.position.set(-39, -20, 150);

        // Eyes
        this.leftEye = new THREE.Mesh(eyeGeom, this.whiteMat);
        this.leftEye.position.set(40, 25, 120);
        this.rightEye = new THREE.Mesh(eyeGeom, this.whiteMat);
        this.rightEye.position.set(-40, 25, 120);

        // Iris
        this.leftIris = new THREE.Mesh(irisGeom, this.purpleMat);
        this.leftIris.position.set(42, 25, 120);
        this.rightIris = new THREE.Mesh(irisGeom, this.purpleMat);
        this.rightIris.position.set(-42, 25, 120);

        // Mouth & Smile
        this.mouth = new THREE.Mesh(mouthGeom, this.blackMat);
        this.mouth.position.set(0, -30, 171);
        this.mouth.scale.set(.5, .5, 1);

        this.smile = new THREE.Mesh(smileGeom, this.greyMat);
        this.smile.position.set(0, -15, 173);
        this.smile.rotation.z = -Math.PI;

        this.lips = new THREE.Mesh(lipsGeom, this.yellowMat);
        this.lips.position.set(0, -45, 165);

        // Ears
        this.rightEar = new THREE.Mesh(earGeom, this.yellowMat);
        this.rightEar.position.set(-50, 50, 105);
        this.leftEar = new THREE.Mesh(earGeom, this.yellowMat);
        this.leftEar.position.set(50, 50, 105);

        // Nose
        this.nose = new THREE.Mesh(noseGeom, this.greyMat);
        this.nose.position.set(0, 25, 170);

        // Assemble Head
        this.head = new THREE.Group();
        this.head.add(face, this.mane, this.rightEar, this.leftEar, this.nose, this.leftEye, this.rightEye, this.leftIris, this.rightIris, this.mouth, this.smile, this.lips);
        this.head.add(spot1, spot2, spot3, spot4, spot5, spot6, spot7, spot8);
        this.head.add(mustache1, mustache2, mustache3, mustache4, mustache5, mustache6);
        this.head.position.y = 60;

        // Assemble Lion
        this.threegroup.add(this.body, this.head, this.leftKnee, this.rightKnee, backLeftFoot, backRightFoot, frontRightFoot, frontLeftFoot);

        this.threegroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    updateBody(speed: number) {
        this.head.rotation.y += (this.tHeagRotY - this.head.rotation.y) / speed;
        this.head.rotation.x += (this.tHeadRotX - this.head.rotation.x) / speed;
        this.head.position.x += (this.tHeadPosX - this.head.position.x) / speed;
        this.head.position.y += (this.tHeadPosY - this.head.position.y) / speed;
        this.head.position.z += (this.tHeadPosZ - this.head.position.z) / speed;

        this.leftEye.scale.y += (this.tEyeScale - this.leftEye.scale.y) / (speed * 2);
        this.rightEye.scale.y = this.leftEye.scale.y;

        this.leftIris.scale.y += (this.tIrisYScale - this.leftIris.scale.y) / (speed * 2);
        this.rightIris.scale.y = this.leftIris.scale.y;

        this.leftIris.scale.z += (this.tIrisZScale - this.leftIris.scale.z) / (speed * 2);
        this.rightIris.scale.z = this.leftIris.scale.z;

        this.leftIris.position.y += (this.tIrisPosY - this.leftIris.position.y) / speed;
        this.rightIris.position.y = this.leftIris.position.y;
        this.leftIris.position.z += (this.tLeftIrisPosZ - this.leftIris.position.z) / speed;
        this.rightIris.position.z += (this.tRightIrisPosZ - this.rightIris.position.z) / speed;

        this.rightKnee.rotation.z += (this.tRightKneeRotZ - this.rightKnee.rotation.z) / speed;
        this.leftKnee.rotation.z += (this.tLeftKneeRotZ - this.leftKnee.rotation.z) / speed;

        this.lips.position.x += (this.tLipsPosX - this.lips.position.x) / speed;
        this.lips.position.y += (this.tLipsPosY - this.lips.position.y) / speed;
        this.smile.position.x += (this.tSmilePosX - this.smile.position.x) / speed;
        this.mouth.position.z += (this.tMouthPosZ - this.mouth.position.z) / speed;
        this.smile.position.z += (this.tSmilePosZ - this.smile.position.z) / speed;
        this.smile.position.y += (this.tSmilePosY - this.smile.position.y) / speed;
        this.smile.rotation.z += (this.tSmileRotZ - this.smile.rotation.z) / speed;
    }

    look(xTarget: number, yTarget: number) {
        this.tHeagRotY = rule3(xTarget, -200, 200, -Math.PI / 4, Math.PI / 4);
        this.tHeadRotX = rule3(yTarget, -200, 200, -Math.PI / 4, Math.PI / 4);
        this.tHeadPosX = rule3(xTarget, -200, 200, 70, -70);
        this.tHeadPosY = rule3(yTarget, -140, 260, 20, 100);
        this.tHeadPosZ = 0;

        this.tEyeScale = 1;
        this.tIrisYScale = 1;
        this.tIrisZScale = 1;
        this.tIrisPosY = rule3(yTarget, -200, 200, 35, 15);
        this.tLeftIrisPosZ = rule3(xTarget, -200, 200, 130, 110);
        this.tRightIrisPosZ = rule3(xTarget, -200, 200, 110, 130);

        this.tLipsPosX = 0;
        this.tLipsPosY = -45;

        this.tSmilePosX = 0;
        this.tMouthPosZ = 174;
        this.tSmilePosZ = 173;
        this.tSmilePosY = -15;
        this.tSmileRotZ = -Math.PI;

        this.tRightKneeRotZ = rule3(xTarget, -200, 200, .3 - Math.PI / 8, .3 + Math.PI / 8);
        this.tLeftKneeRotZ = rule3(xTarget, -200, 200, -.3 - Math.PI / 8, -.3 + Math.PI / 8);

        this.updateBody(10);

        this.mane.rotation.y = 0;
        this.mane.rotation.x = 0;

        for (let i = 0; i < this.maneParts.length; i++) {
            let m = this.maneParts[i].mesh;
            m.position.z = 0;
            m.rotation.y = 0;
        }

        for (let i = 0; i < this.mustaches.length; i++) {
            let m = this.mustaches[i];
            m.rotation.y = 0;
        }
    }

    cool(xTarget: number, yTarget: number, deltaTime: number) {
        this.tHeagRotY = rule3(xTarget, -200, 200, Math.PI / 4, -Math.PI / 4);
        this.tHeadRotX = rule3(yTarget, -200, 200, Math.PI / 4, -Math.PI / 4);
        this.tHeadPosX = rule3(xTarget, -200, 200, -70, 70);
        this.tHeadPosY = rule3(yTarget, -140, 260, 100, 20);
        this.tHeadPosZ = 100;

        this.tEyeScale = 0.1;
        this.tIrisYScale = 0.1;
        this.tIrisZScale = 3;

        this.tIrisPosY = 20;
        this.tLeftIrisPosZ = 120;
        this.tRightIrisPosZ = 120;

        this.tLipsPosX = rule3(xTarget, -200, 200, -15, 15);
        this.tLipsPosY = rule3(yTarget, -200, 200, -45, -40);

        this.tMouthPosZ = 168;
        this.tSmilePosX = rule3(xTarget, -200, 200, -15, 15);
        this.tSmilePosY = rule3(yTarget, -200, 200, -20, -8);
        this.tSmilePosZ = 176;
        this.tSmileRotZ = rule3(xTarget, -200, 200, -Math.PI - .3, -Math.PI + .3);

        this.tRightKneeRotZ = rule3(xTarget, -200, 200, .3 + Math.PI / 8, .3 - Math.PI / 8);
        this.tLeftKneeRotZ = rule3(xTarget, -200, 200, -.3 + Math.PI / 8, -.3 - Math.PI / 8);

        this.updateBody(10);

        this.mane.rotation.y = -.8 * this.head.rotation.y;
        this.mane.rotation.x = -.8 * this.head.rotation.x;

        var dt = 20000 / (xTarget * xTarget + yTarget * yTarget);
        dt = Math.max(Math.min(dt, 1), .5);
        this.windTime += dt * deltaTime * 40;

        for (let i = 0; i < this.maneParts.length; i++) {
            let m = this.maneParts[i].mesh;
            let amp = this.maneParts[i].amp;
            let zOffset = this.maneParts[i].zOffset;
            let periodOffset = this.maneParts[i].periodOffset;

            m.position.z = zOffset + Math.sin(this.windTime + periodOffset) * amp * dt * 2;
        }

        this.leftEar.rotation.x = Math.cos(this.windTime) * Math.PI / 16 * dt;
        this.rightEar.rotation.x = -Math.cos(this.windTime) * Math.PI / 16 * dt;

        for (let i = 0; i < this.mustaches.length; i++) {
            let m = this.mustaches[i];
            let amp = (i < 3) ? -Math.PI / 8 : Math.PI / 8;
            m.rotation.y = amp + Math.cos(this.windTime + i) * dt * amp;
        }
    }
}

// --- Main Component ---

export const LionFooter = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const isBlowing = useRef(false);

    useEffect(() => {
        if (!containerRef.current) return;

        // Init Scene
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const scene = new THREE.Scene();
        // Use fog color to blend with container background
        scene.fog = new THREE.Fog(0xebe5e7, 650, 1000);

        // Camera
        const aspectRatio = width / height;
        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 2000;
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.set(0, 30, 800); // Adjusted Y/Z for footer view
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Lights
        const light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5);
        
        const shadowLight = new THREE.DirectionalLight(0xffffff, .8);
        shadowLight.position.set(200, 200, 200);
        shadowLight.castShadow = true;
        // Shadow optimization
        shadowLight.shadow.mapSize.width = 1024;
        shadowLight.shadow.mapSize.height = 1024;
        
        const backLight = new THREE.DirectionalLight(0xffffff, .4);
        backLight.position.set(-100, 200, 50);
        backLight.castShadow = true;

        scene.add(backLight);
        scene.add(light);
        scene.add(shadowLight);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 1000), 
            new THREE.ShadowMaterial({ opacity: 0.1 }) // Use ShadowMaterial to show shadow on transparent BG
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -100;
        floor.receiveShadow = true;
        scene.add(floor);

        // Objects
        const lion = new Lion();
        scene.add(lion.threegroup);

        const fan = new Fan();
        fan.threegroup.position.z = 350;
        scene.add(fan.threegroup);

        // Events
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseDown = () => { isBlowing.current = true; };
        const handleMouseUp = () => { isBlowing.current = false; };
        
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mousePos.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
                isBlowing.current = true;
            }
        };
        const handleTouchEnd = () => { isBlowing.current = false; };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                // e.preventDefault(); // removed to allow scroll
                mousePos.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            }
        };

        const handleResize = () => {
            if (!container) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            renderer.setSize(newWidth, newHeight);
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleResize);
        // Touch events on window or container? Window is better for dragging behavior.
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchmove', handleTouchMove);

        // Animation Loop
        const clock = new THREE.Clock();
        let animationId: number;

        const loop = () => {
            const deltaTime = clock.getDelta();
            
            // Calculate targets based on mouse position relative to window center
            const windowHalfX = window.innerWidth / 2;
            const windowHalfY = window.innerHeight / 2;
            const xTarget = (mousePos.current.x - windowHalfX);
            const yTarget = (mousePos.current.y - windowHalfY);

            fan.isBlowing = isBlowing.current;
            fan.update(xTarget, yTarget, deltaTime);
            
            if (isBlowing.current) {
                lion.cool(xTarget, yTarget, deltaTime);
            } else {
                lion.look(xTarget, yTarget);
            }

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            
            if (container) container.removeChild(renderer.domElement);
            renderer.dispose();
            
            // Basic cleanup
            lion.threegroup.clear();
            fan.threegroup.clear();
            scene.clear();
        };
    }, []);

    return (
        <div className="w-full relative bg-[#ebe5e7] dark:bg-[#1a1a1a] transition-colors duration-300">
            {/* 提示文案 */}
            <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10 select-none opacity-60">
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                    Press and hold to create wind
                </p>
            </div>
            
            <div 
                ref={containerRef} 
                className="w-full h-[350px] md:h-[450px] cursor-grab active:cursor-grabbing" 
            />
        </div>
    );
};
