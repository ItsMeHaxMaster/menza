import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { Food } from './food.entity';

@Entity()
export class Menu {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @ManyToMany(() => Food, (food) => food.menus, { owner: true })
  foods = new Collection<Food>(this);

  @Property()
  date!: Date;
}
