const mongoose = require('mongoose');
const { Customer, User } = require('./model');

mongoose.connect('mongodb://127.0.0.1:27017/gms_db').then(async () => {
    console.log('Connected to DB');
    
    const toPascalCase = (v) => {
      if (!v) return v;
      return v.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
    };

    const customers = await Customer.find({});
    for (let c of customers) {
        await Customer.updateOne({ _id: c._id }, { $set: { name: toPascalCase(c.name) } });
    }
    
    const users = await User.find({});
    for (let u of users) {
        await User.updateOne({ _id: u._id }, { $set: { f_name: toPascalCase(u.f_name), l_name: toPascalCase(u.l_name) } });
    }
    
    console.log('Finished formatting names');
    process.exit(0);
}).catch(console.error);
