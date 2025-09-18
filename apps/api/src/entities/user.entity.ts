import snowflake from '@/util/snowflake';
import {
  BeforeCreate,
  BigIntType,
  Entity,
  PrimaryKey,
  Property,
  Unique
} from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey({ type: BigIntType })
  id!: bigint;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property()
  password!: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt!: Date;

  @BeforeCreate()
  assignId() {
    this.id = snowflake.getUniqueID() as bigint;
  }
}
