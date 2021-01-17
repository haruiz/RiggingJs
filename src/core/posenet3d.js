import * as tf from '@tensorflow/tfjs';
import TFjsUtil from "../util/tfjs.util";


class Posenet3d{
    NUM_OF_KEY_POINTS = 19;
    constructor(url) {
        this.model = null;
        this.modelUrl = url;
        this.tensorInput = null;
    }
    async estimatePoses(img){
        let modelOutputs = await this.invokeModel(img)
        return this.decodePose(modelOutputs);
    }
    get_heatmap_score (heatmap_ptr, s_hmp_w, idx_y, idx_x, key_id){
        let idx = (idx_y * s_hmp_w * this.NUM_OF_KEY_POINTS) + (idx_x * this.NUM_OF_KEY_POINTS) + key_id;
        return heatmap_ptr[idx];
    }
    get_offset_vector (offsets_ptr, ofst3d,s_hmp_w, idx_y, idx_x, pose_id_){
        let map_id_to_panoptic = [1, 0, 9, 10, 11, 3, 4, 5, 12, 13, 14, 6, 7, 8, 15, 16, 17, 18, 2];
        let pose_id = map_id_to_panoptic[pose_id_];
        let idx0 = (idx_y * s_hmp_w * this.NUM_OF_KEY_POINTS*3) + (idx_x * this.NUM_OF_KEY_POINTS*3) + (3 * pose_id);
        let idx1 = (idx_y * s_hmp_w * this.NUM_OF_KEY_POINTS*3) + (idx_x * this.NUM_OF_KEY_POINTS*3) + (3 * pose_id + 1);
        let idx2 = (idx_y * s_hmp_w * this.NUM_OF_KEY_POINTS*3) + (idx_x * this.NUM_OF_KEY_POINTS*3) + (3 * pose_id + 2);
        ofst3d.x = offsets_ptr[idx0];
        ofst3d.y = offsets_ptr[idx1];
        ofst3d.z = offsets_ptr[idx2];
    }
    get_index_to_pos (offsets_ptr, idx_x,s_hmp_w,s_hmp_h, idx_y, key_id, pos2d, pos3d){
        /* pos 2D */
        pos2d.x = idx_x / (s_hmp_w -1);
        pos2d.y = idx_y / (s_hmp_h -1);
        /* pos 3D */
        this.get_offset_vector (offsets_ptr, pos3d,s_hmp_w, idx_y, idx_x, key_id);
    }
    async decodePose(outTensors){
        let tensorOffsets = outTensors[0]; /* (1,  32,  56, 57) */
        let tensorHeatmap = outTensors[1]; /* (1,  32,  56, 19) */
        let s_hmp_w = tensorHeatmap.shape[2];
        let s_hmp_h = tensorHeatmap.shape[1];
        let scores_ptr = await tensorHeatmap.data();
        let bbox_ptr   = await tensorOffsets.data();

        let max_block_idx = [];
        let max_block_cnf = [];

        /* find the highest heatmap block for each key */
        //TODO: optimize this block
        for (let i = 0; i < this.NUM_OF_KEY_POINTS; i ++) {
            let max_confidence = -Number.MAX_VALUE;
            for (let y = 0; y < s_hmp_h; y++) {
                for (let x = 0; x < s_hmp_w; x++) {
                    let confidence = this.get_heatmap_score(scores_ptr, s_hmp_w, y, x, i);
                    if (confidence > max_confidence) {
                        max_confidence = confidence;
                        max_block_cnf[i] = confidence;
                        max_block_idx[i] = {x: x, y: y};
                    }
                }
            }
        }
        tensorOffsets.dispose();
        tensorHeatmap.dispose();

        let pose = {};
        pose.key   = new Array(this.NUM_OF_KEY_POINTS);
        pose.key3d = new Array(this.NUM_OF_KEY_POINTS);

        /* find the offset vector and calculate the keypoint coordinates. */
        for (let i = 0; i < this.NUM_OF_KEY_POINTS;i ++ ){
            let idx_x = max_block_idx[i].x;
            let idx_y = max_block_idx[i].y;
            let pos2d = {x:0.0, y:0.0};
            let pos3d = {x:0.0, y:0.0, z:0.0};
            this.get_index_to_pos(bbox_ptr,idx_x,s_hmp_w, s_hmp_h, idx_y, i, pos2d, pos3d);
            pose.key[i] = {x: pos2d.x, y: pos2d.y, score: max_block_cnf[i]};
            pose.key3d[i] = {x: pos3d.x, y: pos3d.y, z: pos3d.z, score: max_block_cnf[i]};
        }

        return pose;
    }
    async invokeModel(img){
        let inputTensorDims = this.getInputDims();
        let imgInputWidth = inputTensorDims.width;
        let imgInputHeight = inputTensorDims.height;
        //let imgInputChannels = inputTensorDims.channels;
        if(this.model){
            return tf.tidy(() => {
                let imgTensor = tf.image.resizeBilinear(img, [imgInputHeight, imgInputWidth]);
                //imgTensor = imgTensor.flatten()
                imgTensor = TFjsUtil.customNormalize(imgTensor, imgTensor.shape);
                //imgTensor = imgTensor.reshape([imgInputHeight, imgInputWidth, 3]);
                //let min =  0, max = 1;
                //imgTensor = imgTensor.toFloat().mul((max - min)/255.0).add(min);
                //let batched = imgTensor.reshape([-1, imgInputHeight, imgInputWidth, imgInputChannels]);
                let batched = imgTensor.expandDims(0);
                return this.model.predict(batched);
            });
        }
        return null;
    }
    getInputDims(){
        return {
            width : this.tensorInput.shape[2],
            height : this.tensorInput.shape[1],
            channels: this.tensorInput.shape[3]
        }
    }
    async load(){
        this.model = await tf.loadGraphModel(this.modelUrl);
        this.tensorInput   = TFjsUtil.getTensorByName(this.model, 0, "data");
    }
}

export async function load(url = "/assets/js/models/posenet3d/model.json"){
    let model = new Posenet3d(url);
    await model.load();
    return model;
}
