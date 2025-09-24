import { Food } from '@/entities/food.entity';
import { Menu } from '@/entities/menu.entity';
import { Allergen } from '@/entities/allergen.entity';
import { orm } from '@/util/orm';

// Sample allergens data
const allergenData = [
  { name: 'Glutén', icon: 'wheat' },
  { name: 'Tejtermék', icon: 'milk' },
  { name: 'Dióféle', icon: 'nut' },
  { name: 'Tojás', icon: 'egg' },
  { name: 'Szója', icon: 'bean' },
  { name: 'Hal', icon: 'fish' },
  { name: 'Rákféle', icon: 'shell' },
  { name: 'Szezám', icon: 'grain' }
];

// Sample food data
const foodData = [
  // Main dishes
  {
    name: 'Rántott Csirkemell',
    description: 'Ropogós bundában sült csirkemell, citrommal és krumplival',
    price: 2890,
    allergens: ['Glutén', 'Tojás']
  },
  {
    name: 'Gulyásleves',
    description: 'Hagyományos magyar gulyásleves marhahússal és zöldségekkel',
    price: 2490,
    allergens: []
  },
  {
    name: 'Töltött Káposzta',
    description: 'Házi töltött káposzta darált hússal, rizzsel és tejföllel',
    price: 3190,
    allergens: ['Tejtermék']
  },
  {
    name: 'Sült Harcsa',
    description: 'Friss harcsa filé fűszerekkel, párolt zöldségekkel',
    price: 3590,
    allergens: ['Hal']
  },
  {
    name: 'Paprikás Krumpli',
    description: 'Fűszerpaprikás krumpli kolbásszal, tejföllel',
    price: 2290,
    allergens: ['Tejtermék']
  },
  {
    name: 'Lángos',
    description: 'Házi lángos tejföllel, sajttal és kolbásszal',
    price: 1890,
    allergens: ['Glutén', 'Tejtermék']
  },
  {
    name: 'Halászlé',
    description: 'Szegedi halászlé pontyból és harcsából, csípős fűszerekkel',
    price: 3290,
    allergens: ['Hal']
  },
  {
    name: 'Rántotthús',
    description: 'Klasszikus bécsi szelet borjúhúsból, citrommal',
    price: 4190,
    allergens: ['Glutén', 'Tojás']
  },
  {
    name: 'Lecsó Kolbásszal',
    description: 'Házi lecsó debreceni kolbásszal, kenyérrel',
    price: 2590,
    allergens: ['Glutén']
  },
  {
    name: 'Vegetáriánus Fasírt',
    description: 'Zöldséges fasírt bulgurral és tahini szósszal',
    price: 2190,
    allergens: ['Glutén', 'Szezám']
  },

  // Soups
  {
    name: 'Paradicsomleves',
    description: 'Krémes paradicsomleves friss bazsalikommal',
    price: 1590,
    allergens: ['Tejtermék']
  },
  {
    name: 'Húsleves Cérnametélttel',
    description: 'Házi húsleves cérnametélttel és zöldségekkel',
    price: 1890,
    allergens: ['Glutén', 'Tojás']
  },
  {
    name: 'Gombaleves',
    description: 'Krémes vegyesgomba leves tejszínnel',
    price: 1790,
    allergens: ['Tejtermék']
  },
  {
    name: 'Lencsefőzelék',
    description: 'Házi lencsefőzelék füstölt kolbásszal',
    price: 1690,
    allergens: []
  },

  // Sides
  {
    name: 'Fokhagymás Kenyér',
    description: 'Ropogós kenyér fokhagymás vajjal és fűszerekkel',
    price: 890,
    allergens: ['Glutén', 'Tejtermék']
  },
  {
    name: 'Hasábburgonya',
    description: 'Aranysárga, ropogós sültkrumpli',
    price: 690,
    allergens: []
  },
  {
    name: 'Káposztasaláta',
    description: 'Friss káposztasaláta ecetes-olajos öntettel',
    price: 590,
    allergens: []
  },
  {
    name: 'Rántott Hagymakarika',
    description: 'Bundában sült hagymakarikák',
    price: 790,
    allergens: ['Glutén', 'Tojás']
  },

  // Desserts
  {
    name: 'Somlói Galuska',
    description: 'Hagyományos somlói galuska diós-mákos töltelékkel',
    price: 1290,
    allergens: ['Glutén', 'Tejtermék', 'Tojás', 'Dióféle']
  },
  {
    name: 'Rétes Almával',
    description: 'Házi almás rétes fahéjjal és porcukorral',
    price: 990,
    allergens: ['Glutén', 'Tejtermék']
  },
  {
    name: 'Fagylalt Kehely',
    description: 'Vanília fagylalt csokoládé szósszal és diókkal',
    price: 890,
    allergens: ['Tejtermék', 'Dióféle']
  },
  {
    name: 'Gyümölcssaláta',
    description: 'Friss szezonális gyümölcsök',
    price: 790,
    allergens: []
  }
];

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getDateForWeekday(startDate: Date, weekday: number): Date {
  const date = new Date(startDate);
  const day = date.getDay();
  const diff = weekday - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export async function generateDummyData() {
  const em = (await orm).em.fork();

  try {
    console.log('🗑️  Clearing existing data...');

    // Clear existing data
    await em.nativeDelete(Menu, {});
    await em.nativeDelete(Food, {});
    await em.nativeDelete(Allergen, {});

    console.log('🌾 Creating allergens...');

    // Create allergens
    const allergens: Allergen[] = [];
    for (const allergenInfo of allergenData) {
      const allergen = new Allergen();
      allergen.name = allergenInfo.name;
      allergen.icon = allergenInfo.icon;
      allergens.push(allergen);
      em.persist(allergen);
    }

    await em.flush();
    console.log(`✅ Created ${allergens.length} allergens`);

    console.log('🍕 Creating foods...');

    // Create foods
    const foods: Food[] = [];
    for (const foodInfo of foodData) {
      const food = new Food();
      food.name = foodInfo.name;
      food.description = foodInfo.description;
      food.price = foodInfo.price;
      food.pictureId = 'd0f8d96ef806c440d4d2bce0bb56244540fd292f';

      // Add allergens to food by finding their IDs
      for (const allergenName of foodInfo.allergens) {
        const allergen = allergens.find((a) => a.name === allergenName);
        if (allergen) {
          food.allergens.add(allergen);
        }
      }

      foods.push(food);
      em.persist(food);
    }

    await em.flush();
    console.log(`✅ Created ${foods.length} foods`);

    console.log(
      '📅 Creating menus for 2 weeks (1 menu per day with 3 foods)...'
    );

    // Create menus for 2 weeks (Monday to Friday only)
    const startDate = new Date(); // Start from today
    const menus: Menu[] = [];

    for (let week = 0; week < 2; week++) {
      for (let day = 1; day <= 5; day++) {
        // Monday (1) to Friday (5)

        // Create 1 menu per day with 3 food options
        const menu = new Menu();

        // Calculate the date for this weekday
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + week * 7);
        menu.date = getDateForWeekday(weekStart, day);

        // Add 3 random foods to this single menu
        const selectedFoods = getRandomItems(foods, 3);

        for (const food of selectedFoods) {
          menu.foods.add(food);
        }

        menus.push(menu);
        em.persist(menu);

        console.log(
          `📋 Menu for ${menu.date.toDateString()}: ${selectedFoods.map((f) => f.name).join(', ')}`
        );
      }
    }

    await em.flush();
    console.log(`✅ Created ${menus.length} menus for 2 weeks`);

    // Summary
    console.log('\n🎉 Dummy data generation completed!');
    console.log('📊 Summary:');
    console.log(`   - ${allergens.length} allergens`);
    console.log(`   - ${foods.length} foods`);
    console.log(
      `   - ${menus.length} menus (2 weeks, Monday-Friday, 3 foods per menu)`
    );
    console.log(
      `   - Date range: ${menus[0].date.toDateString()} to ${menus[menus.length - 1].date.toDateString()}`
    );
  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateDummyData()
    .then(() => {
      console.log('✨ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
