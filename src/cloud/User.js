Parse.Cloud.beforeSave(
  Parse.User,
  ({ object }) => {
    if (!object.existed()) {
      // new Parse.User. Let's set their ACL to them only.
      object.setACL(new Parse.ACL());
      return object;
    }
  },
  {
    skipWithMasterKey: true,
  }
);
