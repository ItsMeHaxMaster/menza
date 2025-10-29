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
import { Order } from './order.entity';

@Entity()
export class Menu {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @ManyToMany(() => Food, (food) => food.menus, { owner: true })
  foods = new Collection<Food>(this);

  @ManyToMany(() => Order, (order) => order.menus)
  orders = new Collection<Order>(this);

  @Property()
  year!: number;

  @Property()
  week!: number;

  @Property()
  day!: number; // 1 = Monday, 2 = Tuesday, ... 5 = Friday
}
