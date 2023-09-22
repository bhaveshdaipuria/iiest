const mongoose = require('mongoose');
const { Schema } = mongoose;

const fbo_register = new Schema({
    fbo_name: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    owner_contact: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    product_name: {
        type: String, 
        required: true
    },
    processing_amount: {
        type: Number, 
        required: true
    },
    service_name: {
        type: String, 
        required: true
    },
    client_type: {
        type: String,
        required: true
    },
    recipient_no: {
        type: Number,
        required: true
    }
});

const fbo_register_schema = mongoose.model('fbo_registers', fbo_register);
module.exports = fbo_register_schema;