// breaking down the beforeSave into smaller methods allows for easier testing and better separation of concerns
export class TestObjectBeforeSave {
  constructor(request) {
    this.request = request;
  }

  async execute() {
    const object = this.request.object;
    this.validateRequest();
    this.addBeforeSaveFlag(object);
    await this.performAdditionalProcessing(object);

    throw new Parse.Error(9001, 'Saving test objects is not available.');
  }

  validateRequest() {
    if (!this.request || !this.request.object) {
      throw new Error('Invalid request object.');
    }
  }

  addBeforeSaveFlag(object) {
    object.set('beforeSave', true);
  }

  async performAdditionalProcessing(object) {
    // Simulate some async operation
    const additionalData = await this.fetchAdditionalData();
    object.set('additionalData', additionalData);
  }

  async fetchAdditionalData() {
    // Mock some external operation, e.g., fetching data from a database
    return 'mockedData';
  }
}

Parse.Cloud.beforeSave('TestObject', (req) => {
  const beforeSaveTestObject = new TestObjectBeforeSave(req);
  return beforeSaveTestObject.execute();
});
