// This is a setup file for Jest that mocks the Parse Cloud Code triggers.
import Parse from 'parse/node';
Parse.initialize('myAppId');
const triggerStore = {};
Parse.Cloud = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === 'getTrigger') {
        return (triggerType, name) => {
          const trigger =  triggerStore[triggerType][name];
          if (!trigger) {
            throw new Error(`Trigger ${triggerType}.${name} not found`);
          }
          return trigger;
        }
      }
      if (!(prop in triggerStore)) {
        triggerStore[prop] = {};
      }
      return (name, func) => {
        triggerStore[prop][name] = func;
      };
    },
  }
);
global.Parse = Parse;
