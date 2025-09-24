import { generateDummyData } from './dummy_data';

console.log('🌱 Starting database seeding...\n');

generateDummyData()
  .then(() => {
    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database seeding failed:', error);
    process.exit(1);
  });
