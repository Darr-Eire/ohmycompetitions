// Test script to verify homepage displays all competition types
const testCompetitions = [
  {
    slug: 'test-pi-giveaway',
    title: 'Test Pi Giveaway',
    prize: '100 π Tokens',
    description: 'Test competition for Pi theme',
    totalTickets: 500,
    entryFee: 0.5,
    piAmount: 0.5,
    theme: 'pi',
    endsAt: '2025-07-25T23:59',
    status: 'active',
    imageUrl: '/images/bitcoin.png'
  },
  {
    slug: 'test-crypto-giveaway',
    title: 'Test Crypto Giveaway',
    prize: '0.1 BTC',
    description: 'Test competition for Crypto theme',
    totalTickets: 300,
    entryFee: 1.0,
    piAmount: 1.0,
    theme: 'crypto',
    endsAt: '2025-07-26T23:59',
    status: 'active',
    imageUrl: '/images/bitcoin.png'
  },
  {
    slug: 'test-free-competition',
    title: 'Test Free Competition',
    prize: '50 π Tokens',
    description: 'Test competition for Free theme',
    totalTickets: 1000,
    entryFee: 0,
    piAmount: 0,
    theme: 'free',
    endsAt: '2025-07-27T23:59',
    status: 'active',
    imageUrl: '/images/daily.png'
  }
];

console.log('🏆 Test Competitions to Create:');
testCompetitions.forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.theme.toUpperCase()}: ${comp.title}`);
  console.log(`   Prize: ${comp.prize}`);
  console.log(`   Entry Fee: ${comp.entryFee} π`);
  console.log(`   Theme: ${comp.theme}`);
  console.log('');
});

console.log('📋 Instructions:');
console.log('1. Go to http://localhost:3000/admin/competitions/create');
console.log('2. Create each competition above with the exact details');
console.log('3. Check homepage at http://localhost:3000/homepage');
console.log('4. Verify each theme appears in its correct section:');
console.log('   - pi → "Pi Giveaways" section');
console.log('   - crypto → "Crypto Giveaways" section');
console.log('   - free → "Free Competitions" section (if implemented)');
console.log('');
console.log('✅ Expected Homepage Sections:');
console.log('- Featured Competitions (tech theme)');
console.log('- Travel & Lifestyle (premium theme)');
console.log('- Pi Giveaways (pi theme)');
console.log('- Crypto Giveaways (crypto theme)');
console.log('- Daily Competitions (daily theme)');
console.log('- Free Competitions (free theme) - may be static'); 