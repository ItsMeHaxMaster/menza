import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { Order } from './order.entity';
import { MenuFood } from './menu_food.entity';

@Entity()
export class Menu {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @OneToMany(() => MenuFood, (menuFood) => menuFood.menu)
  foods = new Collection<MenuFood>(this);

  @ManyToMany(() => Order, (order) => order.menus)
  orders = new Collection<Order>(this);

  @Property()
  year!: number;

  @Property()
  week!: number;
}
