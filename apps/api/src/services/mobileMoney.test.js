import test from 'node:test';
import assert from 'node:assert/strict';
import { initiateCollection, initiatePayout } from './mobileMoney.js';

test('initiateCollection returns a Pesapal checkout URL for provider Pesapal', async () => {
  const result = await initiateCollection({ provider: 'Pesapal', phone: '+254700000000', amount: 1250 });

  assert.equal(result.provider, 'Pesapal');
  assert.equal(result.status, 'prompted');
  assert.equal(result.gateway, 'Pesapal');
  assert.match(result.paymentUrl, /^https:\/\/demo\.pesapal\.com\/checkout\?/);
  assert.ok(result.reference.startsWith('CT-'));
});

test('initiatePayout returns initiated Pesapal payout metadata with approval transaction', async () => {
  const result = await initiatePayout({ provider: 'Pesapal', phone: '+254700000000', amount: 5000, approvalTxHash: '0xdeadbeef' });

  assert.equal(result.provider, 'Pesapal');
  assert.equal(result.status, 'initiated');
  assert.equal(result.gateway, 'Pesapal');
  assert.ok(result.message.includes('Await webhook confirmation'));
  assert.ok(result.reference.startsWith('WD-'));
});

test('initiatePayout throws when approvalTxHash is missing', async () => {
  await assert.rejects(async () => {
    await initiatePayout({ provider: 'Pesapal', phone: '+254700000000', amount: 5000 });
  }, {
    message: 'Treasury approval transaction is required'
  });
});
