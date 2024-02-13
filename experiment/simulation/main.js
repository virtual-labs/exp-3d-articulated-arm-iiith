"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js";
import { MOUSE } from "https://unpkg.com/three@0.128.0/build/three.module.js";
import { createCube, createDodecahedron, createOctahedron, createTetrahedron } from "./js/shapes.js";
import { createArm, moveArm } from "./js/mech_arm.js";

const moveButton = document.getElementById("move-button");
const modalbutton1 = document.querySelector(".edit-button");
const modalbutton2 = document.querySelector(".add-button");
let lockVertices = document.getElementById("lock-vertices-cb");
let xyGrid = document.getElementById("xy-grid-cb");
let yzGrid = document.getElementById("yz-grid-cb");
let xzGrid = document.getElementById("xz-grid-cb");
let cam_pos = new THREE.Vector3(17, 15, 15);
let cam_target = new THREE.Vector3(0, 0, 0);
let modalAdd = document.getElementById("add-modal");
let modalEdit = document.getElementById("edit-modal");
let initialPos = [0, 0, 0];
let container = document.getElementById("canvas-main");
let lock=0;

let frames = document.getElementById("frames").value;

let Shoulder = document.getElementById("shoulder");
Shoulder.addEventListener("input", Level1);

let Elbow = document.getElementById("elbow");
Elbow.addEventListener("input", Level2);

let Wrist = document.getElementById("wrist");
Wrist.addEventListener("input", Level3);

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

let ShldAngl = 90,
    ElbwAngl = 45,
    WrstAngl = 45;

let spanEditModal = document.getElementsByClassName("close")[0];
let scene,
    PI = 3.141592653589793,
    camera,
    renderer,
    orbit,
    shapes = [],
    grid1 = [],
    grid2 = [],
    grid3 = [],
    dragX = [],
    dragY = [],
    dragZ = [],
    dir = [],
    arrowHelper = [];

let arm_dim = new THREE.Vector3(1, 2, 1);
let arm_pos = new THREE.Vector3((arm_dim.x / 2), -(arm_dim.y / 2), 0);
let fore_dim = new THREE.Vector3(5, 0.5, 1);
let fore_pos = new THREE.Vector3((fore_dim.x / 2 + arm_dim.x / 2), (fore_dim.y / 2 - arm_dim.y / 2), 0);
let palm_dim = new THREE.Vector3(5, 1, 5);
let palm_pos = new THREE.Vector3((fore_dim.x / 2 + palm_dim.x / 2), 0, 0);

// Modal controls for Add Shape Button
let addModal = document.getElementById("add-modal");
let spanAddModal = document.getElementsByClassName("close")[1];

spanAddModal.onclick = function() {
    addModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === addModal) {
        addModal.style.display = "none";
    }
}
lockVertices.addEventListener("click", () => {
    if (lockVertices.checked) {
        lock = 1;
        orbit.mouseButtons = {
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
        };
        orbit.target.set(0, 0, 0);
        orbit.enableDamping = true;
    } else {
        lock = 0;
        orbit.mouseButtons = {
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
        };
        orbit.target.set(0, 0, 0);
        orbit.enableDamping = true;
    }
});
xyGrid.addEventListener("click", () => {
    if (xyGrid.checked) {
        let grid = new THREE.GridHelper(size, divisions);
        let vector3 = new THREE.Vector3(0, 0, 1);
        grid.lookAt(vector3);
        grid1.push(grid);
        scene.add(grid1[0]);
    } 
    else {
        scene.remove(grid1[0]);
        grid1.pop();
    }
});
xzGrid.addEventListener("click", () => {
    if (xzGrid.checked) {
        let grid = new THREE.GridHelper(size, divisions);
        grid.geometry.rotateZ(PI / 2);
        grid3.push(grid);
        scene.add(grid3[0]);
    } else {
        scene.remove(grid3[0]);
        grid3.pop();
    }
});
yzGrid.addEventListener("click", () => {
    if (yzGrid.checked) {
        let grid = new THREE.GridHelper(size, divisions);
        let vector3 = new THREE.Vector3(0, 1, 0);
        grid.lookAt(vector3);
        grid2.push(grid);
        scene.add(grid2[0]);
    } else {
        scene.remove(grid2[0]);
        grid2.pop();
    }
});
let buttons = document.getElementsByTagName("button");
const size = 50;
const divisions = 25;

document.getElementById("add-shape-btn").onclick = function () {
    addModal.style.display = "block";
    modalbutton2.addEventListener("click", () => {
        let xcoord = document.getElementById("x1").value;
        let ycoord = document.getElementById("y1").value;
        let zcoord = document.getElementById("z1").value;
        noOfShapes++;
        if (document.getElementById("shape-add-dropdown").value === "Cube") {
            createCube(
                xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
        }
        if (document.getElementById("shape-add-dropdown").value === "Tetrahedron") {
            createTetrahedron(xcoord, ycoord, zcoord, shapes, scene, point, shapeVertex, dragX, dragY, dragZ);
        }
        if (document.getElementById("shape-add-dropdown").value === "Octahedron") {
            createOctahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ );
        }
        if (
            document.getElementById("shape-add-dropdown").value === "Dodecahedron"
        ) {
            createDodecahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
        }
        addModal.style.display = "none";
    });
};
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
let shapeVertex
 = [];
let hand_comp = [];
let noOfShapes = 0;

document.addEventListener("dblclick", ondblclick, false);
function ondblclick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(shapes);
    if (intersects.length > 0) {
        const geometry = new THREE.SphereGeometry(1, 32, 16);
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        line.position.set(
            intersects[0].object.position.x,
            intersects[0].object.position.y,
            intersects[0].object.position.z
        );
        scene.add(line);
        document.getElementById("delete-shape-btn").onclick = function () {
            scene.remove(line);
            for (let i = 0; i < intersects.length; i++) {
                scene.remove(intersects[i].object);
                noOfShapes--;
            }
        };

        document.getElementById("edit-shape-btn").onclick = function () {
            document.getElementById("edit-modal").style.display = "block";
            document
                .querySelector(".edit-button")
                .addEventListener("click", () => {
                    for (let i = 0; i < intersects.length; i++) {
                        scene.remove(intersects[i].object);
                        scene.remove(line);
                    }
                    let xcoord = document.getElementById("x").value;
                    let ycoord = document.getElementById("y").value;
                    let zcoord = document.getElementById("z").value;
                    noOfShapes++;
                    if (document.querySelector("select").value === "Cube") {
                        createCube(xcoord, ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
                    }
                    if (document.querySelector("select").value === "Tetrahedron") {
                        createTetrahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
                    }
                    if (document.querySelector("select").value === "Octahedron") {
                        createOctahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
                    }
                    if (document.querySelector("select").value === "Dodecahedron") {
                        createDodecahedron(xcoord,ycoord,zcoord,shapes,scene,point,shapeVertex,dragX,dragY,dragZ);
                    }
                    document.getElementById("edit-modal").style.display = "none";
                });
        };
    }
}

spanEditModal.onclick = function () {
    modalEdit.style.display = "none";
};

document.addEventListener("pointermove", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouse.x = (x / container.clientWidth) * 2 - 1;
    mouse.y = (y / container.clientHeight) * -2 + 1;
    if (mouse.x < 1 && mouse.x > -1 && mouse.y < 1 && mouse.y > -1) {
        raycaster.setFromCamera(mouse, camera);
        if (isDragging && lock === 0) {
            for (let i = 0; i < shapes.length; i++) {
                raycaster.ray.intersectPlane(plane, planeIntersect);
                shapes[i].geometry.vertices[0].set(
                    planeIntersect.x + shift.x,
                    planeIntersect.y + shift.y,
                    planeIntersect.z + shift.z
                );
                shapes[i].geometry.verticesNeedUpdate = true;
                shapeVertex[i].position.set(
                    planeIntersect.x + shift.x - dragX[i],
                    planeIntersect.y + shift.y - dragY[i],
                    planeIntersect.z + shift.z - dragZ[i]
                );
            }
            raycaster.ray.intersectPlane(plane, planeIntersect);
        } else if (isDragging) {
            raycaster.ray.intersectPlane(plane, planeIntersect);
        }
    }
});
document.addEventListener("pointerdown", () => {
    switch (event.which) {
        case 1:
            const rect = renderer.domElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            mouse.x = (x / container.clientWidth) * 2 - 1;
            mouse.y = (y / container.clientHeight) * -2 + 1;
            pNormal.copy(camera.position).normalize();
            plane.setFromNormalAndCoplanarPoint(pNormal, scene.position);
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, planeIntersect);
            let position = new THREE.Vector3(
                shapeVertex[0].position.x,
                shapeVertex[0].position.y,
                shapeVertex[0].position.z
            );
            shift.subVectors(position, planeIntersect);
            isDragging = true;
            dragObject = shapes[shapes.length - 1];
            break;
    }
});
document.addEventListener("pointerup", () => {
    isDragging = false;
    dragObject = null;
});
function Level1(e) {
    let target = e.target ? e.target : e.srcElement;
    let PrevVal = ShldPrev;
    let rot_axis = new THREE.Vector3(0, 1, 0);
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

document.getElementById("frames").onchange = function() {
    let NewFrames = document.getElementById("frames").value;
    let rot_axis = new THREE.Vector3(0, 1, 0);
    let OldAngle = ( document.getElementById("shoulder").value / (frames / 1) ) * ShldAngl;
    let NewAngle = ((frames/1) / (NewFrames/1) ) * OldAngle;
    ShldPrev = document.getElementById("shoulder").value;
    if ( NewAngle > ShldAngl ) {
        NewAngle = ShldAngl/1;
        ShldPrev = NewFrames;
    }
    hand_comp[0].rotateOnAxis(rot_axis, ((NewAngle - OldAngle) * PI) / 180);
    rot_axis = new THREE.Vector3(0, 0, 1);
    OldAngle = ( document.getElementById("elbow").value / (frames / 1) ) * ElbwAngl;
    NewAngle = ((frames/1) / (NewFrames/1) ) * OldAngle;
    ElbwPrev = document.getElementById("elbow").value;
    if ( NewAngle > ElbwAngl ) {
        NewAngle = ElbwAngl/1;
        ElbwPrev = NewFrames;
    }
    hand_comp[1].rotateOnAxis(rot_axis, ((NewAngle - OldAngle) * PI) / 180);
    rot_axis = new THREE.Vector3(0, 0, 1);
    OldAngle = ( document.getElementById("wrist").value / (frames / 1) ) * WrstAngl;
    NewAngle = ((frames/1) / (NewFrames/1) ) * OldAngle;
    WrstPrev = document.getElementById("wrist").value;
    if ( NewAngle > WrstAngl ) {
        NewAngle = WrstAngl/1;
        WrstPrev = NewFrames;
    }
    hand_comp[2].rotateOnAxis(rot_axis, ((NewAngle - OldAngle) * PI) / 180);
    document.getElementById("shoulder").max = NewFrames;
    document.getElementById("elbow").max = NewFrames;
    document.getElementById("wrist").max = NewFrames;

    frames = NewFrames;
};
moveButton.addEventListener("click", () => {
    let x = document.getElementById("x-value").value;
    let y = document.getElementById("y-value").value;
    let z = document.getElementById("z-value").value;
    moveArm(hand_comp, new THREE.Vector3(x, y, z));
});
scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.x, camera.position.y, camera.position.z = cam_pos.x, cam_pos.y, cam_pos.z;
camera.updateProjectionMatrix();
let init = function() {
    camera.position.z = 5;
    camera.position.x = 2;
    camera.position.y = 2;
    const gridHelper = new THREE.GridHelper(size, divisions);
    const count = 1;
    dir[0] = new THREE.Vector3(1, 0, 0);
    dir[1] = new THREE.Vector3(0, 1, 0);
    dir[2] = new THREE.Vector3(0, 0, 1);
    dir[3] = new THREE.Vector3(-1, 0, 0);
    dir[4] = new THREE.Vector3(0, -1, 0);
    dir[5] = new THREE.Vector3(0, 0, -1);
    //dir1.normalize();
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 10;
    arrowHelper[0] = new THREE.ArrowHelper(dir[0], origin, length, "red");
    arrowHelper[1] = new THREE.ArrowHelper(dir[1], origin, length, "yellow");
    arrowHelper[2] = new THREE.ArrowHelper(dir[2], origin, length, "blue");
    arrowHelper[3] = new THREE.ArrowHelper(dir[3], origin, length, "red");
    arrowHelper[4] = new THREE.ArrowHelper(dir[4], origin, length, "yellow");
    arrowHelper[5] = new THREE.ArrowHelper(dir[5], origin, length, "blue");
    for (let i = 0; i < 6; i++) {
        scene.add(arrowHelper[i]);
    }
    let PointGeometry = createArm(scene, hand_comp, arm_dim, arm_pos, fore_dim, fore_pos, palm_dim, palm_pos);
    renderer = new THREE.WebGLRenderer();
    let container = document.getElementById("canvas-main");
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    // console.debug(w, h);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.mouseButtons = {
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
    };
    orbit.target.set(0, 0, 0);
    orbit.enableDamping = true;
};
let mainLoop = function() {
    renderer.render(scene, camera);
    requestAnimationFrame(mainLoop);
};
init();
mainLoop();