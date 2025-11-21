const mongoose = require('mongoose');
const crypto = require('crypto');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    classCode: {
        type: String,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Generate a unique 6-character class code before saving
classSchema.pre('save', async function (next) {
    if (!this.classCode) {
        let code;
        let isUnique = false;

        while (!isUnique) {
            // Generate 6-character alphanumeric code
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            code = '';
            for (let i = 0; i < 6; i++) {
                const randomIndex = crypto.randomInt(0, characters.length);
                code += characters[randomIndex];
            }

            const existingClass = await mongoose.models.Class.findOne({ classCode: code });
            if (!existingClass) {
                isUnique = true;
            }
        }
        this.classCode = code;
    }
    next();
});

module.exports = mongoose.model('Class', classSchema);