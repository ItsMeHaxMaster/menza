import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { Order } from './order.entity';
import { Food } from './food.entity';

@Entity()
export class OrderFood {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => Food)
  food!: Food;

  @Property()
  day!: number;
}
