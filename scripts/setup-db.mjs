import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Product" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Seeding products...');
    const products = [
      { name: 'Straight Hair Wig', price: 'GH₵85', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', category: 'Wigs' },
      { name: 'Body Wave 24"', price: 'GH₵95', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80', category: 'Wigs' },
      { name: 'Kinky Curly Bundle', price: 'GH₵120', image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80', category: 'Bundles' },
      { name: 'Lace Frontal Wig', price: 'GH₵145', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', category: 'Wigs' },
      { name: 'Hair Extensions', price: 'GH₵75', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', category: 'Extensions' },
      { name: 'Premium Silk Wig', price: 'GH₵180', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', category: 'Premium' },
      { name: 'HD Lace Wig', price: 'GH₵190', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', category: 'Premium' },
      { name: 'Luxury Closure', price: 'GH₵145', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80', category: 'Premium' },
      { name: 'Body Wave Bundle', price: 'GH₵135', image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80', category: 'Bundles' },
      { name: 'Deep Wave 22"', price: 'GH₵105', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', category: 'Wigs' },
      { name: 'Straight Extensions Pack', price: 'GH₵85', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', category: 'Extensions' },
      { name: 'Curly Lace Wig', price: 'GH₵165', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', category: 'Premium' },
    ];
    
    for (const product of products) {
      await client.query(
        'INSERT INTO "Product" (name, price, image, category) VALUES ($1, $2, $3, $4)',
        [product.name, product.price, product.image, product.category]
      );
    }
    
    console.log('✅ Database setup complete!');
    console.log(`✅ ${products.length} products seeded!`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
