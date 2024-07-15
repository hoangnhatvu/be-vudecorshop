import { Document } from 'mongoose';

export interface TokenBlacklist extends Document {
    token: string,
}