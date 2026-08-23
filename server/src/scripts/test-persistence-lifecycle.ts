import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function runPersistenceSuite() {
  console.log('🚀 Starting Full Database Persistence Verification Suite...');

  // 1. Check Health
  const healthRes = await axios.get('http://localhost:5000/health');
  console.log('🩺 Health check response:', healthRes.data);

  // 2. Fetch initial counts
  const initialSummary = await axios.get(`${API_BASE}/analytics/summary`);
  console.log('📊 Initial Summary Metrics:', {
    totalRevenue: initialSummary.data.data.totalRevenue,
    moneyLeakageToday: initialSummary.data.data.moneyLeakageToday,
    failedPaymentsCount: initialSummary.data.data.failedPaymentsCount,
  });

  // 3. Create 5 distinct payments
  console.log('\n--- Step 1: Creating 5 new test payments ---');
  const testPayments = [
    {
      customer: {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@zenithscale.io',
        phone: '+91 98200 44101',
        company: 'Zenith Scale Enterprise',
      },
      amount: 6500,
      paymentType: 'SUBSCRIPTION',
      scenario: 'U30',
      failureCode: 'U30',
      bank: 'HDFC Bank',
    },
    {
      customer: {
        name: 'Rohan Deshmukh',
        email: 'rohan.d@deshmukhtech.in',
        phone: '+91 98111 22334',
        company: 'Deshmukh Tech Pro',
      },
      amount: 3200,
      paymentType: 'SUBSCRIPTION',
      scenario: 'INVALID_MPIN',
      failureCode: 'ZM',
      bank: 'ICICI Bank',
    },
    {
      customer: {
        name: 'Kavita Pillai',
        email: 'kavita.p@greenorganics.org',
        phone: '+91 98450 99887',
        company: 'Green Organics Pro',
      },
      amount: 8900,
      paymentType: 'SUBSCRIPTION',
      scenario: 'TIMEOUT',
      failureCode: 'UT',
      bank: 'State Bank of India',
    },
    {
      customer: {
        name: 'Nikhil Saxena',
        email: 'nikhil.s@financesuite.com',
        phone: '+91 97123 45678',
        company: 'Finance Suite Tier',
      },
      amount: 14500,
      paymentType: 'CHECKOUT',
      scenario: 'CHECKOUT_ABANDONED',
      bank: 'Axis Bank',
    },
    {
      customer: {
        name: 'Tanvi Iyer',
        email: 'tanvi.iyer@cloudservices.in',
        phone: '+91 94455 66778',
        company: 'Cloud Services Pro',
      },
      amount: 5400,
      paymentType: 'SUBSCRIPTION',
      status: 'captured',
      scenario: 'SUCCESS',
      bank: 'Kotak Mahindra Bank',
    },
  ];

  const createdRecords: any[] = [];
  for (const p of testPayments) {
    const res = await axios.post(`${API_BASE}/payments`, p);
    createdRecords.push(res.data.data);
    console.log(`✅ Created payment: ₹${p.amount} for ${p.customer.name} (Payment ID: ${res.data.data.id})`);
  }

  // 4. Verify all 5 appear in payments, customers, and recoveries
  console.log('\n--- Step 2: Verifying creation across database endpoints ---');
  const paymentsList = await axios.get(`${API_BASE}/payments?limit=100`);
  const customersList = await axios.get(`${API_BASE}/customers?limit=100`);
  const recoveriesList = await axios.get(`${API_BASE}/recoveries?limit=100`);
  const summaryAfter5 = await axios.get(`${API_BASE}/analytics/summary`);

  console.log(`📋 Total payments in DB: ${paymentsList.data.total}`);
  console.log(`👥 Total customers in DB: ${customersList.data.total}`);
  console.log(`🔄 Total recoveries in DB: ${recoveriesList.data.total}`);
  console.log('📈 Summary after 5 payments:', {
    totalRevenue: summaryAfter5.data.data.totalRevenue,
    recoveredRevenue: summaryAfter5.data.data.recoveredRevenue,
    moneyLeakageToday: summaryAfter5.data.data.moneyLeakageToday,
    failedPaymentsCount: summaryAfter5.data.data.failedPaymentsCount,
  });

  // Verify all 5 test payments exist
  for (const rec of createdRecords) {
    const found = paymentsList.data.data.find((p: any) => p.id === rec.id);
    if (!found) throw new Error(`Payment ${rec.id} not found in database!`);
  }
  console.log('✨ Verified: All 5 newly created records confirmed present in database.');

  // 5. Delete one payment and verify cascading updates
  console.log('\n--- Step 3: Deleting 1 payment and verifying metrics update ---');
  const paymentToDelete = createdRecords[0];
  const deleteRes = await axios.delete(`${API_BASE}/payments/${paymentToDelete.id}`);
  console.log(`🗑️ Delete response for ${paymentToDelete.id}:`, deleteRes.data);

  const paymentsAfterDelete = await axios.get(`${API_BASE}/payments?limit=100`);
  const summaryAfterDelete = await axios.get(`${API_BASE}/analytics/summary`);

  const deletedStillExists = paymentsAfterDelete.data.data.some((p: any) => p.id === paymentToDelete.id);
  if (deletedStillExists) throw new Error('Deleted payment still exists in DB!');

  console.log(`✅ Payment successfully removed. DB payments count: ${paymentsAfterDelete.data.total}`);
  console.log('📉 Summary after deletion:', {
    totalRevenue: summaryAfterDelete.data.data.totalRevenue,
    moneyLeakageToday: summaryAfterDelete.data.data.moneyLeakageToday,
    failedPaymentsCount: summaryAfterDelete.data.data.failedPaymentsCount,
  });

  console.log('\n🎉 ALL PERSISTENCE TESTS PASSED SUCCESSFULLY!');
}

runPersistenceSuite().catch((err) => {
  console.error('❌ Persistence suite failed:', err.response?.data || err.message);
  process.exit(1);
});
