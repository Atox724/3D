import getNormals from "polyline-normals";
import { BufferAttribute, BufferGeometry } from "three";

const VERTS_PER_POINT = 2;

type Point2 = [number, number];

function getPtDist(pt1: Point2, pt2: Point2) {
  return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
}

export default class GradientLine extends BufferGeometry {
  constructor(
    path: number[][],
    opt: {
      ratio?: boolean;
      distances?: boolean;
      closed?: boolean;
    } = {}
  ) {
    super();

    if (closed) {
      path = path.slice();
      path.push(path[0]);
    }

    const indexCount = Math.max(0, (path.length - 1) * 6);
    const count = path.length * VERTS_PER_POINT;

    this.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(count * 3), 3)
    );
    this.setAttribute(
      "lineNormal",
      new BufferAttribute(new Float32Array(count * 2), 2)
    );
    this.setAttribute(
      "lineMiter",
      new BufferAttribute(new Float32Array(count), 1)
    );
    this.setAttribute(
      "index",
      new BufferAttribute(new Uint16Array(indexCount), 1)
    );
    this.setAttribute(
      "customColor",
      new BufferAttribute(new Float32Array(count * 4), 4)
    );

    if (opt.ratio) {
      this.setAttribute(
        "lineRatio",
        new BufferAttribute(new Float32Array(count), 1)
      );
    }
    if (opt.distances) {
      this.setAttribute(
        "lineDistance",
        new BufferAttribute(new Float32Array(count), 1)
      );
    }

    this.update(path);
  }

  update(path: number[][] = []) {
    const normals = getNormals(path);

    const attrPosition = this.getAttribute("position") as BufferAttribute;
    const attrNormal = this.getAttribute("lineNormal") as BufferAttribute;
    const attrMiter = this.getAttribute("lineMiter") as BufferAttribute;
    const attrDistance = this.getAttribute("lineDistance") as BufferAttribute;
    const attrRatio = this.getAttribute("lineRatio") as BufferAttribute;
    const attrCustomColor = this.getAttribute("customColor") as BufferAttribute;
    const attrIndex = this.getAttribute("index") as BufferAttribute;

    const indexCount = Math.max(0, (path.length - 1) * 6);
    const count = path.length * VERTS_PER_POINT;

    if (
      !attrPosition.array ||
      path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT
    ) {
      attrPosition.array = new Float32Array(count * 3);
      attrNormal.array = new Float32Array(count * 2);
      attrMiter.array = new Float32Array(count);
      attrIndex.array = new Uint16Array(indexCount);
      attrCustomColor.array = new Float32Array(count * 4);

      if (attrRatio) {
        attrRatio.array = new Float32Array(count);
      }
      if (attrDistance) {
        attrDistance.array = new Float32Array(count);
      }
    }

    attrPosition.needsUpdate = true;

    attrNormal.needsUpdate = true;

    attrMiter.needsUpdate = true;

    attrIndex.needsUpdate = true;

    attrCustomColor.needsUpdate = true;

    if (attrRatio) attrRatio.needsUpdate = true;

    if (attrDistance) attrDistance.needsUpdate = true;

    let index = 0;
    let c = 0;
    let dIndex = 0;
    const indexArray = attrIndex.array;
    let cur_length = 0;

    path.forEach((point, pointIndex, list) => {
      const i = index;
      indexArray[c++] = i;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 3;

      attrCustomColor.setXYZW(index, point[2], point[3], point[4], point[5]);
      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrCustomColor.setXYZW(index, point[2], point[3], point[4], point[5]);
      attrPosition.setXYZ(index++, point[0], point[1], 0);

      if (attrRatio) {
        const d = pointIndex / (list.length - 1);
        attrRatio.setX(dIndex++, d);
        attrRatio.setX(dIndex++, d);
      }
      if (attrDistance) {
        let d = 0;
        if (pointIndex > 0) {
          d = getPtDist(point as Point2, list[pointIndex - 1] as Point2);
        }
        cur_length += d;
        attrDistance.setX(dIndex++, cur_length);
        attrDistance.setX(dIndex++, cur_length);
      }
    });

    let nIndex = 0;
    let mIndex = 0;
    normals.forEach((n) => {
      const norm = n[0];
      const miter = 1.0;
      attrNormal.setXY(nIndex++, norm[0], norm[1]);
      attrNormal.setXY(nIndex++, norm[0], norm[1]);

      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
    });
  }
}
