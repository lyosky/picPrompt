const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // 读取 SQL 文件
    const sqlDir = path.join(__dirname, 'supabase', 'migrations');
    const files = fs.readdirSync(sqlDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
        
        // 这里我们不能直接用 supabase-js 执行 DDL
        // 只能提示用户手动执行，或者尝试使用 pg 库连接（如果支持直连）
        // 但通常 Supabase API 不允许直接执行 CREATE TABLE 等 DDL
        // 除非使用 SQL Editor 或 CLI
        
        console.log('Warning: Cannot execute DDL via supabase-js client directly.');
        console.log('Please copy the content of ' + file + ' and run it in Supabase SQL Editor:');
        console.log('----------------------------------------');
        console.log(sql);
        console.log('----------------------------------------');
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
