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

// --- API Endpoints ---

// Roles
app.get('/api/roles', async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/roles', async (req, res) => {
    try {
        const newRole = await Role.create(req.body);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/roles/:id', async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (role) {
            await role.update(req.body);
            res.json(role);
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    try {
        const deleted = await Role.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Role not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({ include: Role });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        const userWithRole = await User.findByPk(newUser.id, { include: Role });
        res.status(201).json(userWithRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.update(req.body);
            const userWithRole = await User.findByPk(user.id, { include: Role });
            res.json(userWithRole);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Company Settings
app.get('/api/company-settings', async (req, res) => {
    try {
        let settings = await CompanySetting.findOne();
        if (!settings) settings = await CompanySetting.create({});
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

// --- Quotations ---

// Bulk delete route (Crucial: Define before generic /:id routes)
app.post('/api/quotations/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'IDs array is required' });
        }
        await Quotation.destroy({ where: { id: ids } });
        res.status(204).send();
    } catch (error) {
        console.error('Bulk Delete Error:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/quotations', async (req, res) => {
    try {
        const quotations = await Quotation.findAll();
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/quotations/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findByPk(req.params.id);
        if (quotation) res.json(quotation);
        else res.status(404).json({ message: 'Quotation not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    try {
        let { clientName, clientAddress, totalValue, discount, tax, currency, items, dateCreated } = req.body;
        if (!clientName || totalValue === undefined) return res.status(400).json({ message: 'clientName and totalValue are required.' });
        
        const quotations = await Quotation.findAll({ attributes: ['id'] });
        let nextIdNum = quotations.length + 1;
        let id = `Q-${String(nextIdNum).padStart(3, '0')}`;
        while (quotations.some(q => q.id === id)) {
            nextIdNum++;
            id = `Q-${String(nextIdNum).padStart(3, '0')}`;
        }

        let itemsStr = "[]";
        if (items) itemsStr = typeof items === 'string' ? items : JSON.stringify(items);
        
        const newQuotation = await Quotation.create({
            id, clientName: String(clientName), clientAddress: clientAddress || null,
            totalValue: parseFloat(totalValue) || 0,
            discount: parseFloat(discount) || 0,
            tax: parseFloat(tax) || 0,
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

app.delete('/api/quotations/:id', async (req, res) => {
    try {
        const deleted = await Quotation.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Quotation not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Clients ---
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const newClient = await Client.create(req.body);
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Invoices ---
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.findAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/invoices', async (req, res) => {
    try {
        const count = await Invoice.count();
        const id = `INV-${String(count + 1).padStart(3, '0')}`;
        const newInvoice = await Invoice.create({ ...req.body, id, status: req.body.status || 'Pending' });
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- Templates ---
app.get('/api/quotation-templates', async (req, res) => {
    try {
        const templates = await QuotationTemplate.findAll();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/quotation-templates', async (req, res) => {
    try {
        const newTemplate = await QuotationTemplate.create(req.body);
        try {
            const content = JSON.parse(req.body.content);
            const count = await Quotation.count();
            const id = `Q-${String(count + 1).padStart(3, '0')}`;
            await Quotation.create({
                id, clientName: content.clientName || 'New Client',
                clientAddress: content.clientAddress || null,
                totalValue: content.total || 0, currency: 'INR',
                items: JSON.stringify(content.items || []),
                dateCreated: content.quoteDate || new Date().toISOString().split('T')[0],
                status: 'Draft'
            });
        } catch (innerError) { console.error('Error auto-creating quotation:', innerError); }
        res.status(201).json(newTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- Seed Data & Start Server ---
const seedData = async () => {
    const rolesCount = await Role.count();
    if (rolesCount === 0) {
        await Role.bulkCreate([
            { name: 'Administrator', description: 'Full access to all system features.', permissions: ['all'] },
            { name: 'Sales Manager', description: 'Can manage sales team and approve quotations.', permissions: ['sales', 'approve'] },
            { name: 'Sales Rep', description: 'Can create and manage their own quotations.', permissions: ['sales'] }
        ]);
    }
};

sequelize.sync({ alter: true }).then(async () => {
    await seedData();
    app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
}).catch(err => { console.error('Unable to connect to the database:', err); });
