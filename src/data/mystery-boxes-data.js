// File: src/data/mystery-boxes-data.js

export const mysteryBoxes = [
  {
    id: 'bronze',
    name: 'Bronze Box',
    priceInPi: 0.05,
    rewards: [
      '0.01 Pi',
      '0.02 Pi',
      'No Reward',
      '5 Pi Competition Ticket'
    ],
    chances: [0.4, 0.3, 0.2, 0.1],
    image: 'https://cdn.example.com/images/bronze-box.png',
    themeColor: '#cd7f32'
  },
  {
    id: 'silver',
    name: 'Silver Box',
    priceInPi: 0.15,
    rewards: [
      '0.05 Pi',
      '0.1 Pi',
      'No Reward',
      '15 Pi Competition Ticket',
      'Wireless Controller'
    ],
    chances: [0.3, 0.25, 0.2, 0.15, 0.1],
    image: 'https://cdn.example.com/images/silver-box.png',
    themeColor: '#c0c0c0'
  },
  {
    id: 'gold',
    name: 'Gold Box',
    priceInPi: 0.5,
    rewards: [
      '0.25 Pi',
      '0.5 Pi',
      'No Reward',
      '50 Pi Competition Ticket',
      'Apple AirPods',
      'Xbox Series S',
      'PlayStation 5'
    ],
    chances: [0.2, 0.15, 0.2, 0.2, 0.1, 0.1, 0.05],
    image: 'https://cdn.example.com/images/gold-box.png',
    themeColor: '#ffd700'
  }
];

export function selectReward(rewards, chances) {
  const rand = Math.random();
  let sum = 0;
  for (let i = 0; i < rewards.length; i++) {
    sum += chances[i];
    if (rand < sum) return rewards[i];
  }
  return rewards[rewards.length - 1];
}

export function openMysteryBox(boxId) {
  const box = mysteryBoxes.find(b => b.id === boxId);
  if (!box) throw new Error(`Box with id '${boxId}' not found.`);
  return {
    reward: selectReward(box.rewards, box.chances),
    image: box.image,
    themeColor: box.themeColor,
    name: box.name
  };
}
