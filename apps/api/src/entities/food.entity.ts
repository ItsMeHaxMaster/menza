import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { Menu } from './menu.entity';
import { Allergen } from './allergen.entity';

@Entity()
export class Food {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @Property({ length: 256 })
  name!: string;

  @Property({ length: 2048 })
  description!: string;

  @Property()
  price!: number;

  @Property({ length: 40 })
  pictureId!: string;

  @ManyToMany(() => Allergen, (allergen) => allergen.foods, { owner: true })
  allergens = new Collection<Allergen>(this);

  @ManyToMany(() => Menu, (menu) => menu.foods)
  menus = new Collection<Menu>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
