
import * as THREE from "./three.js/build/three.module.js";
import { EventDispatcher } from "../../EventDispatcher.js";
import { TextSprite } from "../../TextSprite.js";

let sg = new THREE.SphereGeometry(1, 8, 8);
let sgHigh = new THREE.SphereGeometry(1, 128, 128);

let sm = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
let smHovered = new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0xff0000 });

let raycaster = new THREE.Raycaster();
let currentlyHovered = null;

let previousView = {
	controls: null,
	position: null,
	target: null,
};

class Image360 {

	constructor(file, time, longitude, latitude, altitude, course, pitch, roll, real) {
		this.file = file;
		this.time = time;
		this.longitude = longitude;
		this.latitude = latitude;
		this.altitude = altitude;
		//this.course = course;
		//this.pitch = pitch;
		//this.roll = roll;

		if (real) {
			var quat = new Quaternion(roll, pitch, course, real);

			var q = quat;
			var m = new Matrix4();
			m.makeRotationFromQuaternion(q);

			var axis = [0, 0, 0];
			var angle = 2 * Math.acos(q.w);
			if (1 - (q.w * q.w) < 0.000001) {
				axis[0] = q.x;
				axis[1] = q.y;
				axis[2] = q.z;
			}
			else {
				// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
				var s = Math.sqrt(1 - (q.w * q.w));
				axis[0] = q.x / s;
				axis[1] = q.y / s;
				axis[2] = q.z / s;
			}

			var eu = new Euler();
			eu.setFromRotationMatrix(m, 'XYZ');

			this.roll = toReal(toAngle(eu.toArray()[0]));
			this.pitch = toReal(toAngle(eu.toArray()[1]));
			this.course = 360 - toReal(toAngle(eu.toArray()[2]));
		}
		else {
			this.course = course;
			this.pitch = pitch;
			this.roll = roll;
		}
		this.mesh = null;
	}
};

function quaternionToRotationMatrix(x, y, z, w) {
	const xx = x * x, yy = y * y, zz = z * z;
	const xy = x * y, xz = x * z, yz = y * z;
	const wx = w * x, wy = w * y, wz = w * z;

	return [
		[1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy)],
		[2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx)],
		[2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy)]
	];
}

function applyRotation(R, v) {
	return [
		R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2],
		R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2],
		R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]
	];
}

function toAngle(x) {
	return x * 180 / Math.PI;
}

function toReal(x) {
	if (!isNaN(parseFloat(x)) && isFinite(parseFloat(x))) {
		return parseFloat(parseFloat(x).toFixed(7));
	}
	else {
		return x;
	}
}

export class Images360 extends EventDispatcher {

	constructor(viewer) {
		super();

		this.viewer = viewer;

		this.selectingEnabled = true;

		this.images = [];
		this.node = new THREE.Object3D();

		this.sphere = new THREE.Mesh(sgHigh, sm);
		this.sphere.visible = false;
		this.sphere.scale.set(1000, 1000, 1000);
		this.node.add(this.sphere);
		this._visible = true;
		// this.node.add(label);

		this.focusedImage = null;

		let elUnfocus = document.createElement("input");
		elUnfocus.type = "button";
		elUnfocus.value = "unfocus";
		elUnfocus.style.position = "absolute";
		elUnfocus.style.right = "10px";
		elUnfocus.style.top = "10px";
		elUnfocus.style.zIndex = "10000";
		elUnfocus.style.fontSize = "2em";
		elUnfocus.addEventListener("click", () => this.unfocus());
		this.elUnfocus = elUnfocus;

		this.domRoot = viewer.renderer.domElement.parentElement;
		this.domRoot.appendChild(elUnfocus);
		this.elUnfocus.style.display = "none";

		viewer.addEventListener("update", () => {
			this.update(viewer);
		});
		viewer.inputHandler.addInputListener(this);

		this.addEventListener("mousedown", () => {
			if (currentlyHovered && currentlyHovered.image360) {
				this.focus(currentlyHovered.image360);
			}
		});

	};

	set visible(visible) {
		if (this._visible === visible) {
			return;
		}


		for (const image of this.images) {
			image.mesh.visible = visible && (this.focusedImage == null);
		}

		this.sphere.visible = visible && (this.focusedImage != null);
		this._visible = visible;
		this.dispatchEvent({
			type: "visibility_changed",
			images: this,
		});
	}

	get visible() {
		return this._visible;
	}

	focus(image360) {
		if (this.focusedImage !== null) {
			this.unfocus();
		}

		previousView = {
			controls: this.viewer.controls,
			position: this.viewer.scene.view.position.clone(),
			target: this.viewer.scene.view.getPivot(),
		};

		this.viewer.setControls(this.viewer.orbitControls);
		this.viewer.orbitControls.doubleClockZoomEnabled = false;

		for (let image of this.images) {
			image.mesh.visible = false;
		}

		this.selectingEnabled = false;

		this.sphere.visible = false;

		this.load(image360).then(() => {
			this.sphere.visible = true;
			this.sphere.material.map = image360.texture;
			this.sphere.material.needsUpdate = true;
		});

		{ // orientation
			let { course, pitch, roll } = image360;
			this.sphere.rotation.set(
				THREE.Math.degToRad(+roll + 90),
				THREE.Math.degToRad(-pitch),
				THREE.Math.degToRad(-course),
				"ZYX"
			);
		}

		this.sphere.position.set(...image360.position);

		let target = new THREE.Vector3(...image360.position);
		let dir = target.clone().sub(this.viewer.scene.view.position).normalize();
		let move = dir.multiplyScalar(0.000001);
		let newCamPos = target.clone().sub(move);

		this.viewer.scene.view.setView(
			newCamPos,
			target,
			500
		);

		this.focusedImage = image360;

		this.elUnfocus.style.display = "";
	}

	unfocus() {
		this.selectingEnabled = true;

		for (let image of this.images) {
			image.mesh.visible = true;
		}

		let image = this.focusedImage;

		if (image === null) {
			return;
		}


		this.sphere.material.map = null;
		this.sphere.material.needsUpdate = true;
		this.sphere.visible = false;

		let pos = this.viewer.scene.view.position;
		let target = this.viewer.scene.view.getPivot();
		let dir = target.clone().sub(pos).normalize();
		let move = dir.multiplyScalar(10);
		let newCamPos = target.clone().sub(move);

		this.viewer.orbitControls.doubleClockZoomEnabled = true;
		this.viewer.setControls(previousView.controls);

		this.viewer.scene.view.setView(
			previousView.position,
			previousView.target,
			500
		);


		this.focusedImage = null;

		this.elUnfocus.style.display = "none";

		this.viewer.fpControls.viewer.setMoveSpeed(10);
	}

	load(image360) {

		return new Promise(resolve => {
			let texture = new THREE.TextureLoader().load(image360.file, resolve);
			texture.wrapS = THREE.RepeatWrapping;
			texture.repeat.x = -1;

			image360.texture = texture;
		});

	}

	handleHovering() {
		let mouse = this.viewer.inputHandler.mouse;
		let camera = this.viewer.scene.getActiveCamera();
		let domElement = this.viewer.renderer.domElement;

		let ray = Potree.Utils.mouseToRay(mouse, camera, domElement.clientWidth, domElement.clientHeight);

		// let tStart = performance.now();
		raycaster.ray.copy(ray);
		let intersections = raycaster.intersectObjects(this.node.children);

		if (intersections.length === 0) {
			// label.visible = false;

			return;
		}

		let intersection = intersections[0];
		currentlyHovered = intersection.object;
		currentlyHovered.material = smHovered;

		//label.visible = true;
		//label.setText(currentlyHovered.image360.file);
		//currentlyHovered.getWorldPosition(label.position);
	}

	update() {

		let { viewer } = this;

		if (currentlyHovered) {
			currentlyHovered.material = sm;
			currentlyHovered = null;
		}

		if (this.selectingEnabled) {
			this.handleHovering();
		}

	}

};


export class Images360Loader {

	static async load(url, viewer, params = {}) {

		if (!params.transform) {
			params.transform = {
				forward: a => a,
			};
		}

		let response = await fetch(`${url}/coordinates.txt`);
		let text = await response.text();

		let lines = text.split(/\r?\n/);
		let coordinateLines = lines.slice(1);

		let images360 = new Images360(viewer);

		for (let line of coordinateLines) {

			if (line.trim().length === 0) {
				continue;
			}

			let tokens = line.split(/\t/);

			let [filename, time, long, lat, alt, course, pitch, roll, real] = tokens;
			time = parseFloat(time);
			long = parseFloat(long);
			lat = parseFloat(lat);
			alt = parseFloat(alt);
			course = parseFloat(course);
			pitch = parseFloat(pitch);
			roll = parseFloat(roll);
			real = parseFloat(real);

			filename = filename.replace(/"/g, "");
			let file = `${url}/${filename}`;

			const offsetSCI = [0, 0, -0.15];

			const R = quaternionToRotationMatrix(roll, pitch, course, real);
			const offsetSCG = applyRotation(R, offsetSCI);

			long += offsetSCG[0];
			lat += offsetSCG[1];
			alt += offsetSCG[2];

			let image360 = new Image360(file, time, long, lat, alt, course, pitch, roll, real);

			let xy = params.transform.forward([long, lat]);
			let position = [...xy, alt];
			image360.position = position;

			images360.images.push(image360);
		}

		Images360Loader.createSceneNodes(images360, params.transform);

		return images360;

	}

	static createSceneNodes(images360, transform) {

		for (let image360 of images360.images) {
			let { longitude, latitude, altitude } = image360;
			let xy = transform.forward([longitude, latitude]);

			let mesh = new THREE.Mesh(sg, sm);
			mesh.position.set(...xy, altitude);
			mesh.scale.set(0.5, 0.5, 0.5);
			mesh.material.transparent = true;
			mesh.material.opacity = 0.75;
			mesh.image360 = image360;

			{ // orientation
				var { course, pitch, roll } = image360;
				mesh.rotation.set(
					THREE.Math.degToRad(+roll + 90),
					THREE.Math.degToRad(-pitch),
					THREE.Math.degToRad(-course),
					"ZYX"
				);
			}

			images360.node.add(mesh);

			image360.mesh = mesh;
		}
	}



};


