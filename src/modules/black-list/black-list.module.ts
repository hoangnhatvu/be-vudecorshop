import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { tokenBlacklistSchema } from 'src/models/token_blacklist.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TokenBlacklist', schema: tokenBlacklistSchema },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: 'TokenBlacklist', schema: tokenBlacklistSchema },
    ]),
  ],
})
export class BlackListModule {}
