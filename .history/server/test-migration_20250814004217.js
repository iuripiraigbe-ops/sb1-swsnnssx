#!/usr/bin/env node

/**
 * Script de teste para verificar a migração para Neon + Upstash
 * Execute: node test-migration.js
 */

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

console.log('🧪 Testando migração para Neon + Upstash...\n');

// Test 1: Verificar se as variáveis de ambiente estão configuradas
console.log('1️⃣ Verificando variáveis de ambiente...');
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

let missingVars = [];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.log(`❌ Variáveis ausentes: ${missingVars.join(', ')}`);
  console.log('   Configure as variáveis de ambiente primeiro!');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis de ambiente estão configuradas');
}

// Test 2: Verificar se o REDIS_URL está no formato correto
console.log('\n2️⃣ Verificando formato do REDIS_URL...');
const redisUrl = process.env.REDIS_URL;
if (!redisUrl.startsWith('rediss://')) {
  console.log('❌ REDIS_URL deve começar com "rediss://" para Upstash');
  console.log('   Formato esperado: rediss://:SENHA@HOST:PORTA');
  process.exit(1);
} else {
  console.log('✅ REDIS_URL está no formato correto para Upstash');
}

// Test 3: Verificar se o DATABASE_URL está no formato correto
console.log('\n3️⃣ Verificando formato do DATABASE_URL...');
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.includes('neon.tech')) {
  console.log('⚠️  DATABASE_URL não parece ser do Neon');
  console.log('   Verifique se está usando a URL correta do Neon');
} else {
  console.log('✅ DATABASE_URL parece ser do Neon');
}

// Test 4: Verificar se FFmpeg está instalado
console.log('\n4️⃣ Verificando se FFmpeg está instalado...');
const ffmpegCheck = spawn('ffmpeg', ['-version']);
ffmpegCheck.on('close', (code) => {
  if (code === 0) {
    console.log('✅ FFmpeg está instalado');
  } else {
    console.log('❌ FFmpeg não está instalado');
    console.log('   Instale o FFmpeg para transcodificação de vídeos');
  }
});

// Test 5: Verificar se o Prisma está configurado
console.log('\n5️⃣ Verificando configuração do Prisma...');
try {
  const schemaPath = './prisma/schema.prisma';
  const schema = readFileSync(schemaPath, 'utf8');
  
  if (schema.includes('provider = "postgresql"') && schema.includes('url = env("DATABASE_URL")')) {
    console.log('✅ Schema do Prisma está configurado corretamente');
  } else {
    console.log('❌ Schema do Prisma não está configurado corretamente');
  }
} catch (error) {
  console.log('❌ Erro ao ler schema do Prisma:', error.message);
}

// Test 6: Verificar se os clientes singleton existem
console.log('\n6️⃣ Verificando clientes singleton...');
const files = [
  './src/lib/db.ts',
  './src/lib/redis.ts'
];

for (const file of files) {
  try {
    readFileSync(file, 'utf8');
    console.log(`✅ ${file} existe`);
  } catch (error) {
    console.log(`❌ ${file} não existe`);
  }
}

console.log('\n🎉 Teste de migração concluído!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no seu PaaS');
console.log('2. Execute: npx prisma migrate deploy');
console.log('3. Execute: npx prisma generate');
console.log('4. Teste o healthcheck: GET /health');
console.log('5. Teste registro/login');
console.log('6. Teste upload de vídeo ≤90s');
