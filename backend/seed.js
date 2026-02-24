const sequelize = require('./database');
const fs = require('fs');
const path = require('path');

const Client = require('./models/Client');
const Quotation = require('./models/Quotation');
const Invoice = require('./models/Invoice');
const Report = require('./models/Report');
const Lead = require('./models/Lead');
const Opportunity = require('./models/Opportunity');
const Followup = require('./models/Followup');

const seed = async () => {
    try {
        await sequelize.sync({ force: true }); // DANGER: This will drop tables if they exist
        console.log('Database synced.');

        const dbPath = path.join(__dirname, 'db.json');
        if (!fs.existsSync(dbPath)) {
            console.log('db.json not found, skipping seeding.');
            return;
        }

        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        if (data.clients) await Client.bulkCreate(data.clients);
        if (data.quotations) await Quotation.bulkCreate(data.quotations);
        if (data.invoices) await Invoice.bulkCreate(data.invoices);
        if (data.reports) await Report.bulkCreate(data.reports);
        if (data.leads) await Lead.bulkCreate(data.leads);
        if (data.opportunities) await Opportunity.bulkCreate(data.opportunities);
        if (data.followups) await Followup.bulkCreate(data.followups);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
