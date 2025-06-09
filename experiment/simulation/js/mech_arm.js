"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";

const origin = { x: 0, y: 0, z: 0 };

// Helper function to create materials with proper depth handling
function createMaterial(color) {
  return new THREE.MeshPhongMaterial({
    color: color,
    shininess: 30,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    side: THREE.DoubleSide
  });
}

export const createArm = function (
  scene,
  hand_comp,
  arm_dim,
  arm_pos,
  fore_dim,
  fore_pos,
  palm_dim,
  palm_pos
) {
  // Creating groups, which hold the arm, forearm and palm
  const shoulder = new THREE.Group();
  shoulder.position.set(origin.x, origin.y, origin.z);

  const arm_cyl_geo = new THREE.CylinderGeometry(
    arm_dim.y / 4,
    arm_dim.y / 4,
    arm_dim.z,
    32
  );
  const arm_cyl_mat = createMaterial(0x0000ff);
  const arm_cyl = new THREE.Mesh(arm_cyl_geo, arm_cyl_mat);
  arm_cyl.rotation.x = Math.PI / 2;
  arm_cyl.position.set(0, 0, 0);

  const arm_box_geo = new THREE.BoxGeometry(arm_dim.x, arm_dim.y, arm_dim.z);
  const arm_box_mat = createMaterial(0xff7f50);
  const arm_box = new THREE.Mesh(arm_box_geo, arm_box_mat);
  arm_box.position.set(arm_dim.x / 2, -arm_dim.y / 2, 0);

  const arm = new THREE.Group();
  arm.add(arm_cyl);
  arm.add(arm_box);

  const elbow_cyl_geo = new THREE.CylinderGeometry(
    arm_dim.y / 4,
    arm_dim.y / 4,
    arm_dim.z,
    32
  );
  const elbow_cyl_mat = createMaterial(0xff69b4);
  const elbow_cyl = new THREE.Mesh(elbow_cyl_geo, elbow_cyl_mat);
  elbow_cyl.rotation.x = Math.PI / 2;
  elbow_cyl.position.set(0, -fore_dim.y / 2, 0);

  const f_geo = new THREE.BoxGeometry(fore_dim.x, fore_dim.y, fore_dim.z);
  const f_mat = createMaterial(0x00ff00);
  const fore_arm = new THREE.Mesh(f_geo, f_mat);
  fore_arm.position.set(fore_dim.x / 2, fore_dim.y / 2, 0);

  const elbow = new THREE.Group();
  elbow.add(elbow_cyl);
  elbow.add(fore_arm);
  elbow.position.set(arm_dim.x, -arm_dim.y, 0);
  
  const wrist = new THREE.Group();
  wrist.position.set(fore_dim.x, 0, 0);

  const wrist_cyl_geo = new THREE.CylinderGeometry(
    arm_dim.y / 4,
    arm_dim.y / 4,
    arm_dim.z,
    32
  );
  const wrist_cyl_mat = createMaterial(0xa52a2a);
  const wrist_cyl = new THREE.Mesh(wrist_cyl_geo, wrist_cyl_mat);
  wrist_cyl.rotation.x = Math.PI / 2;
  
  const p_geo = new THREE.BoxGeometry(palm_dim.x, palm_dim.y, palm_dim.z);
  const p_mat = createMaterial(0x00abcd);
  const palm = new THREE.Mesh(p_geo, p_mat);
  palm.position.set(palm_dim.x / 2, 0, 0);

  // adding objects in a hierarchical fashion
  wrist.add(wrist_cyl);
  wrist.add(palm);

  elbow.add(fore_arm);
  elbow.add(wrist);

  shoulder.add(arm);
  shoulder.add(elbow);

  scene.add(shoulder);

  // push the groups into the hand object
  hand_comp.push(shoulder);
  hand_comp.push(elbow);
  hand_comp.push(wrist);
};

export const moveArm = function (hand_comp, moveBy) {
  hand_comp[0].translateOnAxis(new THREE.Vector3(1, 0, 0), moveBy.x);
  hand_comp[0].translateOnAxis(new THREE.Vector3(0, 1, 0), moveBy.y);
  hand_comp[0].translateOnAxis(new THREE.Vector3(0, 0, 1), moveBy.z);
};
