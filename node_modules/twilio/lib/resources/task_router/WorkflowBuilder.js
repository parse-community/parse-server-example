var _ = require('underscore');

/**
 * [WorkflowRuleTarget description]
 * @param {[type]} options [description]
 */
function WorkflowRuleTarget(options) {
    options = options || {};

    if (!options.queue) { throw 'queue for WorkflowRuleTarget is required'; }

    this.queue = options.queue;
    this.expression = options.expression;
    this.priority = options.priority;
    this.timeout = options.timeout;
}

/**
 * [WorkflowRule description]
 * @param {[type]} options [description]
 */
function WorkflowRule(options) {
    options = options || {};

    if (!options.expression) { throw 'expression for WorkflowRule is required'; }
    if (!options.targets) { throw 'targets for WorkflowRule is required'; }

    this.friendly_name = options.friendly_name || options.friendlyName || options.filter_friendly_name;
    this.expression = options.expression;
    this.targets = _.map(options.targets, function(target) {
        return new WorkflowRuleTarget(target);
    });
    Object.defineProperty(this, 'friendlyName', {
        get: function() { return this.friendly_name; },
        set: function(value) { this.friendly_name = value; }
    });
}


/**
 * [TaskRoutingConfiguration description]
 * @param {[type]} options [description]
 */
function TaskRoutingConfiguration(options) {
    options = options || {};

    if (!options.filters) { throw 'filters for TaskRoutingConfiguration is required'; }

    this.filters = _.map(options.filters, function(filter) {
        return new WorkflowRule(filter);
    });
    this.default_filter = options.default_filter || options.defaultFilter;
    Object.defineProperty(this, 'defaultFilter', {
        get: function() { return this.default_filter; },
        set: function(o) { this.default_filter = o; }
    });
}


/**
 * [WorkflowConfiguration description]
 * @param {[type]} options [description]
 */
function WorkflowConfiguration(options) {
    options = options || {};
    var taskRouting = options.task_routing || options.taskRouting;

    if (!taskRouting) { throw 'taskRouting for WorkflowConfiguration is required'; }

    this.task_routing = new TaskRoutingConfiguration(taskRouting);
    Object.defineProperty(this, 'taskRouting', {
        get: function() { return this.task_routing; },
        set: function(o) { this.task_routing = o; },
    });
}

WorkflowConfiguration.fromJSON = function(json) {
    return new WorkflowConfiguration(JSON.parse(json));
};

_.extend(WorkflowConfiguration.prototype, {
    toJSON: function() {
        var ignoredProperties = [
            'friendlyName', 'taskRouting', 'defaultFilter'
        ];
        var skipIgnoredProps = function(key, value) {
            return _.contains(ignoredProperties, key) ? undefined : value;
        };

        return JSON.stringify({
            task_routing : this.taskRouting
        }, skipIgnoredProps);
    }
});


module.exports = {

    WorkflowRuleTarget: WorkflowRuleTarget,
    WorkflowRule: WorkflowRule,
    TaskRoutingConfiguration: TaskRoutingConfiguration,
    WorkflowConfiguration: WorkflowConfiguration

};
