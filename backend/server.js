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

// Ensure other relationships are managed if they aren't in the model files
// User and Role relationships are already in User.js, but let's re-verify if needed.

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
        console.error('Error in PATCH /api/users/:id:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
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

    const columnsCount = await LeadColumn.count();
    if (columnsCount === 0) {
        await LeadColumn.bulkCreate([
            { name: 'Source', key: 'source', type: 'text' },
            { name: 'Status', key: 'status', type: 'text' }
        ]);
        console.log('Lead columns seeded.');
    }
};

// Company Settings
app.get('/api/company-settings', async (req, res) => {
    try {
        let settings = await CompanySetting.findOne();
        if (!settings) {
            settings = await CompanySetting.create({});
        }
        res.json(settings);
    } catch (error) {
        console.error('Error in GET /api/company-settings:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
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
        console.error('Error in PATCH /api/company-settings:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
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

app.get('/api/quotations/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findByPk(req.params.id);
        if (quotation) {
            res.json(quotation);
        } else {
            res.status(404).json({ message: 'Quotation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    try {
        console.log('Received Quotation Payload:', req.body);
        const { clientName, totalValue, currency, items, dateCreated } = req.body;
        
        if (!clientName || totalValue === undefined) {
            return res.status(400).json({ message: 'clientName and totalValue are required.' });
        }

        const count = await Quotation.count();
        const id = `Q-${String(count + 1).padStart(3, '0')}`;
        const newQuotation = await Quotation.create({
            id,
            clientName,
            totalValue,
            currency,
            items,
            dateCreated: dateCreated || new Date().toISOString().split('T')[0],
            status: 'Pending'
        });
        console.log('Quotation created successfully:', newQuotation.id);
        res.status(201).json(newQuotation);
    } catch (error) {
        console.error('Error creating quotation:', error);
        res.status(400).json({ 
            message: error.message,
            stack: error.stack,
            errors: error.errors // Sequelize validation errors
        });
    }
});

app.patch('/api/quotations/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findByPk(req.params.id);
        if (quotation) {
            await quotation.update(req.body);
            res.json(quotation);
        } else {
            res.status(404).json({ message: 'Quotation not found' });
        }
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
        console.error('Error in POST /api/clients:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
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

// Leads Bulk Sync
app.post('/api/leads/bulk-sync', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { leads } = req.body;
        const results = [];

        for (const leadData of leads) {
            let lead;
            const { interactions, isNew, id, ...data } = leadData;

            // Sanitize all main lead fields
            const fieldsToSanitize = [
              'dateToConnect', 'followupDate', 'meetingDate', 
              'dealValue', 'clientName', 'company', 
              'roleProjectType', 'contactLink', 'notes'
            ];
            
            fieldsToSanitize.forEach(f => {
                if (data[f] === '') data[f] = null;
            });

            if (isNew || !id) {
                lead = await Lead.create(data, { transaction });
            } else {
                lead = await Lead.findByPk(id);
                if (lead) await lead.update(data, { transaction });
            }

            if (lead && interactions) {
                for (const intData of interactions) {
                    // Only save interactions that have at least a summary or a date
                    if (!intData.summary && !intData.date) continue;
                    
                    const { isNewInteraction, id: intId, ...iData } = intData;
                    iData.leadId = lead.id;

                    // Sanitize all interaction fields
                    const intFieldsToSanitize = ['date', 'followupDate', 'meetingDate', 'dealValue', 'summary', 'status'];
                    intFieldsToSanitize.forEach(f => {
                        if (iData[f] === '') iData[f] = null;
                    });

                    if (isNewInteraction || !intId) {
                        await LeadInteraction.create(iData, { transaction });
                    } else {
                        const interaction = await LeadInteraction.findByPk(intId);
                        if (interaction) await interaction.update(iData, { transaction });
                    }
                }
            }
            results.push(lead);
        }

        await transaction.commit();
        res.json({ message: 'Bulk sync successful', count: results.length });
    } catch (error) {
        await transaction.rollback();
        console.error('Bulk sync error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Lead Interactions
app.post('/api/lead-interactions', async (req, res) => {
    try {
        const interaction = await LeadInteraction.create(req.body);
        res.status(201).json(interaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/lead-interactions/:id', async (req, res) => {
    try {
        const interaction = await LeadInteraction.findByPk(req.params.id);
        if (interaction) {
            await interaction.update(req.body);
            res.json(interaction);
        } else {
            res.status(404).json({ message: 'Interaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/lead-interactions/:id', async (req, res) => {
    try {
        const deleted = await LeadInteraction.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Interaction not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.findAll({
            include: [{ model: LeadInteraction, as: 'interactions' }]
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/leads', async (req, res) => {
    try {
        console.log('Creating lead:', req.body);
        const newLead = await Lead.create(req.body);
        res.status(201).json(newLead);
    } catch (error) {
        console.error('Error in POST /api/leads:', error);
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/leads/:id', async (req, res) => {
    try {
        const deleted = await Lead.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Lead not found' });
    } catch (error) {
        console.error('Error in DELETE /api/leads:', error);
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id);
        if (lead) {
            await lead.update(req.body);
            res.json(lead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        console.error('Error in PATCH /api/leads:', error);
        res.status(500).json({ message: error.message });
    }
});

// Lead Columns
app.get('/api/lead-columns', async (req, res) => {
    try {
        const columns = await LeadColumn.findAll();
        res.json(columns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/lead-columns', async (req, res) => {
    try {
        const newColumn = await LeadColumn.create(req.body);
        res.status(201).json(newColumn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/lead-columns/:id', async (req, res) => {
    try {
        const deleted = await LeadColumn.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Column not found' });
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
        console.error('Error in POST /api/opportunities:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
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

// Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = await Task.create(req.body);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error in POST /api/tasks:', error);
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            await task.update(req.body);
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deleted = await Task.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Task not found' });
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

// Payments
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await Payment.findAll({ include: Invoice });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payments', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { invoiceId, amount, paymentDate, paymentMethod, transactionId, notes } = req.body;
        
        const invoice = await Invoice.findByPk(invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const newPayment = await Payment.create({
            invoiceId, amount, paymentDate, paymentMethod, transactionId, notes
        }, { transaction });

        // Update invoice amountPaid and status
        const totalPaid = (invoice.amountPaid || 0) + parseFloat(amount);
        let status = 'Partial';
        if (totalPaid >= invoice.amount) {
            status = 'Paid';
        }
        
        await invoice.update({ 
            amountPaid: totalPaid,
            status: status
        }, { transaction });

        await transaction.commit();
        
        const paymentWithInvoice = await Payment.findByPk(newPayment.id, { include: Invoice });
        res.status(201).json(paymentWithInvoice);
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
});

// Automation Rules
app.get('/api/automation-rules', async (req, res) => {
    try {
        const rules = await AutomationRule.findAll();
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/automation-rules', async (req, res) => {
    try {
        const newRule = await AutomationRule.create(req.body);
        res.status(201).json(newRule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/automation-rules/:id', async (req, res) => {
    try {
        const rule = await AutomationRule.findByPk(req.params.id);
        if (rule) {
            await rule.update(req.body);
            res.json(rule);
        } else {
            res.status(404).json({ message: 'Rule not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/automation-rules/:id', async (req, res) => {
    try {
        const deleted = await AutomationRule.destroy({ where: { id: req.params.id } });
        if (deleted) res.status(204).send();
        else res.status(404).json({ message: 'Rule not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Server Start ---
sequelize.sync({ alter: true }).then(async () => {
    await seedData();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
