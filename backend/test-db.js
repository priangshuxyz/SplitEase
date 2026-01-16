"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("./src/models/User");
async function createTestUser() {
    await mongoose_1.default.connect('mongodb://127.0.0.1:27017/splitease');
    const testUser = {
        username: 'testboss',
        email: 'boss@splitease.com',
        password: 'fuckyeah123',
    };
    const User = mongoose_1.default.model('User');
    const user = await User.create(testUser);
    console.log('User created:', user);
    console.log('splitease database now exists – refresh Compass!');
    await mongoose_1.default.disconnect();
}
createTestUser().catch(console.error);
//# sourceMappingURL=test-db.js.map