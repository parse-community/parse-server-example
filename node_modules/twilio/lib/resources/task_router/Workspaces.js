/**
 @module resources/task_router/Workspaces
 The Twilio TaskRouter "Workspaces" Resource.
 */
var generate = require('../generate');

module.exports = function (client) {
    var baseResourceUrl = '/Workspaces';

    //Instance requests
    function Workspaces(sid) {
        var resourceApi = {};

        //Add standard instance resource functions
        generate.restFunctions(resourceApi, client, ['DELETE', 'GET', 'POST', {update: 'POST'}], baseResourceUrl + '/' + sid);

        //Add activities sub-resource
        resourceApi.activities = function(activitySid) {
            var activityResourceApi = {
                get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Activities/' + activitySid),
                post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Activities/' + activitySid),
                delete: generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Activities/' + activitySid)
            };

            //Aliases
            activityResourceApi.update = activityResourceApi.post;

            return activityResourceApi;
        };

        resourceApi.activities.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Activities');
        resourceApi.activities.post = generate(client, 'POST', baseResourceUrl + '/' + sid + '/Activities');

        //Aliases
        resourceApi.activities.list = resourceApi.activities.get;
        resourceApi.activities.create = resourceApi.activities.post;

        //Add events sub-resource
        resourceApi.events = function(eventSid) {
            var eventResourceApi = {
                get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Events/' + eventSid)
            };

            return eventResourceApi;
        };

        resourceApi.events.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Events');

        //Aliases
        resourceApi.events.list = resourceApi.events.get;

        //Add tasks sub-resource
        resourceApi.tasks = function(taskSid) {
            var taskResourceApi = {
                get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Tasks/' + taskSid),
                post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Tasks/' + taskSid),
                delete: generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Tasks/' + taskSid)
            };

            //Aliases
            taskResourceApi.update = taskResourceApi.post;

            // Add reservation sub-resource
            taskResourceApi.reservations = function(reservationSid) {
                var reservationResourceApi = {
                    get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Tasks/' + taskSid + '/Reservations/' + reservationSid),
                    post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Tasks/' + taskSid + '/Reservations/' + reservationSid)
                };

                //Aliases
                reservationResourceApi.update = reservationResourceApi.post;

                return reservationResourceApi;
            };

            taskResourceApi.reservations.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Tasks/' + taskSid + '/Reservations');

            //Aliases
            taskResourceApi.reservations.list = taskResourceApi.reservations.get;

            return taskResourceApi;
        };

        resourceApi.tasks.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Tasks');
        resourceApi.tasks.post = generate(client, 'POST', baseResourceUrl + '/' + sid + '/Tasks');

        //Aliases
        resourceApi.tasks.list = resourceApi.tasks.get;
        resourceApi.tasks.create = resourceApi.tasks.post;

        //Add taskQueues sub-resource
        resourceApi.taskQueues = function(taskQueueSid) {
            var taskQueueResourceApi = {
                get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/TaskQueues/' + taskQueueSid),
                post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/TaskQueues/' + taskQueueSid),
                delete: generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/TaskQueues/' + taskQueueSid)
            };

            //Aliases
            taskQueueResourceApi.update = taskQueueResourceApi.post;

            // Statistics
            taskQueueResourceApi.statistics = function() {
                return {};
            }

            taskQueueResourceApi.statistics.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/TaskQueues/' + taskQueueSid + '/Statistics');

            return taskQueueResourceApi;
        };

        resourceApi.taskQueues.statistics = function() {
            return {};
        }

        resourceApi.taskQueues.statistics.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/TaskQueues/Statistics');
        resourceApi.taskQueues.statistics.list = resourceApi.taskQueues.statistics.get;

        resourceApi.taskQueues.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/TaskQueues');
        resourceApi.taskQueues.post = generate(client, 'POST', baseResourceUrl + '/' + sid + '/TaskQueues');

        //Aliases
        resourceApi.taskQueues.list = resourceApi.taskQueues.get;
        resourceApi.taskQueues.create = resourceApi.taskQueues.post;

        //Add workers sub-resource
        resourceApi.workers = function(workerSid) {
            var workerResourceApi = {
                get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workers/' + workerSid),
                post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Workers/' + workerSid),
                delete: generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Workers/' + workerSid)
            };

            //Aliases
            workerResourceApi.update = workerResourceApi.post;

            // Statistics
            workerResourceApi.statistics = function() {
                return {};
            }

            workerResourceApi.statistics.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workers/' + workerSid + '/Statistics');

            // Reservations
            workerResourceApi.reservations = function(reservationSid) {
                var reservationResourceApi = {
                    get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workers/' + workerSid + '/Reservations/' + reservationSid),
                    post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Workers/' + workerSid + '/Reservations/' + reservationSid)
                };

                //Aliases
                reservationResourceApi.update = reservationResourceApi.post;
                return reservationResourceApi;
            };

            workerResourceApi.reservations.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workers/' + workerSid + '/Reservations');
            
            //Aliases
            workerResourceApi.reservations.list = workerResourceApi.reservations.get;

            return workerResourceApi;
        };

        resourceApi.workers.statistics = function() {
            return {};
        }

        resourceApi.workers.statistics.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workers' + '/Statistics');
        resourceApi.workers.statistics.list = resourceApi.workers.statistics.get;

        resourceApi.workers.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workers');
        resourceApi.workers.post = generate(client, 'POST', baseResourceUrl + '/' + sid + '/Workers');

        //Aliases
        resourceApi.workers.list = resourceApi.workers.get;
        resourceApi.workers.create = resourceApi.workers.post;

        //Add workflows sub-resource
        resourceApi.workflows = function(workflowSid) {
            var workflowResourceApi = {
                get: generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workflows/' + workflowSid),
                post: generate(client, 'POST', baseResourceUrl + '/' + sid + '/Workflows/' + workflowSid),
                delete: generate(client, 'DELETE', baseResourceUrl + '/' + sid + '/Workflows/' + workflowSid)
            };

            //Aliases
            workflowResourceApi.update = workflowResourceApi.post;

            workflowResourceApi.statistics = function() {
                return {};
            };

            workflowResourceApi.statistics.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workflows/' + workflowSid + '/Statistics');

            return workflowResourceApi;
        };

        resourceApi.workflows.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Workflows');
        resourceApi.workflows.post = generate(client, 'POST', baseResourceUrl + '/' + sid + '/Workflows');

        //Aliases
        resourceApi.workflows.list = resourceApi.workflows.get;
        resourceApi.workflows.create = resourceApi.workflows.post;

        // Statistics
        resourceApi.statistics = function() {
            return {};
        }

        resourceApi.statistics.get = generate(client, 'GET', baseResourceUrl + '/' + sid + '/Statistics');

        return resourceApi;
    }

    //List requests
    generate.restFunctions(Workspaces, client, ['GET', 'POST', {create: 'POST'}], baseResourceUrl);

    return Workspaces;
};
