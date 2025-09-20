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
export class Allergen {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @Property({ length: 256 })
  name!: string;

  @Property({ length: 128 })
  icon!: string;

  @ManyToMany(() => Food, (menu) => menu.allergens)
  foods = new Collection<Food>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
