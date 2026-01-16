import mongoose from 'mongoose';
import './src/models/User';  // Import models to register them

async function createTestUser() {
    await mongoose.connect('mongodb://127.0.0.1:27017/splitease');

    const testUser = {
        username: 'testboss',
        email: 'boss@splitease.com',
        password: 'fuckyeah123',
    };

    // This line is what creates the DB and collection
    const User = mongoose.model('User');
    const user = await User.create(testUser);

    console.log('User created:', user);
    console.log('splitease database now exists – refresh Compass!');

    await mongoose.disconnect();
}

createTestUser().catch(console.error);