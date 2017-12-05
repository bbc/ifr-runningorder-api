const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const RunningOrderSchema = new mongoose.Schema(
    {
        pid: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { minimize: false },
);

RunningOrderSchema.plugin(timestamps);
RunningOrderSchema.plugin(mongooseStringQuery);

const RunningOrder = mongoose.model('RunningOrder', RunningOrderSchema);
module.exports = RunningOrder;