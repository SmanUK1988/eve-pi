import React, { useEffect } from "react";
import { PlanetInfo, PlanetInfoUniverse } from "./PlanetCard";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const commandCenterIds = [2254, 2524, 2525, 2533, 2534, 2549, 2550, 2551];

const PinsCanvas3D = ({
  planetInfo,
}: {
  planetInfo: PlanetInfo | undefined;
}) => {
  useEffect(() => {
    if (!planetInfo) return;
    const pinsWithoutCommandCentes =
      planetInfo?.pins.filter(
        (p) => !commandCenterIds.some((c) => c === p.type_id)
      ) ?? [];

    const CANVAS = document.querySelector("#canvas") as HTMLCanvasElement;

    if (!CANVAS) return;

    const SCENE_ANTIALIAS = true;
    const SCENE_ALPHA = true;
    const SCENE_BACKGROUND_COLOR = 0x000000;

    const CAMERA_FOV = 20;
    const CAMERA_NEAR = 100;
    const CAMERA_FAR = 500;
    const CAMERA_X = 0;
    const CAMERA_Y = 0;
    const CAMERA_Z = 220;

    const SPHERE_RADIUS = 30;
    const LATITUDE_COUNT = 40;
    const LONGITUDE_COUNT = 80;

    const DOT_SIZE = 0.2;
    const DOT_COLOR = 0x36454f;

    const renderScene = () => {
      const renderer = new THREE.WebGLRenderer({
        canvas: CANVAS as HTMLCanvasElement,
        antialias: SCENE_ANTIALIAS,
        alpha: SCENE_ALPHA,
      });

      const camera = new THREE.PerspectiveCamera(
        CAMERA_FOV,
        CANVAS.width / CANVAS.height,
        CAMERA_NEAR,
        CAMERA_FAR
      );

      const controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(CAMERA_X, CAMERA_Y, CAMERA_Z);
      controls.rotateSpeed *= -1;
      controls.update();

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR);

      const dotGeometries: THREE.CircleGeometry[] = [];
      const dotGeometriesPI: THREE.CircleGeometry[] = [];

      const vector = new THREE.Vector3();
      const vectorPI = new THREE.Vector3();

      pinsWithoutCommandCentes.forEach((p) => {
        const dotGeometryPI = new THREE.CircleGeometry(DOT_SIZE, 9);
        const phi = p.latitude;
        const theta = p.longitude;
        vectorPI.setFromSphericalCoords(SPHERE_RADIUS, phi, theta);
        dotGeometryPI.lookAt(vectorPI);
        dotGeometryPI.translate(vectorPI.x, vectorPI.y, vectorPI.z);
        dotGeometriesPI.push(dotGeometryPI);
      });

      for (let lat = 0; lat < LATITUDE_COUNT; lat += 1) {
        for (let lng = 0; lng < LONGITUDE_COUNT; lng += 1) {
          const dotGeometry = new THREE.CircleGeometry(DOT_SIZE, 5);
          const phi = (Math.PI / LATITUDE_COUNT) * lat;
          const theta = ((2 * Math.PI) / LONGITUDE_COUNT) * lng;
          vector.setFromSphericalCoords(SPHERE_RADIUS, phi, theta);
          dotGeometry.lookAt(vector);
          dotGeometry.translate(vector.x, vector.y, vector.z);
          dotGeometries.push(dotGeometry);
        }
      }

      const mergedDotGeometries =
        BufferGeometryUtils.mergeBufferGeometries(dotGeometries);

      const mergedDotGeometriesPI =
        BufferGeometryUtils.mergeBufferGeometries(dotGeometriesPI);

      const dotMaterial = new THREE.MeshBasicMaterial({
        color: DOT_COLOR,
        side: THREE.DoubleSide,
      });

      const dotMaterialPI = new THREE.MeshBasicMaterial({
        color: 0xfdda0d,
        side: THREE.DoubleSide,
      });
      const dotMesh = new THREE.Mesh(mergedDotGeometries, dotMaterial);
      const dotMeshPI = new THREE.Mesh(mergedDotGeometriesPI, dotMaterialPI);

      scene.add(dotMesh);
      scene.add(dotMeshPI);

      const animate = (time: number) => {
        time *= 0.001;
        controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    };

    const setCanvasSize = () => {
      CANVAS.width = window.innerWidth;
      CANVAS.height = window.innerHeight;

      renderScene();
    };

    setCanvasSize();

    // When the window isresized, redraw the scene.
    window.addEventListener("resize", setCanvasSize);
  }, [planetInfo]);

  return <canvas id="canvas"></canvas>;
};

export default PinsCanvas3D;