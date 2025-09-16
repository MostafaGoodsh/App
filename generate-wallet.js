// إنشاء محفظة Solana جديدة
import { Keypair } from '@solana/web3.js';

console.log('🔐 إنشاء محفظة جديدة...\n');

const keypair = Keypair.generate();

console.log('📍 عنوان المحفظة العامة:');
console.log(keypair.publicKey.toString());

console.log('\n🔑 المفتاح الخاص (JSON Array):');
console.log(JSON.stringify(Array.from(keypair.secretKey)));

console.log('\n✅ تم إنشاء المحفظة بنجاح!');
console.log('\n📝 إرشادات:');
console.log('1. انسخ المفتاح الخاص (JSON Array) من الأعلى');
console.log('2. حدث المفتاح السري في Supabase');
console.log('3. احصل على SOL مجاني من: https://faucet.solana.com');