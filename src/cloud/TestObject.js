Parse.Cloud.beforeSave(
  'TestObject',
  ({ object, user }) => {
    if (!object.existed()) {
      object.set('creator', user);
      const acl = new Parse.ACL(user);
      // this creates a private TestObject that only the creator can view and edit
      object.setACL(acl);
      return object;
    }
    object.revert('creator');
  },
  {
    requireUser: true,
    skipWithMasterKey: true,
    fields: ['name'],
  }
);
Parse.Cloud.beforeFind(
  'TestObject',
  ({ query, user }) => {
    query.equalTo('creator', user);
  },
  {
    requireUser: true,
    skipWithMasterKey: true,
  }
);
