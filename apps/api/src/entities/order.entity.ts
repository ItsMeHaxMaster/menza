import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { User } from './user.entity';
import { Menu } from './menu.entity';
import { Food } from './food.entity';

@Entity()
export class Order {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Menu)
  menu!: Menu;

  @ManyToOne(() => Food)
  food!: Food;

  @Property()
  createdAt: Date = new Date();
}
