import CoreManager from './CoreManager';
import decode from './decode';
import encode from './encode';
import ParseError from './ParseError';
import ParsePromise from './ParsePromise';

export function getFunctions() {
  return CoreManager.getHooksController().get("functions");
}

export function getTriggers() {
  return CoreManager.getHooksController().get("triggers");
}

export function getFunction(name) {
  return CoreManager.getHooksController().get("functions", name);
}

export function getTrigger(className, triggerName) {
  return CoreManager.getHooksController().get("triggers", className, triggerName);
}

export function createFunction(functionName, url) {
  return create({ functionName: functionName, url: url });
}

export function createTrigger(className, triggerName, url) {
  return create({ className: className, triggerName: triggerName, url: url });
}

export function create(hook) {
  return CoreManager.getHooksController().create(hook);
}

export function updateFunction(functionName, url) {
  return update({ functionName: functionName, url: url });
}

export function updateTrigger(className, triggerName, url) {
  return update({ className: className, triggerName: triggerName, url: url });
}

export function update(hook) {
  return CoreManager.getHooksController().update(hook);
}

export function removeFunction(functionName) {
  return remove({ functionName: functionName });
}

export function removeTrigger(className, triggerName) {
  return remove({ className: className, triggerName: triggerName });
}

export function remove(hook) {
  return CoreManager.getHooksController().remove(hook);
}

var DefaultController = {

  get(type, functionName, triggerName) {
    var url = "/hooks/" + type;
    if (functionName) {
      url += "/" + functionName;
      if (triggerName) {
        url += "/" + triggerName;
      }
    }
    return this.sendRequest("GET", url);
  },

  create(hook) {
    var url;
    if (hook.functionName && hook.url) {
      url = "/hooks/functions";
    } else if (hook.className && hook.triggerName && hook.url) {
      url = "/hooks/triggers";
    } else {
      return Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest("POST", url, hook);
  },

  remove(hook) {
    var url;
    if (hook.functionName) {
      url = "/hooks/functions/" + hook.functionName;
      delete hook.functionName;
    } else if (hook.className && hook.triggerName) {
      url = "/hooks/triggers/" + hook.className + "/" + hook.triggerName;
      delete hook.className;
      delete hook.triggerName;
    } else {
      return Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest("PUT", url, { "__op": "Delete" });
  },

  update(hook) {
    var url;
    if (hook.functionName && hook.url) {
      url = "/hooks/functions/" + hook.functionName;
      delete hook.functionName;
    } else if (hook.className && hook.triggerName && hook.url) {
      url = "/hooks/triggers/" + hook.className + "/" + hook.triggerName;
      delete hook.className;
      delete hook.triggerName;
    } else {
      return Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest('PUT', url, hook);
  },

  sendRequest(method, url, body) {
    return CoreManager.getRESTController().request(method, url, body, { useMasterKey: true }).then(res => {
      var decoded = decode(res);
      if (decoded) {
        return ParsePromise.as(decoded);
      }
      return ParsePromise.error(new ParseError(ParseError.INVALID_JSON, 'The server returned an invalid response.'));
    });
  }
};

CoreManager.setHooksController(DefaultController);