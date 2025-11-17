/**
 * Script de teste para validar a API Key do Anthropic
 * Execute: node test-anthropic.js
 */

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function testAnthropicAPI() {
  console.log('🔍 Testando configuração do Anthropic...\n');
  
  // Verifica se a API key está configurada
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('📋 ANTHROPIC_API_KEY:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NÃO CONFIGURADA');
  console.log('📋 ANTHROPIC_MODEL:', process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022 (padrão)');
  console.log('📋 ANTHROPIC_MAX_TOKENS:', process.env.ANTHROPIC_MAX_TOKENS || '1024 (padrão)');
  console.log('');
  
  if (!apiKey) {
    console.error('❌ Erro: ANTHROPIC_API_KEY não está configurada no .env');
    process.exit(1);
  }
  
  if (apiKey.includes('your_') || apiKey.length < 20) {
    console.error('❌ Erro: ANTHROPIC_API_KEY parece ser um placeholder ou inválida');
    process.exit(1);
  }
  
  try {
    console.log('🚀 Enviando requisição de teste para Anthropic API...\n');
    
    const client = new Anthropic({ apiKey });
    
    // Tenta com diferentes formatos de modelo
    let modelToUse = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    console.log(`Tentando com modelo: ${modelToUse}`);
    
    try {
      const response = await client.messages.create({
        model: modelToUse,
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Responda apenas: "API funcionando!"'
        }]
      });
      
      const reply = response.content[0].text;
      
      console.log('✅ Sucesso! A API está funcionando corretamente.');
      console.log('📨 Resposta do Claude:', reply);
      console.log('');
      console.log(`✅ Modelo correto: ${modelToUse}`);
      return;
    } catch (err) {
      if (err.status === 404) {
        console.log(`❌ Modelo ${modelToUse} não encontrado. Tentando outros formatos...\n`);
        
        // Tenta formatos alternativos
        const alternatives = [
          'claude-3-5-sonnet-20241022',
          'claude-3-sonnet-20240229',
          'claude-3-opus-20240229',
          'claude-3-haiku-20240307'
        ];
        
        for (const altModel of alternatives) {
          try {
            console.log(`Tentando: ${altModel}...`);
            const response = await client.messages.create({
              model: altModel,
              max_tokens: 100,
              messages: [{
                role: 'user',
                content: 'Responda apenas: "API funcionando!"'
              }]
            });
            
            const reply = response.content[0].text;
            console.log(`✅ Funcionou com: ${altModel}`);
            console.log('📨 Resposta:', reply);
            console.log('');
            console.log(`💡 USAR ESTE MODELO NO .env: ANTHROPIC_MODEL=${altModel}`);
            return;
          } catch (altErr) {
            console.log(`   ❌ ${altModel}: ${altErr.message}`);
          }
        }
      }
      throw err;
    }
    
    const response = await client.messages.create({
      model: modelToUse,
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Responda apenas: "API funcionando!"'
      }]
    });
    
    const reply = response.content[0].text;
    
    console.log('✅ Sucesso! A API está funcionando corretamente.');
    console.log('📨 Resposta do Claude:', reply);
    console.log('');
    console.log('✅ Seu ANTHROPIC_API_KEY está válida e funcionando!');
    
  } catch (error) {
    console.error('❌ Erro ao chamar API do Anthropic:\n');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.status) {
      console.error('Status HTTP:', error.status);
    }
    
    if (error.error) {
      console.error('Detalhes:', JSON.stringify(error.error, null, 2));
    }
    
    console.log('\n💡 Possíveis causas:');
    console.log('   1. API Key inválida ou expirada');
    console.log('   2. Sem créditos na conta Anthropic');
    console.log('   3. Problema de conexão com a internet');
    console.log('   4. Região bloqueada pela Anthropic');
    
    process.exit(1);
  }
}

testAnthropicAPI();
