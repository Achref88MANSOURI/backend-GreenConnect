/**
 * Script to fix products with "Unknown" vendeur field
 * This updates the vendeur field with the actual owner's name from the farmer relation
 * 
 * Run with: node scripts/fix-vendeur-names.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - matches TypeORM config in app.module.ts
const dbPath = path.join(__dirname, '..', 'db.sqlite');

console.log('🔧 Fixing vendeur names in products...');
console.log('📂 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Cannot open database:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Database connected\n');
  
  db.all(`
    SELECT p.id, p.title, p.vendeur, p.farmerId, u.name as ownerName
    FROM product p
    LEFT JOIN user u ON p.farmerId = u.id
    WHERE p.vendeur IS NULL OR p.vendeur = 'Unknown' OR p.vendeur = ''
  `, [], (err, rows) => {
    if (err) {
      console.error('❌ Query error:', err.message);
      db.close();
      process.exit(1);
    }

    console.log(`📋 Found ${rows.length} products to fix\n`);

    if (rows.length === 0) {
      console.log('✅ All products already have correct vendeur names!');
      db.close();
      process.exit(0);
    }

    let fixedCount = 0;
    let skippedCount = 0;
    let processed = 0;

    rows.forEach((product) => {
      if (product.ownerName) {
        db.run('UPDATE product SET vendeur = ? WHERE id = ?', [product.ownerName, product.id], function(err) {
          if (err) {
            console.error(`❌ Failed to update product #${product.id}:`, err.message);
          } else {
            console.log(`✅ Product #${product.id} "${product.title}": "${product.vendeur || 'NULL'}" → "${product.ownerName}"`);
            fixedCount++;
          }
          
          processed++;
          checkComplete();
        });
      } else {
        console.log(`⚠️  Product #${product.id} "${product.title}": No owner found (farmerId: ${product.farmerId})`);
        skippedCount++;
        processed++;
        checkComplete();
      }
    });

    function checkComplete() {
      if (processed === rows.length) {
        console.log('\n' + '='.repeat(50));
        console.log(`📊 Summary:`);
        console.log(`   ✅ Fixed: ${fixedCount} products`);
        console.log(`   ⚠️  Skipped: ${skippedCount} products (no owner found)`);
        console.log('='.repeat(50));
        console.log('\n🎉 Done!');
        db.close();
      }
    }
  });
});
