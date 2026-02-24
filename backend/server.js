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
const Opportunity = require('./models/Opportunity');
const Followup = require('./models/Followup');
const QuotationTemplate = require('./models/QuotationTemplate');
const Role = require('./models/Role');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
        // Re-fetch to include the Role
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

// Seed Data
const seedData = async () => {
    const rolesCount = await Role.count();
    if (rolesCount === 0) {
        await Role.bulkCreate([
            { name: 'Administrator', description: 'Full access to all system features.', permissions: ['all'] },
            { name: 'Sales Manager', description: 'Can manage sales team and approve quotations.', permissions: ['sales', 'approve'] },
            { name: 'Sales Rep', description: 'Can create and manage their own quotations.', permissions: ['sales'] }
        ]);
        console.log('Roles seeded.');
    }

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
            console.log('Admin user seeded.');
        }
    }
};

// --- Server Start ---
sequelize.sync().then(async () => {
    await seedData();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Quotations
app.get('/api/quotations', async (req, res) => {
    try {
        const quotations = await Quotation.findAll();
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    try {
        const { clientName, totalValue, currency, items } = req.body;
        const count = await Quotation.count();
        const id = `Q-${String(count + 1).padStart(3, '0')}`;
        const newQuotation = await Quotation.create({
            id,
            clientName,
            totalValue,
            currency,
            items,
            status: 'Pending'
        });
        res.status(201).json(newQuotation);
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

app.patch('/api/quotations/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const quotation = await Quotation.findByPk(req.params.id);
        if (quotation) {
            quotation.status = status;
            await quotation.save();
            res.json(quotation);
        } else {
            res.status(404).json({ message: 'Quotation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Clients
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
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        const deleted = await Client.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Client not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Invoices
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
        const newInvoice = await Invoice.create({
            ...req.body,
            id,
            status: req.body.status || 'Pending'
        });
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/invoices/:id/status', async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (invoice) {
            invoice.status = req.body.status;
            await invoice.save();
            res.json(invoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/invoices/:id', async (req, res) => {
    try {
        const deleted = await Invoice.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Invoice not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.findAll();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const id = `REP-${Date.now()}`;
        const newReport = await Report.create({
            ...req.body,
            id,
            lastGenerated: new Date().toISOString().split('T')[0]
        });
        res.status(201).json(newReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    try {
        const deleted = await Report.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Report not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.findAll();
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/leads', async (req, res) => {
    try {
        const newLead = await Lead.create(req.body);
        res.status(201).json(newLead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/leads/:id', async (req, res) => {
    try {
        const deleted = await Lead.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Lead not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Opportunities
app.get('/api/opportunities', async (req, res) => {
    try {
        const opportunities = await Opportunity.findAll();
        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/opportunities', async (req, res) => {
    try {
        const newOpportunity = await Opportunity.create(req.body);
        res.status(201).json(newOpportunity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/opportunities/:id', async (req, res) => {
    try {
        const deleted = await Opportunity.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Opportunity not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Followups
app.get('/api/followups', async (req, res) => {
    try {
        const followups = await Followup.findAll();
        res.json(followups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/followups', async (req, res) => {
    try {
        const newFollowup = await Followup.create(req.body);
        res.status(201).json(newFollowup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/followups/:id', async (req, res) => {
    try {
        const deleted = await Followup.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Followup not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Quotation Templates
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
        res.status(201).json(newTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/quotation-templates/:id', async (req, res) => {
    try {
        const template = await QuotationTemplate.findByPk(req.params.id);
        if (template) {
            await template.update(req.body);
            res.json(template);
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/quotation-templates/:id', async (req, res) => {
    try {
        const deleted = await QuotationTemplate.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Template not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Server Start ---
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
