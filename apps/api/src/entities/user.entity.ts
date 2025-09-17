import {
  BigIntType,
  Entity,
  PrimaryKey,
  Property,
  Unique
} from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey({ type: new BigIntType('bigint') })
  id!: bigint;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property()
  password!: string;
}
