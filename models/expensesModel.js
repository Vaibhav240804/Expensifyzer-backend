const mongoose = require('mongoose');


const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    type:{
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (createdAt) => {
            return new Date(createdAt).setHours(0, 0, 0, 0);
        },
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model("Expense", expenseSchema);