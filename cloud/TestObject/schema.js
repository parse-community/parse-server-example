export const TestObjectSchema = {
  className: "TestObject",
  fields: {
    beforeSave: { type: "Boolean", defaultValue: false },
    additionalData: { type: "String" },
  },
  classLevelPermissions: {
    find: { "*": true },
    count: { "*": true },
    get: { "*": true },
    update: { "*": true },
    create: { "*": true },
    delete: { "*": true },
  },
};
