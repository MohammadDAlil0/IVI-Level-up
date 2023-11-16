const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    codeforcesHandle: {
        type: String,
        require: true,
        unique: true        
    },
    handlesOfOtherSites: [{
        handle: {type: String},
        site: {type: String}   
    }],
    vtoken: String,
    vtokenDate: Date,
    folders: {
        type: [{
            name: {
                type: String
            },
            problems: [{
                idProblem: {
                    type: String
                },
                name: String,
                hints: [{
                    content: String,
                    price: Number,
                    whoPaied: [{
                        type: Schema.Types.ObjectId,
                        ref: 'User',
                        default: []
                    }]
                }],
                tags: {
                    type: [{
                        type: String
                    }],
                    default: []
                },
                description: String,
                verdict: String,
                votes: [{
                    _id: {
                        type: Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    typeOfVotes: {
                        type: Number,
                        default: 0   
                    }
                }],
                value: {
                    type: Number,
                    default: 0
                }
            }],
            visible: {
                type: Boolean,
                required: true
            },
            color: {
                type: String
            },
            solved: Number
        }],
        default: []
    },
    friends: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    bio: String,
    paied: {
        type: Number,
        default: 0        
    }
});
userSchema.pre('remove', async function (next) {
  try {
    await this.model('User').updateMany(
      { _id: { $in: this.friends } },
      { $pull: { friends: this._id } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
