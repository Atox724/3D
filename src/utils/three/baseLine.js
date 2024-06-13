import inherits from "inherits";

import getNormals from "./polyline-normals";
const VERTS_PER_POINT = 4;

export default function ThreeLine2D(THREE) {
  function LineMesh(path, opt) {
    if (!(this instanceof LineMesh)) {
      return new LineMesh(path, opt);
    }
    THREE.BufferGeometry.call(this);

    if (Array.isArray(path)) {
      opt = opt || {};
    } else if (typeof path === "object") {
      opt = path;
      path = [];
    }

    opt = opt || {};

    this.setAttribute("position", new THREE.BufferAttribute(undefined, 3));
    this.setAttribute("lineNormal", new THREE.BufferAttribute(undefined, 2));
    this.setAttribute("lineMiter", new THREE.BufferAttribute(undefined, 1));

    if (opt.ratio) {
      this.setAttribute("lineRatio", new THREE.BufferAttribute(undefined, 1));
    }
    if (opt.distances) {
      this.setAttribute(
        "lineDistance",
        new THREE.BufferAttribute(undefined, 1)
      );
    }
    if (typeof this.setIndex === "function") {
      this.setIndex(new THREE.BufferAttribute(undefined, 1));
    } else {
      this.setAttribute("index", new THREE.BufferAttribute(undefined, 1));
    }
    this.update(path, opt.closed);
  }

  inherits(LineMesh, THREE.BufferGeometry);

  function getPtDist(pt1, pt2) {
    return Math.sqrt(
      Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2)
    );
  }

  LineMesh.prototype.update = function (path, closed) {
    path = path || [];
    let normals = getNormals(path, closed);

    if (closed) {
      path = path.slice();
      path.push(path[0]);
      normals.push(normals[0]);
    }
    let attrPosition = this.getAttribute("position");
    let attrNormal = this.getAttribute("lineNormal");
    let attrMiter = this.getAttribute("lineMiter");
    let attrDistance = this.getAttribute("lineDistance");
    let attrRatio = this.getAttribute("lineRatio");
    let attrIndex =
      typeof this.getIndex === "function"
        ? this.getIndex()
        : this.getAttribute("index");

    let indexCount = Math.max(0, (path.length - 1) * 12);
    let count = path.length * VERTS_PER_POINT;
    if (
      !attrPosition.array ||
      path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT
    ) {
      attrPosition.array = new Float32Array(count * 3);
      attrNormal.array = new Float32Array(count * 2);
      attrMiter.array = new Float32Array(count);
      attrIndex.array = new Uint16Array(indexCount);

      if (attrRatio) {
        attrRatio.array = new Float32Array(count);
      }
      if (attrDistance) {
        attrDistance.array = new Float32Array(count);
      }
    }

    if (undefined !== attrPosition.count) {
      attrPosition.count = count;
    }
    attrPosition.needsUpdate = true;

    if (undefined !== attrNormal.count) {
      attrNormal.count = count;
    }
    attrNormal.needsUpdate = true;

    if (undefined !== attrMiter.count) {
      attrMiter.count = count;
    }
    attrMiter.needsUpdate = true;

    if (undefined !== attrIndex.count) {
      attrIndex.count = indexCount;
    }
    attrIndex.needsUpdate = true;

    if (attrRatio) {
      if (undefined !== attrRatio.count) {
        attrRatio.count = count;
      }
      attrRatio.needsUpdate = true;
    }
    if (attrDistance) {
      if (undefined !== attrDistance.count) {
        attrDistance.count = count;
      }
      attrDistance.needsUpdate = true;
    }

    let index = 0;
    let c = 0;
    let dIndex = 0;
    let indexArray = attrIndex.array;
    let cur_length = 0;

    path.forEach(function (point, pointIndex, list) {
      let i = index;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 3;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 3;
      indexArray[c++] = i + 5;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 5;
      indexArray[c++] = i + 7;
      indexArray[c++] = i + 4;
      indexArray[c++] = i + 5;
      indexArray[c++] = i + 6;

      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);
      if (attrRatio) {
        let d = pointIndex / (list.length - 1);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
      }
      if (attrDistance) {
        let d = 0;
        if (pointIndex > 0) {
          d = getPtDist(point, list[pointIndex - 1]);
        }
        cur_length += d;
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
      }
    });

    let nIndex = 0;
    let mIndex = 0;
    normals.forEach(function (n, norm_index, norm_list) {
      let norm_cur = n[0];
      let norm_last = norm_cur;
      if (norm_index > 0) {
        norm_last = norm_list[norm_index - 1][0];
      }

      let miter = 1;
      attrNormal.setXY(nIndex++, norm_last[0], norm_last[1]);
      attrNormal.setXY(nIndex++, norm_last[0], norm_last[1]);
      attrNormal.setXY(nIndex++, norm_cur[0], norm_cur[1]);
      attrNormal.setXY(nIndex++, norm_cur[0], norm_cur[1]);

      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
    });
  };

  return LineMesh;
}