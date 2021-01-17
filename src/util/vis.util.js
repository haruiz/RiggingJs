import {TriangulationUtil} from "./triangulation.util"
import * as posenet from '@tensorflow-models/posenet';
const math = window.math;

export default class VisUtil {

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

    static drawText(ctx,text, x,y, s, color) {
        ctx.font = `${s}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    static drawPoint(ctx,x,y, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    static drawMesh(ctx, face) {
        let keypoints = face.scaledMesh;
        for (let i = 0; i < TriangulationUtil.length / 3; i++) {
            const points = [
                TriangulationUtil[i * 3], TriangulationUtil[i * 3 + 1],
                TriangulationUtil[i * 3 + 2]
            ].map(index => keypoints[index]);
            this.drawPath(ctx, points, true);
        }
    }

    static drawSilhouette(ctx, face){
        let annotations = face.annotations;
        const silhouette = annotations["silhouette"];
        for (let i = 0; i < silhouette.length; i++) {
            this.drawText(ctx, i, silhouette[i][0], silhouette[i][1], 8, "black");
        }
    }


    static drawAxis(ctx, origin, rotationMatrix){
        let limitX = math.subtract(origin, math.multiply(math.squeeze(math.row(rotationMatrix, 0)), 100.0)).toArray();
        this.drawArrow([origin[1], origin[0]], [limitX[1], limitX[0]], "red", 1.0, ctx, 3);
        let limitY = math.add(origin, math.multiply(math.squeeze(math.row(rotationMatrix, 1)), 100.0)).toArray();
        this.drawArrow([origin[1], origin[0]], [limitY[1], limitY[0]], "green", 1.0, ctx, 3);
        let limitZ = math.subtract(origin, math.multiply(math.squeeze(math.row(rotationMatrix, 2)), 100.0)).toArray();
        this.drawArrow([origin[1], origin[0]], [limitZ[1], limitZ[0]], "blue", 1.0, ctx, 3);
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
     * Draw an arrow
     */
    static drawArrow([ay, ax], [by, bx], color, scale, ctx, lineWidth=2) {

        var headlen = 10; // length of head in pixels
        var dx = bx - ax;
        var dy = by - ay;
        var angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx - headlen * Math.cos(angle - Math.PI / 6), by - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - headlen * Math.cos(angle + Math.PI / 6), by - headlen * Math.sin(angle + Math.PI / 6));
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

    /**
     * Draw pose keypoints onto a canvas
     */
    static  drawKeyPoints(keypoints, minConfidence, ctx, scale = 1, color) {
        for (let i = 0; i < keypoints.length; i++) {
            const keypoint = keypoints[i];
            if (keypoint.score < minConfidence)
                continue;
            const {y, x} = keypoint.position;
            this.drawPoint(ctx, x * scale, y * scale, 3, color);
        }
    }


    static drawPose(ctx, pose, minPoseConfidence, minPartConfidence, scale=1, color="red") {
        const {score, keypoints} = pose;
        if (score >= minPoseConfidence) {
            this.drawKeyPoints(keypoints, minPartConfidence, ctx, scale, color);
            this.drawSkeleton(keypoints, minPartConfidence, ctx, scale, color);
        }
    }

    static drawFace(ctx, face) {
        var mesh = face.scaledMesh;
        ctx.fillStyle = "#00FF00";
        for (let i = 0; i < mesh.length; i++) {
            var [x, y, z] = mesh[i];
            ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
    }
}
