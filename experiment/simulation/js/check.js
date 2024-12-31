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
  const shoulder = new THREE.Group();
  shoulder.position.set(origin.x, origin.y, origin.z);

  const arm_cyl_geo = new THREE.CylinderGeometry(
    arm_dim.y / 4,
    arm_dim.y / 4,
    arm_dim.z,
    32
  );
  const arm_cyl_mat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const arm_cyl = new THREE.Mesh(arm_cyl_geo, arm_cyl_mat);
  arm_cyl.rotation.x = Math.PI / 2;
  arm_cyl.position.set(0, 0, 0);

  const arm_box_geo = new THREE.BoxGeometry(arm_dim.x, arm_dim.y, arm_dim.z);
  const arm_box_mat = new THREE.MeshBasicMaterial({ color: 0xff7f50 });
  const arm_box = new THREE.Mesh(arm_box_geo, arm_box_mat);
  arm_box.position.set(arm_dim.x / 2, -arm_dim.y / 1.35, 0);

  const arm = new THREE.Group();
  arm.add(arm_cyl);
  arm.add(arm_box);

  const elbow_cyl_geo = new THREE.CylinderGeometry(
    arm_dim.y / 4,
    arm_dim.y / 4,
    arm_dim.z,
    32
  );
  const elbow_cyl_mat = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
  const elbow_cyl = new THREE.Mesh(elbow_cyl_geo, elbow_cyl_mat);
  elbow_cyl.rotation.x = Math.PI / 2;
  elbow_cyl.position.set(0, -1.5, 0);

  const f_geo = new THREE.BoxGeometry(2 * fore_dim.x, fore_dim.y, fore_dim.z);
  const f_mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const fore_arm = new THREE.Mesh(f_geo, f_mat);
  fore_arm.position.set(fore_dim.x, -1.5, 0);

  const elbow = new THREE.Group();
  elbow.add(elbow_cyl);
  elbow.add(fore_arm);
  elbow.position.set(arm_dim.x, -arm_dim.y, 0);

  const wrist_cyl_geo = new THREE.CylinderGeometry(
    arm_dim.y / 4,
    arm_dim.y / 4,
    arm_dim.z,
    32
  );
  const wrist_cyl_mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const wrist_cyl = new THREE.Mesh(wrist_cyl_geo, wrist_cyl_mat);
  wrist_cyl.rotation.x = Math.PI / 2;
  wrist_cyl.position.set(2 * fore_dim.x, 0, 0);

  const p_geo = new THREE.BoxGeometry(palm_dim.x, palm_dim.y, palm_dim.z);
  const p_mat = new THREE.MeshBasicMaterial({ color: 0x00abcd });
  const palm = new THREE.Mesh(p_geo, p_mat);
  palm.position.set(2 * palm_dim.x + palm_dim.x / 2, 0, 0);

  const wrist = new THREE.Group();
  wrist.add(wrist_cyl);
  wrist.add(palm);
  wrist.position.set(0, -1.5, 0);

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