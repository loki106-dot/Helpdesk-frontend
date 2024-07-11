const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    orderId: { type: String, required: true },
    queryType: { type: String, required: true },
    queryDescription: { type: String, required: true }
});

module.exports = mongoose.model('Query', querySchema);