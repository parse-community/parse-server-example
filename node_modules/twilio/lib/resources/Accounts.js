/**
 @module resources/Accounts
 The Twilio "Accounts" Resource.
 */
var _ = require('underscore'),
    generate = require('./generate'),
    ListInstanceResource = require('./ListInstanceResource');

module.exports = function (client) {

    //Define subresources on the accounts resource, with the given account SID
    function mixinResources(obj, sid) {
        //All other REST resources are based on account - some can simply be generated, others need additonal URL params
        //TODO: This can probably be smarter.  Should eventually refactor generator to do subresources too. Shouldn't need to be custom
        //Probably should generate the whole f***ing thing from an object literal describing the resource structure.  But this does work.
        var subresources = {
            availablePhoneNumbers:require('./AvailablePhoneNumbers')(client, sid),
            outgoingCallerIds:ListInstanceResource(client, sid, 'OutgoingCallerIds',
                ['GET', 'POST', 'PUT', 'DELETE', { update:'PUT' }],
                ['GET', 'POST', { create:'POST' }]
            ),
            incomingPhoneNumbers:require('./IncomingPhoneNumbers')(client, sid),
            messages: require('./Messages')(client, sid),
            sms:{
                messages:ListInstanceResource(client, sid, 'SMS/Messages',
                    ['GET'],
                    ['GET', 'POST', {create:'POST'}]
                ),
                shortCodes:ListInstanceResource(client, sid, 'SMS/ShortCodes',
                    ['GET', 'POST', {update:'POST'}],
                    ['GET']
                )
            },
            applications:ListInstanceResource(client, sid, 'Applications',
                ['GET', 'POST', 'DELETE', {update:'POST'}],
                ['GET', 'POST', {create:'POST'}]
            ),
            connectApps:ListInstanceResource(client, sid, 'ConnectApps',
                ['GET', 'POST', {update:'POST'}],
                ['GET']
            ),
            authorizedConnectApps:ListInstanceResource(client, sid, 'AuthorizedConnectApps',
                ['GET'],
                ['GET']
            ),
            calls:require('./Calls')(client, sid),
            conferences:require('./Conferences')(client, sid),
            queues:require('./Queues')(client, sid),
            recordings:require('./Recordings')(client, sid),
            tokens: ListInstanceResource(client, sid, 'Tokens',
                [],
                ['POST', {create:'POST'}]
            ),
            transcriptions:ListInstanceResource(client, sid, 'Transcriptions',
                ['GET', 'DELETE'],
                ['GET']
            ),
            notifications:ListInstanceResource(client, sid, 'Notifications',
                ['GET', 'DELETE'],
                ['GET']
            ),
            usage:{
                records:require('./UsageRecords')(client, sid),
                triggers:ListInstanceResource(client,sid,'Usage/Triggers',
                    ['GET','POST','DELETE',{update:'POST'}],
                    ['GET','POST',{create:'POST'}]
                )
            },
            sip:{
                domains:require('./sip/Domains')(client, sid),
                ipAccessControlLists:require('./sip/IpAccessControlLists')(client,sid),
                credentialLists:require('./sip/CredentialLists')(client,sid)
            },
            addresses:require('./Addresses')(client, sid),
            keys:ListInstanceResource(client, sid, 'Keys',
                ['GET', 'POST', 'DELETE', {update: 'POST'}],
                ['GET', 'POST', {create: 'POST'}]
            )
        };

        //Add resources to Accounts.* or Accounts(sid).*
        _.extend(obj, subresources);
    }

    /**
     The Twilio Accounts Resource
     @constructor
     @param {string} accountSid - The specific account for which to scope requests
     */
    function Accounts(accountSid) {
        //This is the resource for accounts aside from the default master account
        var resourceApi = {};

        //generate REST function calls for the appropriate resource
        generate.restFunctions(resourceApi, client, ['GET', 'PUT', 'POST'], '/Accounts/' + accountSid);
        resourceApi.update = resourceApi.post;
        resourceApi.list = resourceApi.get;

        //Mix in sub resources
        mixinResources(resourceApi, accountSid);

        //Return resource API, plus sub-resources
        return resourceApi;
    }

    //Create REST functions with the default account
    generate.restFunctions(Accounts, client, ['GET', 'POST'], '/Accounts');
    Accounts.create = Accounts.post;
    Accounts.list = Accounts.get;

    //Define other sub-resources of Accounts for master account
    mixinResources(Accounts, client.accountSid);

    return Accounts;
};
