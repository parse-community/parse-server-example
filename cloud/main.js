const Scheduler = require('parse-server-jobs-scheduler').default;
const scheduler = new Scheduler();
 
// Recreates all crons when the server is launched
scheduler.recreateScheduleForAllJobs();
 
// Recreates schedule when a job schedule has changed
Parse.Cloud.afterSave('_JobSchedule', async (request) => {
  scheduler.recreateSchedule(request.object.id)
});
 
// Destroy schedule for removed job
Parse.Cloud.afterDelete('_JobSchedule', async (request) => {
  scheduler.destroySchedule(request.object.id)
});

require('./UpdateConcursosJob.js');
