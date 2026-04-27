const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./database');

// Import Models
const Client = require('./models/Client');
const Quotation = require('./models/Quotation');
const Invoice = require('./models/Invoice');
const Report = require('./models/Report');
const Lead = require('./models/Lead');
const LeadInteraction = require('./models/LeadInteraction');
const LeadColumn = require('./models/LeadColumn');
const Followup = require('./models/Followup');
const Role = require('./models/Role');
const User = require('./models/User');
const CompanySetting = require('./models/CompanySetting');
const Opportunity = require('./models/Opportunity');
const Task = require('./models/Task');
const QuotationTemplate = require('./models/QuotationTemplate');
const Payment = require('./models/Payment');
const AutomationRule = require('./models/AutomationRule');

// Relationships
Lead.hasMany(LeadInteraction, { as: 'interactions', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadInteraction.belongsTo(Lead, { foreignKey: 'leadId' });

Invoice.hasMany(Payment, { foreignKey: 'invoiceId', onDelete: 'CASCADE' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ROBUST API Endpoints ---

// Roles
app.get('/api/roles', async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({ include: Role });
        res.json(users || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Company Settings (Always returns data)
app.get('/api/company-settings', async (req, res) => {
    try {
        let settings = await CompanySetting.findOne();
        if (!settings) {
            settings = await CompanySetting.create({
                companyName: 'Mindmanthan Software Solutions',
                companyAddress: 'A90, A BLOCK, SECTOR 4, NOIDA, UTTAR PRADESH 201301',
                timezone: 'IST',
                currencySymbol: 'INR'
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/company-settings', async (req, res) => {
    try {
        let settings = await CompanySetting.findOne();
        if (settings) {
            await settings.update(req.body);
            res.json(settings);
        } else {
            const newSettings = await CompanySetting.create(req.body);
            res.json(newSettings);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Quotations
app.get('/api/quotations', async (req, res) => {
    try {
        const quotations = await Quotation.findAll();
        res.json(quotations || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    try {
        let { clientName, clientAddress, totalValue, discount, discountRate, tax, taxRate, currency, items, dateCreated } = req.body;
        if (!clientName) return res.status(400).json({ message: 'clientName is required.' });
        
        const quotations = await Quotation.findAll({ attributes: ['id'] });
        let nextIdNum = quotations.length + 1;
        let id = `Q-${String(nextIdNum).padStart(3, '0')}`;
        
        let itemsStr = "[]";
        if (items) itemsStr = typeof items === 'string' ? items : JSON.stringify(items);
        
        const newQuotation = await Quotation.create({
            id, clientName, clientAddress: clientAddress || null,
            totalValue: parseFloat(totalValue) || 0,
            discount: parseFloat(discount) || 0,
            discountRate: parseFloat(discountRate) || 0,
            tax: parseFloat(tax) || 0,
            taxRate: parseFloat(taxRate) || 0,
            currency: currency || 'INR',
            items: itemsStr, dateCreated: dateCreated || new Date().toISOString().split('T')[0], status: 'Pending'
        });
        res.status(201).json(newQuotation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/quotations/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findByPk(req.params.id);
        if (quotation) {
            await quotation.update(req.body);
            res.json(quotation);
        } else res.status(404).json({ message: 'Quotation not found' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Clients
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Templates
app.get('/api/quotation-templates', async (req, res) => {
    try {
        const templates = await QuotationTemplate.findAll();
        res.json(templates || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Seed Data Logic ---
const seedInitialData = async () => {
    try {
        // Check if Admin Role exists
        const rolesCount = await Role.count();
        if (rolesCount === 0) {
            await Role.bulkCreate([
                { name: 'Administrator', description: 'Full access', permissions: ['all'] },
                { name: 'Sales Manager', description: 'Manager access', permissions: ['sales'] }
            ]);
        }
        
        // Check if Admin User exists
        const usersCount = await User.count();
        if (usersCount === 0) {
            const adminRole = await Role.findOne({ where: { name: 'Administrator' } });
            if (adminRole) {
                await User.create({
                    name: 'System Admin',
                    email: 'admin@example.com',
                    password: 'password123',
                    roleId: adminRole.id,
                    status: 'Active'
                });
            }
        }
        
        // Check if Company Settings exist
        const settingsCount = await CompanySetting.count();
        if (settingsCount === 0) {
            await CompanySetting.create({
                companyName: 'Mindmanthan Software Solutions',
                companyAddress: 'A90, A BLOCK, SECTOR 4, NOIDA, UTTAR PRADESH 201301',
                timezone: 'IST',
                currencySymbol: 'INR'
            });
        }
    } catch (err) {
        console.error('Seeding Error:', err);
    }
};

// --- Server Start ---
sequelize.sync({ alter: true }).then(async () => {
    await seedInitialData();
    app.listen(PORT, () => {
        console.log(`SERVER FIXED: Running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('FATAL DB ERROR:', err);
});
