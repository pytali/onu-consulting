import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import config from './config/index.js';


mongoose.connect(config.database.uri, {});

const telnetResponseSchema = new mongoose.Schema({
    jobId: String,
    command: String,
    response: {type: Object, default: {}},
    createdAt: { type: Date, default: Date.now },
});

const auditSchema = new mongoose.Schema({
    user: String,
    requestIp: String,
    port: Number,
    jobId: String,
    command: String,
    createdAt: { type: Date, default: Date.now },
});

const deviceSchema = new mongoose.Schema({
    jobId: String,
    IP: {type: String, required: true},
    VENDOR: {type: String, required: true},
    DEVNAME: {type: String, required: true},
    DT: {type: String, required: true},
    DEVER: {type: String, required: true},
    IPOE: {type: String, required: true},
    createdAt: { type: Date, default: Date.now },
});

deviceSchema.index({ IP: 1 }, { unique: false });
deviceSchema.index({ VENDOR: 1 }, { unique: false });





const tb_telnet_response = mongoose.model('tb_telnet_response', telnetResponseSchema);
const tb_devices = mongoose.model('tb_devices', deviceSchema);
const tb_audit = mongoose.model('tb_audit', auditSchema);

export default tb_telnet_response;

export {
    tb_devices,
    tb_audit

};