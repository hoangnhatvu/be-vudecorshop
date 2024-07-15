import { Document } from 'mongoose';
import { User } from './user';

export interface MetaData extends Document {
  created_by: User;
  created_date: Date;
  updated_by: User;
  updated_date: Date;
  updated_token: string;
}
