// It is recommended to promote modularity by grouping cloud functions and hooks together.
// Suggestion would be to create a file /cloud/Test.js and include all the functions related to the Test class in that file.
export const hiFunction = req => {
  req.log.info(req);
  return 'Hi';
};
Parse.Cloud.define('hello', hiFunction);

export const asyncFunction = async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
};
Parse.Cloud.define('asyncFunction', asyncFunction);

export const beforeSaveTest = () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
};
Parse.Cloud.beforeSave('Test', beforeSaveTest);
