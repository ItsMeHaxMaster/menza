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

  @Property({ default: 27 })
  vatRate: number = 27; // VAT rate in percentage (default 27%)

  @Property({ length: 50, default: 'txcd_99999999' })
  stripeTaxCode: string = 'txcd_99999999'; // Stripe product tax code for restaurant/prepared food

  @Property({ persist: false })
  get vatAmount(): number {
    return this.price * (this.vatRate / (100 + this.vatRate));
  }

  @Property({ persist: false })
  get priceWithoutVat(): number {
    return this.price - this.vatAmount;
  }

  @Property({ length: 40, nullable: true })
  pictureId?: string;

  @ManyToMany(() => Allergen, (allergen) => allergen.foods, { owner: true })
  allergens = new Collection<Allergen>(this);

  @ManyToMany(() => Menu, (menu) => menu.foods)
  menus = new Collection<Menu>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
