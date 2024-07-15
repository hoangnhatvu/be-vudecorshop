import * as mongoose from 'mongoose';

export const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
  },
});
