"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js";
import { MOUSE } from "https://unpkg.com/three@0.128.0/build/three.module.js";
import {
  createCube,
  createDodecahedron,
  createOctahedron,
  createTetrahedron,
} from "./js/shapes.js";
import { createArm, moveArm } from "./js/mech_arm.js";

const moveButton = document.getElementById("move-button");
const modalbutton1 = document.querySelector(".edit-button");
const modalbutton2 = document.querySelector(".add-button");
let lockVertices = document.getElementById("lock-vertices-cb");
let lockZoom = document.getElementById("lock-zoom-cb");
let lockRotate = document.getElementById("lock-rotate-cb");
let xyGrid = document.getElementById("xy-grid-cb");
let yzGrid = document.getElementById("yz-grid-cb");
let xzGrid = document.getElementById("xz-grid-cb");
let cam_pos = new THREE.Vector3(17, 15, 15);
let cam_target = new THREE.Vector3(0, 0, 0);
let modalAdd = document.getElementById("add-modal");
let modalEdit = document.getElementById("edit-modal");
let initial_pos = [0, 0, 0];
let container = document.getElementById("canvas-main");
let lock = 0;

let frames = document.getElementById("frames").value;

let Shoulder = document.getElementById("shoulder");
Shoulder.addEventListener("input", Level1);

let Elbow = document.getElementById("elbow");
Elbow.addEventListener("input", Level2);

let Wrist = document.getElementById("wrist");
Wrist.addEventListener("input", Level3);

let slider = document.getElementById("slider");
slider.addEventListener("input", movePoint);
document.getElementById("slider").max =1000

document.getElementById("slider").min = 0;
slider.step =1

document.getElementById("shoulder").max = frames;
document.getElementById("shoulder").min = 0;
shoulder.step = 1;

document.getElementById("elbow").max = frames;
document.getElementById("elbow").min = 0;
elbow.step = 1;

document.getElementById("wrist").max = frames;
document.getElementById("wrist").min = 0;
wrist.step = 1;

let ShldPrev = 0,
  ElbwPrev = 0,
  WrstPrev = 0;

let ShldAngl = 180,
  ElbwAngl = 90,
  WrstAngl = 90;

let trans_matrix = new THREE.Matrix4();
trans_matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

let spanEditModal = document.getElementsByClassName("close")[0];
let scene,
  PI = 3.141592653589793,
  camera,
  renderer,
  orbit,
  shapes = [],
  xygrid = [],
  yzgrid = [],
  xzgrid = [],
  dragX = [],
  dragY = [],
  dragZ = [],
  dir = [],
  arrowHelper = [];

let arm_dim = new THREE.Vector3(0, 4, 0);
let arm_pos = new THREE.Vector3(arm_dim.x / 2, (arm_dim.y / 2), 0);
let fore_dim = new THREE.Vector3(5, 0.5, 1);
let fore_pos = new THREE.Vector3(
  fore_dim.x / 2 + arm_dim.x / 2,
  fore_dim.y / 2 - arm_dim.y / 2,
  0
);
let palm_dim = new THREE.Vector3(5, 1, 5);
let palm_pos = new THREE.Vector3(fore_dim.x / 2 + palm_dim.x / 2, 0, 0);

// Modal controls for Add Shape Button
let addModal = document.getElementById("add-modal");
let spanAddModal = document.getElementsByClassName("close")[1];

// spanAddModal.onclick = function() {
//     addModal.style.display = "none";
// }

window.onclick = function (event) {
  if (event.target === addModal) {
    addModal.style.display = "none";
  }
};

lockVertices.addEventListener("click", updateMouseButtons);
lockZoom.addEventListener("click", updateMouseButtons);
lockRotate.addEventListener("click", updateMouseButtons);

function updateMouseButtons() {
  let leftMouse = MOUSE.PAN; // Default behavior (panning with left mouse)
  let middleMouse = MOUSE.PAN; // Set middle mouse to MOUSE.PAN but it will do nothing
  let rightMouse = MOUSE.ROTATE; // Default behavior (rotation with right mouse)

  // If lockVertices is checked, disable LEFT (no panning)
  if (lockVertices.checked) {
    leftMouse = null; // Disable left mouse button (no panning)
  }

  // If lockZoom is checked, prevent MIDDLE (no zooming)
  if (lockZoom.checked) {
    middleMouse = null; // Disable middle mouse button (no zooming)
    orbit.enableZoom = false; // Disable zoom functionality
  } else {
    orbit.enableZoom = true; // Enable zoom if lockZoom is unchecked
  }

  // If lockRotate is checked, disable RIGHT (no rotating)
  if (lockRotate.checked) {
    rightMouse = null; // Disable right mouse button (no rotating)
  }

  // Update the mouse buttons based on the checkbox states
  orbit.mouseButtons = {
    LEFT: leftMouse,
    MIDDLE: middleMouse,
    RIGHT: rightMouse,
  };

  // Ensure smooth damping and set target
  orbit.target.set(0, 0, 0);
  orbit.dampingFactor = 0.05;
  orbit.enableDamping = true;

  // Force an update on the controls
  orbit.update();
}

xyGrid.addEventListener("click", () => {
  if (xyGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    let vector3 = new THREE.Vector3(0, 1, 0);
    grid.lookAt(vector3);
    xygrid.push(grid);
    scene.add(xygrid[0]);
  } else {
    scene.remove(xygrid[0]);
    xygrid.pop();
  }
});
xzGrid.addEventListener("click", () => {
  if (xzGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    let vector3 = new THREE.Vector3(0, 0, 1);
    grid.lookAt(vector3);
    xzgrid.push(grid);
    scene.add(xzgrid[0]);
  } else {
    scene.remove(xzgrid[0]);
    xzgrid.pop();
  }
});
yzGrid.addEventListener("click", () => {
  if (yzGrid.checked) {
    let grid = new THREE.GridHelper(size, divisions);
    grid.geometry.rotateZ(PI / 2);
    // grid.lookAt(vector3);
    yzgrid.push(grid);
    scene.add(yzgrid[0]);
  } else {
    scene.remove(yzgrid[0]);
    yzgrid.pop();
  }
});

let buttons = document.getElementsByTagName("button");
const size = 50;
const divisions = 25;

// document.getElementById("add-shape-btn").onclick = function () {
//     addModal.style.display = "block";
//     modalbutton2.addEventListener("click", () => {
//         let xcoord = document.getElementById("x1").value;
//         let ycoord = document.getElementById("y1").value;
//         let zcoord = document.getElementById("z1").value;
//         noOfShapes++;
//         if (document.getElementById("shape-add-dropdown").value === "Cube") {
//             createCube(
//                 xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
//         }
//         if (document.getElementById("shape-add-dropdown").value === "Tetrahedron") {
//             createTetrahedron(xcoord, ycoord, zcoord, shapes, scene, point, shapeVertex, dragX, dragY, dragZ);
//         }
//         if (document.getElementById("shape-add-dropdown").value === "Octahedron") {
//             createOctahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ );
//         }
//         if (
//             document.getElementById("shape-add-dropdown").value === "Dodecahedron"
//         ) {
//             createDodecahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
//         }
//         addModal.style.display = "none";
//     });
// };
let raycaster = new THREE.Raycaster();
let raycaster1 = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let plane = new THREE.Plane();
let pNormal = new THREE.Vector3(0, 1, 0); // plane's normal

let planeIntersect = new THREE.Vector3(); // point of intersection with the plane
let pIntersect = new THREE.Vector3(); // point of intersection with an object (plane's point)
let shift = new THREE.Vector3(); // distance between position of an object and points of intersection with the object
let isDragging = false;
let dragObject;
let point = [];
let shapeVertex = [];
let hand_comp = [];
let noOfShapes = 0;

// document.addEventListener("dblclick", ondblclick, false);
// function ondblclick(event) {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//     raycaster.setFromCamera(mouse, camera);
//     let intersects = raycaster.intersectObjects(shapes);
//     if (intersects.length > 0) {
//         const geometry = new THREE.SphereGeometry(1, 32, 16);
//         const edges = new THREE.EdgesGeometry(geometry);
//         const line = new THREE.LineSegments(
//             edges,
//             new THREE.LineBasicMaterial({ color: 0xffffff })
//         );
//         line.position.set(
//             intersects[0].object.position.x,
//             intersects[0].object.position.y,
//             intersects[0].object.position.z
//         );
//         scene.add(line);
//         document.getElementById("delete-shape-btn").onclick = function () {
//             scene.remove(line);
//             for (let i = 0; i < intersects.length; i++) {
//                 scene.remove(intersects[i].object);
//                 noOfShapes--;
//             }
//         };

//         document.getElementById("edit-shape-btn").onclick = function () {
//             document.getElementById("edit-modal").style.display = "block";
//             document
//                 .querySelector(".edit-button")
//                 .addEventListener("click", () => {
//                     for (let i = 0; i < intersects.length; i++) {
//                         scene.remove(intersects[i].object);
//                         scene.remove(line);
//                     }
//                     let xcoord = document.getElementById("x").value;
//                     let ycoord = document.getElementById("y").value;
//                     let zcoord = document.getElementById("z").value;
//                     noOfShapes++;
//                     if (document.querySelector("select").value === "Cube") {
//                         createCube(xcoord, ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
//                     }
//                     if (document.querySelector("select").value === "Tetrahedron") {
//                         createTetrahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
//                     }
//                     if (document.querySelector("select").value === "Octahedron") {
//                         createOctahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
//                     }
//                     if (document.querySelector("select").value === "Dodecahedron") {
//                         createDodecahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
//                     }
//                     document.getElementById("edit-modal").style.display = "none";
//                 });
//         };
//     }
// }

// spanEditModal.onclick = function () {
//     modalEdit.style.display = "none";
// };

// document.addEventListener("pointermove", (event) => {
//     const rect = renderer.domElement.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     mouse.x = (x / container.clientWidth) * 2 - 1;
//     mouse.y = (y / container.clientHeight) * -2 + 1;
//     if (mouse.x < 1 && mouse.x > -1 && mouse.y < 1 && mouse.y > -1) {
//         raycaster.setFromCamera(mouse, camera);
//         if (isDragging && lock === 0) {
//             for (let i = 0; i < shapes.length; i++) {
//                 raycaster.ray.intersectPlane(plane, planeIntersect);
//                 shapes[i].geometry.vertices[0].set(
//                     planeIntersect.x + shift.x,
//                     planeIntersect.y + shift.y,
//                     planeIntersect.z + shift.z
//                 );
//                 shapes[i].geometry.verticesNeedUpdate = true;
//                 shapeVertex[i].position.set(
//                     planeIntersect.x + shift.x - dragX[i],
//                     planeIntersect.y + shift.y - dragY[i],
//                     planeIntersect.z + shift.z - dragZ[i]
//                 );
//             }
//             raycaster.ray.intersectPlane(plane, planeIntersect);
//         } else if (isDragging) {
//             raycaster.ray.intersectPlane(plane, planeIntersect);
//         }
//     }
// });
// document.addEventListener("pointerdown", () => {
//     switch (event.which) {
//         case 1:
//             const rect = renderer.domElement.getBoundingClientRect();
//             const x = event.clientX - rect.left;
//             const y = event.clientY - rect.top;

//             mouse.x = (x / container.clientWidth) * 2 - 1;
//             mouse.y = (y / container.clientHeight) * -2 + 1;
//             pNormal.copy(camera.position).normalize();
//             plane.setFromNormalAndCoplanarPoint(pNormal, scene.position);
//             raycaster.setFromCamera(mouse, camera);
//             raycaster.ray.intersectPlane(plane, planeIntersect);
//             let position = new THREE.Vector3(
//                 shapeVertex[0].position.x,
//                 shapeVertex[0].position.y,
//                 shapeVertex[0].position.z
//             );
//             shift.subVectors(position, planeIntersect);
//             isDragging = true;
//             dragObject = shapes[shapes.length - 1];
//             break;
//     }
// });
// document.addEventListener("pointerup", () => {
//     isDragging = false;
//     dragObject = null;
// });
function Level1(e) {
  let target = e.target ? e.target : e.srcElement;
  let PrevVal = ShldPrev;
  let rot_axis = new THREE.Vector3(0, 0, 1);
  let rot_angle = ((target.value - PrevVal) / (frames / 1)) * ShldAngl;
  hand_comp[0].rotateOnAxis(rot_axis, (rot_angle * PI) / 180);
  ShldPrev = target.value;
}
function Level2(e) {
  let target = e.target ? e.target : e.srcElement;
  let PrevVal = ElbwPrev;
  let rot_axis = new THREE.Vector3(0, 0, 1);
  let rot_angle = ((target.value - PrevVal) / (frames / 1)) * ElbwAngl;
  hand_comp[1].rotateOnAxis(rot_axis, (rot_angle * PI) / 180);
  ElbwPrev = target.value;
}
function Level3(e) {
  let target = e.target ? e.target : e.srcElement;
  let PrevVal = WrstPrev;
  let rot_axis = new THREE.Vector3(0, 0, 1);
  let rot_angle = ((target.value - PrevVal) / (frames / 1)) * WrstAngl;
  hand_comp[2].rotateOnAxis(rot_axis, (rot_angle * PI) / 180);
  WrstPrev = target.value;
}

document.getElementById("frames").onchange = function () {
  let NewFrames = document.getElementById("frames").value;
  let rot_axis = new THREE.Vector3(0, 1, 0);
  let OldAngle =
    (document.getElementById("shoulder").value / (frames / 1)) * ShldAngl;
  let NewAngle = (frames / 1 / (NewFrames / 1)) * OldAngle;
  ShldPrev = document.getElementById("shoulder").value;
  if (NewAngle > ShldAngl) {
    NewAngle = ShldAngl / 1;
    ShldPrev = NewFrames;
  }
  hand_comp[0].rotateOnAxis(rot_axis, ((NewAngle - OldAngle) * PI) / 180);
  rot_axis = new THREE.Vector3(0, 0, 1);
  OldAngle = (document.getElementById("elbow").value / (frames / 1)) * ElbwAngl;
  NewAngle = (frames / 1 / (NewFrames / 1)) * OldAngle;
  ElbwPrev = document.getElementById("elbow").value;
  if (NewAngle > ElbwAngl) {
    NewAngle = ElbwAngl / 1;
    ElbwPrev = NewFrames;
  }
  hand_comp[1].rotateOnAxis(rot_axis, ((NewAngle - OldAngle) * PI) / 180);
  rot_axis = new THREE.Vector3(0, 0, 1);
  OldAngle = (document.getElementById("wrist").value / (frames / 1)) * WrstAngl;
  NewAngle = (frames / 1 / (NewFrames / 1)) * OldAngle;
  WrstPrev = document.getElementById("wrist").value;
  if (NewAngle > WrstAngl) {
    NewAngle = WrstAngl / 1;
    WrstPrev = NewFrames;
  }
  hand_comp[2].rotateOnAxis(rot_axis, ((NewAngle - OldAngle) * PI) / 180);
  document.getElementById("shoulder").max = NewFrames;
  document.getElementById("elbow").max = NewFrames;
  document.getElementById("wrist").max = NewFrames;

  frames = NewFrames;
};

var transX = parseFloat(document.getElementById("value-x").value);
var transY = parseFloat(document.getElementById("value-y").value);
var transZ = parseFloat(document.getElementById("value-z").value);
function applyTranslation(event) {
  event.preventDefault(); // Prevent the default form submission
  transX = parseFloat(document.getElementById("value-x").value);
  transY = parseFloat(document.getElementById("value-y").value);
  transZ = parseFloat(document.getElementById("value-z").value);

  // Your translation logic here
  console.log("Translation applied:", transX, transY, transZ);

  // Optionally, you can remove the event listener after it's triggered once
  // event.target.removeEventListener("submit", applyTranslation);
}


document.getElementById("translation-form").addEventListener("submit", applyTranslation);


let prev_x = 0;
let prev_y = 0;
let prev_z = 0;

function movePoint(e) {
    // alert("hello");
  var target = e.target || e.srcElement;

  // Get target values directly from input
  let tx = transX;
  let ty = transY;
  let tz = transZ;

  // Calculate translation based on slider value
  let translationScale = target.value / target.max;
  let curr_x = tx * translationScale - prev_x;
  let curr_y = ty * translationScale - prev_y;
  let curr_z = tz * translationScale - prev_z;

  // Create translation matrix
  prev_x += curr_x;
  prev_y += curr_y;
  prev_z += curr_z;
  let translate_M = new THREE.Matrix4().makeTranslation(curr_x, curr_y, curr_z);

  // Update dot
  // dotList[0].geometry.applyMatrix4(translate_M);
  // if (dotList[0].geometry.isBufferGeometry) {
  //   dotList[0].geometry.attributes.position.needsUpdate = true;
  // }

  trans_matrix.multiply(translate_M);

  // Reset transformation matrix if needed
  if (target.value <= 0) {
    trans_matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  moveArm(hand_comp, new THREE.Vector3(curr_x, curr_y, curr_z));

  document.getElementById("matrix-00").value = trans_matrix.elements[0];
  document.getElementById("matrix-01").value = trans_matrix.elements[1];
  document.getElementById("matrix-02").value = trans_matrix.elements[2];
  document.getElementById("matrix-03").value = trans_matrix.elements[12];

  document.getElementById("matrix-10").value = trans_matrix.elements[4];
  document.getElementById("matrix-11").value = trans_matrix.elements[5];
  document.getElementById("matrix-12").value = trans_matrix.elements[6];
  document.getElementById("matrix-13").value = trans_matrix.elements[13];

  document.getElementById("matrix-20").value = trans_matrix.elements[8];
  document.getElementById("matrix-21").value = trans_matrix.elements[9];
  document.getElementById("matrix-22").value = trans_matrix.elements[10];
  document.getElementById("matrix-23").value = trans_matrix.elements[14];

  document.getElementById("matrix-30").value = trans_matrix.elements[3];
  document.getElementById("matrix-31").value = trans_matrix.elements[7];
  document.getElementById("matrix-32").value = trans_matrix.elements[11];
  document.getElementById("matrix-33").value = trans_matrix.elements[15];
}

function createLabel(text, direction, length) {
  const fontLoader = new THREE.FontLoader();
  let labelMesh;

  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      const geometry = new THREE.TextGeometry(text, {
        font: font,
        size: 0.6,
        height: 0.1,
      });
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      labelMesh = new THREE.Mesh(geometry, material);

      // Position the label at the end of the arrow (tip of the arrow)
      const labelPosition = direction.clone().multiplyScalar(length);
      labelMesh.position.copy(labelPosition);
      scene.add(labelMesh);
    }
  );

  return labelMesh;
}

const toggleInstructions = document.getElementById("toggle-instructions");
const procedureMessage = document.getElementById("procedure-message");

// Function to show the instructions overlay
const showInstructions = () => {
  procedureMessage.style.display = "block";
};

// Function to hide the instructions overlay
const hideInstructions = (event) => {
  // Close if click is outside the overlay or if it's the toggle button again
  if (
    !procedureMessage.contains(event.target) &&
    event.target !== toggleInstructions
  ) {
    procedureMessage.style.display = "none";
  }
};

// Attach event listeners
toggleInstructions.addEventListener("click", (event) => {
  // Toggle the visibility of the overlay
  if (procedureMessage.style.display === "block") {
    procedureMessage.style.display = "none";
  } else {
    showInstructions();
  }
  event.stopPropagation(); // Prevent immediate closure after clicking the button
});

document.addEventListener("click", hideInstructions);

// Prevent closing the overlay when clicking inside it
procedureMessage.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent the click inside from closing the overlay
});

document.addEventListener("DOMContentLoaded", function () {
  // Select the reset button
  const resetBtn = document.getElementById("reset-all-btn");

  // Function to reload the page, resetting everything to default
  function resetAllFields() {
    location.reload(); // Reload the page to reset all elements to default
  }

  // Add event listener to the reset button
  resetBtn.addEventListener("click", resetAllFields);
});

scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);
camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.x,
  camera.position.y,
  (camera.position.z = cam_pos.x),
  cam_pos.y,
  cam_pos.z;
camera.updateProjectionMatrix();
let init = function () {
  camera.position.set(5, 17, 20); // Set camera position behind and above the origin

//   camera.lookAt(20, 10, 5);
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);
  const gridHelper = new THREE.GridHelper(size, divisions);
  const count = 1;

  const arrowHelper = [];
  const dir = [
    new THREE.Vector3(1, 0, 0), // +X
    new THREE.Vector3(0, 1, 0), // +Y
    new THREE.Vector3(0, 0, 1), // +Z
    new THREE.Vector3(-1, 0, 0), // -X
    new THREE.Vector3(0, -1, 0), // -Y
    new THREE.Vector3(0, 0, -1), // -Z
  ];

  const labels = ["+X", "+Y", "+Z", "-X", "-Y", "-Z"]; // Labels for each axis
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 10;

  // Loop through the axes
  for (let i = 0; i < 6; i++) {
    // Determine color based on the direction
    let color;
    if (i === 0 || i === 3) {
      color = "red"; // +X and -X axes
    } else if (i === 1 || i === 4) {
      color = "yellow"; // +Y and -Y axes
    } else {
      color = "blue"; // +Z and -Z axes
    }

    // Create the arrow helper for the current direction and color
    arrowHelper[i] = new THREE.ArrowHelper(dir[i], origin, length, color);
    scene.add(arrowHelper[i]);

    // Create label for each axis and position it at the tip of the arrow
    const label = createLabel(labels[i], dir[i], length);
    scene.add(label);
  }
  let PointGeometry = createArm(
    scene,
    hand_comp,
    arm_dim,
    arm_pos,
    fore_dim,
    fore_pos,
    palm_dim,
    palm_pos
  );
  renderer = new THREE.WebGLRenderer();
  let w = container.offsetWidth;
  let h = container.offsetHeight;
  renderer.setSize(w, 0.83 * h);
  container.appendChild(renderer.domElement);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  orbit.target.set(0, 0, 0);
  orbit.enableDamping = true;
};
let mainLoop = function () {
    orbit.update(); // Important for damping
    camera.updateMatrixWorld();
  renderer.render(scene, camera);
  requestAnimationFrame(mainLoop);
};
init();
mainLoop();
