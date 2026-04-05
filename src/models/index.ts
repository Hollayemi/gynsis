// Export all models
export { UserModel } from './User.model';
export { GovernmentModel } from './Government.model';
export { LGAModel } from './LGA.model';
export { UnionModel } from './Union.model';
export { RiderModel } from './Rider.model';
export { SellerModel } from './Seller.model';
export { TicketTransactionModel } from './TicketTransaction.model';
export { TransferRequestModel } from './TransferRequest.model';
export { RevenueRemittanceModel } from './RevenueRemittance.model';

// Export all types
export * from './types';

// Database connection helper
import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
  process.exit(0);
});