const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_DB_URL;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_DB_URL in environment');
  process.exit(1);
}

// AuditLog schema (inline for this script)
const auditLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

const sampleAuditLogs = [
  {
    user: 'admin@ohmycompetitions.com',
    action: 'admin_login',
    details: 'Admin user logged into dashboard',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    user: 'admin@ohmycompetitions.com',
    action: 'competition_created',
    details: 'Created new competition: penthouse-stay',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    user: 'abdulaharshad',
    action: 'user_registration',
    details: 'New user registered via Pi Network',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    user: 'admin@ohmycompetitions.com',
    action: 'payment_approved',
    details: 'Approved payment for ps5-bundle-giveaway',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  },
  {
    user: 'system',
    action: 'system_maintenance',
    details: 'Database backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
  },
  {
    user: 'admin@ohmycompetitions.com',
    action: 'competition_updated',
    details: 'Updated competition settings for xbox-one-bundle',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  },
  {
    user: 'testuser123',
    action: 'ticket_purchased',
    details: 'Purchased 2 tickets for nintendo-switch',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
  },
  {
    user: 'admin@ohmycompetitions.com',
    action: 'user_management',
    details: 'Updated user role for testuser123',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
];

async function seedAuditLogs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing audit logs
    console.log('🗑️ Clearing existing audit logs...');
    await AuditLog.deleteMany({});
    console.log('✅ Cleared existing audit logs');

    // Insert sample audit logs
    console.log('🔄 Inserting sample audit logs...');
    const result = await AuditLog.insertMany(sampleAuditLogs);
    console.log(`✅ Inserted ${result.length} audit logs`);

    // Display the created logs
    console.log('\n📋 Sample Audit Logs Created:');
    result.forEach((log, index) => {
      console.log(`${index + 1}. ${log.user} - ${log.action} - ${log.details}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding audit logs:', err);
    process.exit(1);
  }
}

seedAuditLogs(); 