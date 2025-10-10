const fs = require('fs');
const path = require('path');

// Define base routes
const ADMIN_ROUTES = {
  pages: [
    '/admin',                                    // Dashboard
    '/admin/dashboard',                          // Main dashboard
    '/admin/users',                              // User management
    '/admin/competitions',                       // Competition management
    '/admin/competitions/create',                // Create competition
    '/admin/competitions/edit/[id]',             // Edit specific competition
    '/admin/edit-competition/[id]',              // Alternative edit route
    '/admin/forums',                             // Forum management
    '/admin/audit-logs',                         // Audit logs
    '/admin/try-your-luck',                      // Try your luck admin
  ],
  api: [
    '/api/admin/login',                          // Admin login
    '/api/admin/users',                          // User management API
    '/api/admin/competitions',                   // Competition management API
    '/api/admin/competitions/[id]',              // Specific competition API
    '/api/admin/competitions/[id]/delete',       // Delete competition
    '/api/admin/entries',                        // Entry management
    '/api/admin/payments',                       // Payment management
    '/api/admin/payout',                         // Payout management
    '/api/admin/forums',                         // Forum management API
    '/api/admin/forums/[id]',                    // Specific forum API
    '/api/admin/generate-picashcode',            // Generate Pi cash code
    '/api/admin/audit-export',                   // Export audit logs
    '/api/admin/try-your-luck',                  // Try your luck API
  ]
};

const FORUM_ROUTES = {
  pages: [
    '/forums',                                   // Main forums page
    '/forums/[slug]',                            // Dynamic forum pages
    '/forums/admin',                             // Admin forums
    '/forums/celebrate',                         // Celebration page
    '/forums/create',                            // Create forum thread
    '/forums/general',                           // General discussions
    '/forums/ideas',                             // Ideas forum
    '/forums/new-idea',                          // Submit new idea
    '/forums/pioneer-of-the-week',               // Pioneer of the week
    '/forums/pioneer-of-the-week/celebrate',     // Celebrate pioneer
    '/forums/pioneer-of-the-week/history',       // Pioneer history
    '/forums/replies',                           // Forum replies
    '/forums/reply',                             // Reply page
    '/forums/start-discussion',                  // Start discussion
    '/forums/submit',                            // Submit forum post
    '/forums/thread/[id]',                       // Specific thread
    '/forums/vote',                              // Voting page
    '/forums/winners',                           // Winners page
  ],
  api: [
    '/api/forums/create',                        // Create forum API
    '/api/forums/reply',                         // Reply API
    '/api/forums/upvote',                        // Upvote API
    '/api/forums/pioneer-nominations',           // Pioneer nominations
    '/api/forums/thread',                        // Thread management
    '/api/forums/thread/[id]',                   // Specific thread API
    '/api/forums/[type]/all',                    // Get all forums by type
  ]
};

async function checkRouteExists(routePath) {
  // Convert Next.js route to file path
  let filePath = routePath.replace(/^\//, '').replace(/\[(\w+)\]/g, '[id]');
  
  // Handle API routes
  if (filePath.startsWith('api/')) {
    const fullPath = path.join('src/pages', filePath + '.js');
    return fs.existsSync(fullPath);
  }
  
  // Handle page routes
  const fullPath = path.join('src/pages', filePath + '.js');
  const indexPath = path.join('src/pages', filePath, 'index.js');
  
  return fs.existsSync(fullPath) || fs.existsSync(indexPath);
}

async function checkFileContent(routePath) {
  try {
    // Convert route to file path
    let filePath = routePath.replace(/^\//, '').replace(/\[(\w+)\]/g, '[id]');
    
    if (filePath.startsWith('api/')) {
      const fullPath = path.join('src/pages', filePath + '.js');
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        return {
          exists: true,
          hasHandler: content.includes('export default'),
          hasAuth: content.includes('auth') || content.includes('Auth'),
          lineCount: content.split('\n').length
        };
      }
    } else {
      const fullPath = path.join('src/pages', filePath + '.js');
      const indexPath = path.join('src/pages', filePath, 'index.js');
      
      const actualPath = fs.existsSync(fullPath) ? fullPath : 
                        fs.existsSync(indexPath) ? indexPath : null;
      
      if (actualPath) {
        const content = fs.readFileSync(actualPath, 'utf8');
        return {
          exists: true,
          hasComponent: content.includes('export default'),
          hasAuth: content.includes('auth') || content.includes('Auth') || content.includes('admin'),
          lineCount: content.split('\n').length
        };
      }
    }
    
    return { exists: false };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function analyzeRoutes() {
  console.log('🔍 ADMIN & FORUM ROUTES ANALYSIS\n');
  
  // Analyze Admin Routes
  console.log('🔐 ADMIN ROUTES:\n');
  
  console.log('📄 Admin Pages:');
  for (const route of ADMIN_ROUTES.pages) {
    const analysis = await checkFileContent(route);
    const status = analysis.exists ? '✅' : '❌';
    const auth = analysis.hasAuth ? '🔒' : '🔓';
    const lines = analysis.lineCount || 0;
    
    console.log(`  ${status} ${auth} ${route.padEnd(35)} (${lines} lines)`);
  }
  
  console.log('\n🔌 Admin API Endpoints:');
  for (const route of ADMIN_ROUTES.api) {
    const analysis = await checkFileContent(route);
    const status = analysis.exists ? '✅' : '❌';
    const auth = analysis.hasAuth ? '🔒' : '🔓';
    const lines = analysis.lineCount || 0;
    
    console.log(`  ${status} ${auth} ${route.padEnd(35)} (${lines} lines)`);
  }
  
  // Analyze Forum Routes
  console.log('\n💬 FORUM ROUTES:\n');
  
  console.log('📄 Forum Pages:');
  for (const route of FORUM_ROUTES.pages) {
    const analysis = await checkFileContent(route);
    const status = analysis.exists ? '✅' : '❌';
    const auth = analysis.hasAuth ? '🔒' : '🔓';
    const lines = analysis.lineCount || 0;
    
    console.log(`  ${status} ${auth} ${route.padEnd(35)} (${lines} lines)`);
  }
  
  console.log('\n🔌 Forum API Endpoints:');
  for (const route of FORUM_ROUTES.api) {
    const analysis = await checkFileContent(route);
    const status = analysis.exists ? '✅' : '❌';
    const auth = analysis.hasAuth ? '🔒' : '🔓';
    const lines = analysis.lineCount || 0;
    
    console.log(`  ${status} ${auth} ${route.padEnd(35)} (${lines} lines)`);
  }
  
  // Summary
  const adminPageCount = ADMIN_ROUTES.pages.filter(async route => {
    const analysis = await checkFileContent(route);
    return analysis.exists;
  }).length;
  
  const adminApiCount = ADMIN_ROUTES.api.filter(async route => {
    const analysis = await checkFileContent(route);
    return analysis.exists;
  }).length;
  
  const forumPageCount = FORUM_ROUTES.pages.filter(async route => {
    const analysis = await checkFileContent(route);
    return analysis.exists;
  }).length;
  
  const forumApiCount = FORUM_ROUTES.api.filter(async route => {
    const analysis = await checkFileContent(route);
    return analysis.exists;
  }).length;
  
  console.log('\n📊 SUMMARY:');
  console.log(`Admin Pages: ${ADMIN_ROUTES.pages.length} routes defined`);
  console.log(`Admin APIs: ${ADMIN_ROUTES.api.length} routes defined`);
  console.log(`Forum Pages: ${FORUM_ROUTES.pages.length} routes defined`);
  console.log(`Forum APIs: ${FORUM_ROUTES.api.length} routes defined`);
  
  console.log('\n🔑 LEGEND:');
  console.log('✅ = Route exists    ❌ = Route missing');
  console.log('🔒 = Has auth/admin  🔓 = No auth detected');
  console.log('[id] = Dynamic route parameter');
}

analyzeRoutes(); 