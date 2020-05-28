import {TRIANGULATION} from "./triangulation"
//const tf = window.tf; //require("@tensorflow/tfjs-core");
//const facemesh = window.facemesh;//require("@tensorflow-models/facemesh");
const posenet = window.posenet;//require("@tensorflow-models/facemesh");

export default class VisUtil {
    static drawFace(ctx, face) {
        var mesh = face.scaledMesh;
        ctx.fillStyle = "#00FF00";
        for (let i = 0; i < mesh.length; i++) {
            var [x, y, z] = mesh[i];
            ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
    }
    static drawPath(ctx, points, closePath) {
        const region = new Path2D();
        //ctx.strokeStyle = "white";//"#00FF00";
        region.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            region.lineTo(point[0], point[1]);
        }
        if (closePath) {
            region.closePath();
        }
        ctx.stroke(region);
    }
    static toTuple({y, x}) {
        return [y, x];
    }

    static drawPoint(ctx, y, x, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    static drawMesh(ctx, face) {
        let keypoints = face.scaledMesh;
        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
            const points = [
                TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
                TRIANGULATION[i * 3 + 2]
            ].map(index => keypoints[index]);
            this.drawPath(ctx, points, true);
        }
    }

    /**
     * Draws a line on a canvas, i.e. a joint
     */
    static drawSegment([ay, ax], [by, bx], color, scale, ctx, lineWidth=2) {
        ctx.beginPath();
        ctx.moveTo(ax * scale, ay * scale);
        ctx.lineTo(bx * scale, by * scale);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    /**
     * Draws a pose skeleton by looking up all adjacent keypoints/joints
     */
    static drawSkeleton(keypoints, minConfidence, ctx, scale = 1, color) {
        const adjacentKeyPoints =
            posenet.getAdjacentKeyPoints(keypoints, minConfidence);
        adjacentKeyPoints.forEach((keypoints) => {
            this.drawSegment(
                this.toTuple(keypoints[0].position), this.toTuple(keypoints[1].position), color,
                scale, ctx);
        });
    }

}
