import * as tf from '@tensorflow/tfjs';

export default class TFjsUtil {
    static getTensorByName(model, io, name) {
        let tensors;
        if (io === 0)
            tensors = model.inputs;
        else
            tensors = model.outputs;
        let p_tensor;
        for (let i = 0; i < tensors.length; i++) {
            if (tensors[i].name === name) {
                p_tensor = tensors[i];
                break;
            }
        }
        return p_tensor;
    }
    static customNormalize(image, outputShape) {
        const program = {
            variableNames: ['image'],
            outputShape,
            userCode: `
                void main() {
                  ivec3 coords = getOutputCoords();
                  float outVal = 0.;
                  if(coords.z != 3) {
                    float val = getImage(coords.x, coords.y, coords.z);
                    outVal = 2. * ((val / 255.) - 0.5);
                  }
                  setOutput(outVal);
                }
              `
        }
        const webglBackend = tf.backend();
        const result = webglBackend.compileAndRun(program, [image]);
        return result;
    }
}