

const math = window.math;
// Converts from degrees to radians.
Math.radians = (degrees)=> degrees * Math.PI / 180;
// Converts from radians to degrees.
Math.degrees = (radians)=> radians * 180 / Math.PI;

export default class GeometryUtil {
    /**
     * find the angle between 3 point in the 2d space
     * @param p1
     * @param p2
     * @param p3
     * @returns {number}
     */
    static findAngle(p1, p2, p3) {
        const p12 = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        const p13 = Math.sqrt(Math.pow((p1.x - p3.x), 2) + Math.pow((p1.y - p3.y), 2));
        const p23 = Math.sqrt(Math.pow((p2.x - p3.x), 2) + Math.pow((p2.y - p3.y), 2));
        const angle = Math.acos(((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) / (2 * p12 * p13));
        return angle;
    };

    /**
     * scale a value
     * @param original
     * @param in_min
     * @param in_max
     * @param out_min
     * @param out_max
     * @returns {*}
     */
    static map(original, in_min, in_max, out_min, out_max) {
        return (original - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    static computeHeadPoseEstimation(face){
        const {annotations, scaledMesh} = face;
        const { leftCheek, rightCheek } = annotations;
        // grab the landmark points
        const points = math.matrix(scaledMesh);
        //1. create new coordinate system
        //choose the origin point
        const { noseTip } = annotations;
        const origin = noseTip[0];
        //compute inner distance between extreme points
        const cheeksDistance = math.norm(math.subtract(leftCheek[0], rightCheek[0]));
        // scale coordinates
        const scaled = math.divide(points,cheeksDistance);
        // normalized coordinates - 0-1
        const centered = math.subtract_(points, math.mean(scaled, 0));

        // pick target coordinates
        const a = math.squeeze(math.row(centered,33)).toArray(); //left eyes - 33 idx
        const b = math.squeeze(math.row(centered,263)).toArray(); // right eye - 263 idx
        //const c =  math.squeeze(math.row(centered,6)).toArray();
        const c =  [(a[0] + b[0]) / 2, a[1], a[2]];
        const d = math.squeeze(math.row(centered,152)).toArray(); // chin - 152 idx
        // using pitagoras and identity functions
        let rx = math.subtract(a,b);
        rx = math.divide(rx, math.norm(rx));

        // using pitagoras and identity functions
        let ry = math.subtract(c,d);
        ry = math.divide(ry, math.norm(ry));

        // project z vector as computing the cross product
        let rz = math.cross(rx, ry);

        // create rotation matrix
        let rotationMatrix = math.matrix([rx,ry,rz]);
        return {origin, rotationMatrix};
    }
}

math.import({
    /**
     * multiply a 1d vector for each row in a 2d matrix
      * @param X
     * @param y
     * @returns {*}
     * @private
     */
    subtract_: (X, y) => {
        const _X = math.clone(X);
        for (let rowIndex = 0; rowIndex < _X.length; rowIndex++) {
            const row = X[rowIndex];
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const column = row[colIndex];
                // Supports y.length === 1 or y.length === row.length
                if (y.length === 1) {
                    const subs = y[0];
                    _X[rowIndex][colIndex] = column - subs;
                } else if (y.length === row.length) {
                    const subs = y[colIndex];
                    _X[rowIndex][colIndex] = column - subs;
                } else {
                    throw Error(`Dimension of y ${y.length} and row ${row.length} are not compatible`);
                }
            }
        }
        return _X;
    },
    /**
     * transform a rotation matrix into euler angles representation
     * @param R
     * @returns {{roll: *, pitch: *, yaw: *}}
     */
    rotationMatrixToEulerAngles:(R)=>{
        R = R.toArray(); // convert mat.js array to js native array
        let sy = Math.sqrt(Math.pow(R[0][0], 2) + Math.pow(R[1][0], 2));
        let isSingular = sy < 1e-6;
        let x = 0;
        let y = 0;
        let z = 0;
        if(!isSingular){
            x = Math.atan2(R[2][1], R[2][2]);
            y = Math.atan2(-R[2][0], sy);
            z = Math.atan2(R[1][0], -R[0][0]);
        }
        else{
            x = Math.atan2(-R[1][2], R[1][1]);
            y = Math.atan2(-R[2][0], sy);
            z = 0;
        }
        let pitch = Math.radians(x);
        let yaw = Math.radians(y);
        let roll = Math.radians(z);
        return {pitch, yaw, roll};
    }
});
