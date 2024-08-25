const cron = require('node-cron');
const Plans = require('./models/plansModel');
const PropertyType = require('./models/propertyTypeModel');

function startCronJobs() {
    cron.schedule('0 2 * * *', async () => {
        try {
            await Plans.updatePlanCounts();
            console.log('Plan counts updated successfully');
        } catch (err) {
            console.error('Error updating plan counts:', err);
        }
    });

    cron.schedule('0 3 * * *', async () => {
        try {
            await PropertyType.updatePropertyTypeCounts();
            console.log('PropertyType counts updated successfully');
        } catch (err) {
            console.error('Error updating PropertyType counts:', err);
        }
    });
}

module.exports = startCronJobs;
