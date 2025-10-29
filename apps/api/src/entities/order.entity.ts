import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Entity,
  ManyToOne,
  ManyToMany,
  OneToMany,
  Collection,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { User } from './user.entity';
import { Menu } from './menu.entity';
import { OrderFood } from './order_food.entity';

@Entity()
export class Order {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => OrderFood, (orderFood) => orderFood.order)
  foods = new Collection<OrderFood>(this);

  @ManyToMany(() => Menu)
  menus = new Collection<Menu>(this);

  @Property()
  totalAmount!: number;

  @Property()
  vat!: number;

  @Property({ length: 255, nullable: true })
  stripeSessionId?: string;

  @Property({ length: 50 })
  paymentStatus!: string; // 'pending', 'paid', 'failed', 'refunded'

  @Property({ length: 10 })
  currency: string = 'HUF';

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
