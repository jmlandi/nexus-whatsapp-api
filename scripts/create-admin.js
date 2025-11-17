// Script para criar o primeiro usuário admin
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verifica se já existe algum usuário
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
      console.log('✅ Já existem usuários cadastrados');
      process.exit(0);
    }

    // Cria o usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@nexus.com',
        password: hashedPassword,
        name: 'Administrador',
        isActive: true
      }
    });

    console.log('✨ Usuário admin criado com sucesso!');
    console.log('');
    console.log('📧 Email: admin@nexus.com');
    console.log('🔑 Senha: admin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    process.exit(1);
  }
}

createAdminUser();
