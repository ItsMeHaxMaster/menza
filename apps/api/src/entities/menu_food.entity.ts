import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { Food } from './food.entity';
import { Menu } from './menu.entity';

@Entity()
export class MenuFood {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @ManyToOne(() => Menu)
  menu!: Menu;

  @ManyToOne(() => Food)
  food!: Food;

  @Property()
  day!: number;
}
