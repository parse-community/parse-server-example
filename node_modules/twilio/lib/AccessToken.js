var _ = require('underscore');
var jwt = require('jsonwebtoken');

/**
 * @constructor
 * @param {object} options - ...
 * @param {string} options.serviceSid - The service unique ID
 * @param {string} options.endpointId - The endpoint ID
 * @param {string} options.deploymentRoleSid - SID of the deployment role to be
 *                 assigned to the user
 * @param {string} options.pushCredentialSid - The Push Credentials SID
 */
function IpMessagingGrant(options) {
  options = options || {};
  this.serviceSid = options.serviceSid;
  this.endpointId = options.endpointId;
  this.deploymentRoleSid = options.deploymentRoleSid;
  this.pushCredentialSid = options.pushCredentialSid;
}

_.extend(IpMessagingGrant.prototype, {
  key: 'ip_messaging',

  toPayload: function() {
    var grant = {};
    if (this.serviceSid) { grant.service_sid = this.serviceSid; }
    if (this.endpointId) { grant.endpoint_id = this.endpointId; }
    if (this.deploymentRoleSid) {
      grant.deployment_role_sid = this.deploymentRoleSid;
    }
    if (this.pushCredentialSid) {
      grant.push_credential_sid = this.pushCredentialSid;
    }
    return grant;
  }
});


/**
 * @constructor
 * @param {object} options - ...
 * @param {string} options.configurationProfileSid - The configuration
 *                 profile unique ID
 */
function ConversationsGrant(options) {
  options = options || {};
  this.configurationProfileSid = options.configurationProfileSid;
}

_.extend(ConversationsGrant.prototype, {
  key: 'rtc',
  toPayload: function() {
    var grant = {};
    if (this.configurationProfileSid) {
      grant.configuration_profile_sid = this.configurationProfileSid;
    }
    return grant;
  }
});


/**
 * @constructor
 * @param {object} options - ...
 * @param {string} options.configurationProfileSid - The configuration
 *                 profile unique ID
 */
function VideoGrant(options) {
  options = options || {};
  this.configurationProfileSid = options.configurationProfileSid;
}

_.extend(VideoGrant.prototype, {
  key: 'video',
  toPayload: function() {
    var grant = {};
    if (this.configurationProfileSid) {
      grant.configuration_profile_sid = this.configurationProfileSid;
    }
    return grant;
  }
});


/**
 * @constructor
 * @param {object} options - ...
 * @param {string} options.outgoingApplicationSid - application sid to call when placing outgoing call
 * @param {object} options.outgoingApplicationParams - request params to pass to the application
 * @param {string} options.pushCredentialSid - Push Credential Sid to use when registering to receive incoming call notifications
 * @param {string} options.endpointId - Specify an endpoint identifier for this device, which will allow the developer
 *                 to direct calls to a specific endpoint when multiple devices are associated with a single identity
 */
function VoiceGrant(options) {
  options = options || {};
  this.outgoingApplicationSid = options.outgoingApplicationSid;
  this.outgoingApplicationParams = options.outgoingApplicationParams;
  this.pushCredentialSid = options.pushCredentialSid;
  this.endpointId = options.endpointId;
}

_.extend(VoiceGrant.prototype, {
  key: 'voice',
  toPayload: function() {
    var grant = {};
    if (this.outgoingApplicationSid) {
      grant.outgoing = {};
      grant.outgoing.application_sid = this.outgoingApplicationSid;

      if (this.outgoingApplicationParams) {
        grant.outgoing.params = this.outgoingApplicationParams;
      }
    }

    if (this.pushCredentialSid) {
      grant.push_credential_sid = this.pushCredentialSid;
    }
    if (this.endpointId) {
      grant.endpoint_id = this.endpointId;
    }
    return grant;
  }
});

/**
 * @constructor
 * @param {string} accountSid - The account's unique ID to which access is scoped
 * @param {string} keySid - The signing key's unique ID
 * @param {string} secret - The secret to sign the token with
 * @param {object} opts - ...
 * @param {number} [opts.ttl=3600] - Time to live in seconds
 * @param {string} [opts.identity] - The identity of the first person
 * @param {number} [opts.nbf] - Time from epoch in seconds for not before value
 */
function AccessToken(accountSid, keySid, secret, opts) {
  if (!accountSid) { throw new Error('accountSid is required'); }
  if (!keySid) { throw new Error('keySid is required'); }
  if (!secret) { throw new Error('secret is required'); }
  opts = opts || {};

  this.accountSid = accountSid;
  this.keySid = keySid;
  this.secret = secret;
  this.ttl = opts.ttl || 3600;
  this.identity = opts.identity;
  this.nbf = opts.nbf;
  this.grants = [];
}

// Class level properties
AccessToken.IpMessagingGrant = IpMessagingGrant;
AccessToken.ConversationsGrant = ConversationsGrant;
AccessToken.VoiceGrant = VoiceGrant;
AccessToken.VideoGrant = VideoGrant;
AccessToken.DEFAULT_ALGORITHM = 'HS256';
AccessToken.ALGORITHMS = [
  'HS256',
  'HS384',
  'HS512'
];

_.extend(AccessToken.prototype, {
  addGrant: function(grant) {
    this.grants.push(grant);
  },

  toJwt: function(algorithm) {
    algorithm = algorithm || AccessToken.DEFAULT_ALGORITHM;
    if (!_.contains(AccessToken.ALGORITHMS, algorithm)) {
      throw new Error('Algorithm not supported. Allowed values are ' +
        AccessToken.ALGORITHMS.join(', '));
    }

    var grants = {};
    if (_.isString(this.identity)) { grants.identity = this.identity; }

    _.each(this.grants, function(grant) {
      grants[grant.key] = grant.toPayload();
    });

    var now = Math.floor(Date.now() / 1000);
    var payload = {
      jti: this.keySid + '-' + now,
      grants: grants
    };
    if (_.isNumber(this.nbf)) { payload.nbf = this.nbf; }

    return jwt.sign(payload, this.secret, {
      headers: {
        cty: 'twilio-fpa;v=1',
        typ: 'JWT'
      },
      algorithm: algorithm,
      issuer: this.keySid,
      subject: this.accountSid,
      expiresIn: this.ttl
    });
  }
});

module.exports = AccessToken;
