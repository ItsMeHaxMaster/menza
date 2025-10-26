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
    description: `**Ropogós bundában sült csirkemell házi körettel**

Friss csirkemell filé aranybarnára sütve ropogós bundában, frissen facsart citrommal és illatos körettel tálalva.

**Összetevők:**
- Csirkemell filé
- Liszt
- Tojás
- Zsemlemorzsa
- Sütőolaj
- Citrom
- Petrezselyem
- Párolt burgonya
- Só, bors`,
    price: 2890,
    allergens: ['Glutén', 'Tojás']
  },
  {
    name: 'Gulyásleves',
    description: `**Hagyományos magyar gulyásleves eredeti receptúra szerint**

Omlós marhahús gazdagon fűszerezve, friss zöldségekkel és burgonyával főzve, magyaros fűszerpaprikával ízesítve.

**Összetevők:**
- Marhahús
- Burgonya
- Sárgarépa
- Fehérrépa
- Zellergumó
- Paradicsom
- Hagyma
- Fokhagyma
- Fűszerpaprika
- Köménymag
- Só, bors
- Csípős paprika (opcionális)`,
    price: 2490,
    allergens: []
  },
  {
    name: 'Töltött Káposzta',
    description: `**Házi töltött káposzta nagymama receptje szerint**

Savanyú káposztába tekert ízletes darált hús és rizs keverék, tejfölös mártásban lassan párolva, igazi házi ízekkel.

**Összetevők:**
- Savanyú káposzta
- Darált sertéshús
- Rizs
- Hagyma
- Tojás
- Fűszerpaprika
- Tejföl
- Paradicsom
- Fokhagyma
- Babérlevél
- Só, bors`,
    price: 3190,
    allergens: ['Tejtermék']
  },
  {
    name: 'Sült Harcsa',
    description: `**Friss harcsa filé mediterrán fűszerekkel**

Omlós harcsa filé édes vajon sütve, friss gyógynövényekkel és citrommal ízesítve, párolt szezonális zöldségekkel tálalva.

**Összetevők:**
- Harcsa filé
- Vaj
- Citrom
- Fokhagyma
- Petrezselyem
- Rozmaring
- Párolt brokkoli
- Sárgarépa
- Cukkini
- Só, bors
- Fehérbor`,
    price: 3590,
    allergens: ['Hal']
  },
  {
    name: 'Paprikás Krumpli',
    description: `**Fűszerpaprikás krumpli házi debreceni kolbásszal**

Kiadós magyar egytálétel vajban pirított hagymával, fűszerpaprikával és főtt burgonyával, debreceni kolbásszal és tejföllel tálalva.

**Összetevők:**
- Burgonya
- Debreceni kolbász
- Hagyma
- Fűszerpaprika
- Paradicsom
- Paprika
- Tejföl
- Vaj
- Fokhagyma
- Só, bors
- Kenyér`,
    price: 2290,
    allergens: ['Tejtermék']
  },
  {
    name: 'Lángos',
    description: `**Házi lángos hagyományos feltétekkel**

Forró olajban sült, puha belsejű és ropogós szélű lángos, friss tejföllel, reszelt sajttal és szeletelt debreceni kolbásszal megrakva.

**Összetevők:**
- Liszt
- Élesztő
- Tej
- Cukor
- Só
- Sütőolaj
- Tejföl
- Reszelt sajt
- Debreceni kolbász
- Fokhagyma (opcionális)`,
    price: 1890,
    allergens: ['Glutén', 'Tejtermék']
  },
  {
    name: 'Halászlé',
    description: `**Szegedi halászlé eredeti receptúra szerint**

Tüzes, csípős halászlé friss folyami halakból (ponty és harcsa), fűszerpaprikával és erős paprikával gazdagon ízesítve.

**Összetevők:**
- Ponty
- Harcsa
- Hagyma
- Paradicsom
- Fűszerpaprika
- Erős paprika
- Fokhagyma
- Só
- Kenyér`,
    price: 3290,
    allergens: ['Hal']
  },
  {
    name: 'Rántotthús',
    description: `**Klasszikus bécsi szelet eredeti módszer szerint**

Vékonyra kalapált borjúhús aranybarnára sütve ropogós bundában, friss citrommal, petrezselymes burgonyával és áfonyalekváral tálalva.

**Összetevők:**
- Borjúhús
- Liszt
- Tojás
- Zsemlemorzsa
- Sütőolaj
- Citrom
- Petrezselyem
- Burgonya
- Áfonyalekvár
- Só, bors`,
    price: 4190,
    allergens: ['Glutén', 'Tojás']
  },
  {
    name: 'Lecsó Kolbásszal',
    description: `**Házi lecsó magyaros ízekkel**

Friss paprika, paradicsom és hagyma fűszerpaprikával készítve, füstölt debreceni kolbásszal gazdagítva, friss kenyérrel tálalva.

**Összetevők:**
- Paprika (zöld, piros, sárga)
- Paradicsom
- Hagyma
- Debreceni kolbász
- Fűszerpaprika
- Fokhagyma
- Tojás (opcionális)
- Só, bors
- Kenyér`,
    price: 2590,
    allergens: ['Glutén']
  },
  {
    name: 'Vegetáriánus Fasírt',
    description: `**Zöldséges fasírt keleti fűszerekkel**

Ízletes növényi fasírt bulgurból, friss zöldségekből és fűszerekből, krémes tahini szósszal és friss salátával tálalva.

**Összetevők:**
- Bulgur
- Sárgarépa
- Cukkini
- Hagyma
- Fokhagyma
- Petrezselyem
- Koriander
- Köménymag
- Tahini
- Citrom
- Liszt
- Só, bors
- Vegyes saláta`,
    price: 2190,
    allergens: ['Glutén', 'Szezám']
  },

  // Soups
  {
    name: 'Paradicsomleves',
    description: `**Krémes paradicsomleves mediterrán ízekkel**

Érett paradicsomból készült selymes krémleves friss bazsalikommal, tejszínnel és ropogós krutonnal tálalva.

**Összetevők:**
- Paradicsom
- Hagyma
- Fokhagyma
- Bazsalikom
- Tejszín
- Zöldségleves alaplé
- Vaj
- Cukor
- Só, bors
- Kruton`,
    price: 1590,
    allergens: ['Tejtermék']
  },
  {
    name: 'Húsleves Cérnametélttel',
    description: `**Házi húsleves nagyi receptje szerint**

Tiszta, aranyló húsleves csirkéből és marhahúsból főzve, friss zöldségekkel és házi cérnametélttel gazdagítva.

**Összetevők:**
- Csirke
- Marhahús
- Sárgarépa
- Fehérrépa
- Zellergumó
- Petrezselyem gyökér
- Karalábé
- Hagyma
- Cérnametélt
- Só, bors
- Babérlevél`,
    price: 1890,
    allergens: ['Glutén', 'Tojás']
  },
  {
    name: 'Gombaleves',
    description: `**Krémes vegyesgomba leves erdei ízekkel**

Selymes gombaleves friss vegyesgombából (champignon, laska, shiitake), tejszínnel és friss petrezselyemmel készítve.

**Összetevők:**
- Vegyesgomba
- Hagyma
- Fokhagyma
- Tejszín
- Vaj
- Liszt
- Zöldségleves alaplé
- Petrezselyem
- Fehérbor
- Só, bors`,
    price: 1790,
    allergens: ['Tejtermék']
  },
  {
    name: 'Lencsefőzelék',
    description: `**Házi lencsefőzelék füstölt kolbásszal**

Tápláló vöröslencsefőzelék füstölt kolbásszal, hagymával és fűszerpaprikával ízesítve, ecetes céklával tálalva.

**Összetevők:**
- Vöröslencse
- Füstölt kolbász
- Hagyma
- Fokhagyma
- Fűszerpaprika
- Babérlevél
- Só, bors
- Ecetes cékla`,
    price: 1690,
    allergens: []
  },

  // Sides
  {
    name: 'Fokhagymás Kenyér',
    description: `**Ropogós kenyér házi fokhagymás vajjal**

Frissen sült kenyér ropogósra pirítva, illatos fokhagymás vajjal megkenve, friss petrezselyemmel megszórva.

**Összetevők:**
- Kenyér
- Vaj
- Fokhagyma
- Petrezselyem
- Só
- Oregánó`,
    price: 890,
    allergens: ['Glutén', 'Tejtermék']
  },
  {
    name: 'Hasábburgonya',
    description: `**Aranysárga ropogós sültkrumpli**

Házi hasábburgonya kívül ropogós, belül puha, finom fűszerekkel ízesítve, házi majonézzel vagy ketchup-pal tálalva.

**Összetevők:**
- Burgonya
- Sütőolaj
- Só
- Paprika
- Fokhagymapor`,
    price: 690,
    allergens: []
  },
  {
    name: 'Káposztasaláta',
    description: `**Friss káposztasaláta házi öntettel**

Vékonyra szeletelt fehérkáposzta friss ecetes-olajos öntettel, köménymaggal ízesítve.

**Összetevők:**
- Fehérkáposzta
- Ecet
- Olaj
- Cukor
- Só
- Köménymag`,
    price: 590,
    allergens: []
  },
  {
    name: 'Rántott Hagymakarika',
    description: `**Ropogós bundában sült hagymakarikák**

Édes vöröshagyma vastag karikái aranybarnára sütve ropogós bundában, csípős szósszal tálalva.

**Összetevők:**
- Vöröshagyma
- Liszt
- Tojás
- Panko zsemlemorzsa
- Sütőolaj
- Só, bors
- Csípős szósz`,
    price: 790,
    allergens: ['Glutén', 'Tojás']
  },

  // Desserts
  {
    name: 'Somlói Galuska',
    description: `**Hagyományos somlói galuska házi módra**

Háromféle piskóta (natúr, diós, kakaós) vaníliakrémmel, diós-mákos töltelékkel, csokoládé öntettel és tejszínhabbal tálalva.

**Összetevők:**
- Piskóta (natúr, diós, kakaós)
- Vaníliakrém
- Dió
- Mák
- Csokoládé öntet
- Tejszínhab
- Rum
- Mazsola
- Cukor
- Tojás
- Tej`,
    price: 1290,
    allergens: ['Glutén', 'Tejtermék', 'Tojás', 'Dióféle']
  },
  {
    name: 'Rétes Almával',
    description: `**Házi almás rétes hagyományos módszer szerint**

Vékony, ropogós rétes tésztában zamatos almás töltelék fahéjjal, cukorral és mazsolával, porcukorral megszórva, meleg állapotban tálalva.

**Összetevők:**
- Rétes tészta
- Alma
- Cukor
- Fahéj
- Mazsola
- Vaj
- Zsemlemorzsa
- Porcukor
- Citromhéj`,
    price: 990,
    allergens: ['Glutén', 'Tejtermék']
  },
  {
    name: 'Fagylalt Kehely',
    description: `**Házi vaníliafagylalt desszert kehely**

Krémes vaníliafagylalt meleg csokoládé szósszal, friss tejszínhabbal, pirított dióval és cseresznye öntettel díszítve.

**Összetevők:**
- Vaníliafagylalt
- Csokoládé szósz
- Tejszínhab
- Pirított dió
- Cseresznye öntet
- Ostya`,
    price: 890,
    allergens: ['Tejtermék', 'Dióféle']
  },
  {
    name: 'Gyümölcssaláta',
    description: `**Friss szezonális gyümölcsök tálalva**

Színes gyümölcskeverék friss szezonális gyümölcsökből (alma, körte, narancs, banán, szőlő), friss mentával díszítve.

**Összetevők:**
- Alma
- Körte
- Narancs
- Banán
- Szőlő
- Eper (szezonálisan)
- Citromlé
- Méz
- Menta`,
    price: 790,
    allergens: []
  }
];

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
      food.vatRate = 27; // Hungarian standard VAT rate for food
      food.stripeTaxCode = 'txcd_99999999'; // Stripe tax code for restaurant/prepared food

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
      '📅 Creating menus for the entire year (1 menu per day with 3 foods)...'
    );

    // Helper function to get current ISO week number
    function getWeekNumber(date: Date): number {
      const target = new Date(date.valueOf());
      const dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    }

    // Helper function to get the number of ISO weeks in a year
    function getWeeksInYear(year: number): number {
      const dec28 = new Date(year, 11, 28);
      return getWeekNumber(dec28);
    }

    // Create menus for entire year (day 1-5, Monday to Friday)
    const today = new Date();
    const currentYear = today.getFullYear();
    const totalWeeks = getWeeksInYear(currentYear);
    const menus: Menu[] = [];

    for (let weekNumber = 1; weekNumber <= totalWeeks; weekNumber++) {
      for (let dayNumber = 1; dayNumber <= 5; dayNumber++) {
        // day 1 = Monday, 2 = Tuesday, ... 5 = Friday

        // Create 1 menu per day with 3 food options
        const menu = new Menu();
        menu.year = currentYear;
        menu.week = weekNumber;
        menu.day = dayNumber;

        // Add 3 random foods to this single menu
        const selectedFoods = getRandomItems(foods, 3);

        for (const food of selectedFoods) {
          menu.foods.add(food);
        }

        menus.push(menu);
        em.persist(menu);

        if (weekNumber <= 2 || weekNumber >= totalWeeks - 1) {
          // Log first 2 and last 2 weeks to avoid console spam
          console.log(
            `📋 Menu for ${currentYear}, week ${weekNumber}, day ${dayNumber}: ${selectedFoods.map((f) => f.name).join(', ')}`
          );
        }
      }
    }

    await em.flush();
    console.log(
      `✅ Created ${menus.length} menus for the entire year (${totalWeeks} weeks)`
    );

    // Summary
    console.log('\n🎉 Dummy data generation completed!');
    console.log('📊 Summary:');
    console.log(`   - ${allergens.length} allergens`);
    console.log(`   - ${foods.length} foods`);
    console.log(
      `   - ${menus.length} menus (entire year, days 1-5, 3 foods per menu)`
    );
    console.log(`   - Year: ${currentYear}, Weeks: 1 to ${totalWeeks}`);
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
