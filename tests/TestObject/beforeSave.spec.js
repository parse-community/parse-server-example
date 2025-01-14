import jest from "jest-mock";
import { TestObjectBeforeSave } from "../../cloud/TestObject/beforeSave";

describe("TestObject beforeSave", () => {
  let mockRequest;
  let mockObject;

  beforeEach(() => {
    mockObject = {
      set: jest.fn()
    };
    mockRequest = {
      object: mockObject
    };
  });

  describe("validateRequest", () => {
    it("should not throw an error if request is valid", () => {
      const validRequest = new TestObjectBeforeSave(mockRequest);
      expect(() => validRequest.validateRequest()).not.toThrow();
    });
  });

  describe("addBeforeSaveFlag", () => {
    it("should set the beforeSave flag on the object", () => {
      const testObject = new TestObjectBeforeSave(mockRequest);
      testObject.addBeforeSaveFlag(mockObject);
      expect(mockObject.set).toHaveBeenCalledWith("beforeSave", true);
    });
  });

  describe("fetchAdditionalData", () => {
    it("should return mocked data", async () => {
      const testObject = new TestObjectBeforeSave(mockRequest);
      const result = await testObject.fetchAdditionalData();
      expect(result).toBe("mockedData");
    });
  });

  describe("performAdditionalProcessing", () => {
    it("should set additional data on the object", async () => {
      const testObject = new TestObjectBeforeSave(mockRequest);
      await testObject.performAdditionalProcessing(mockObject);
      expect(mockObject.set).toHaveBeenCalledWith("additionalData", "mockedData");
    });
  });

  describe("execute", () => {
    it("should call all methods in the correct order", async () => {
      const testObject = new TestObjectBeforeSave(mockRequest);
      const validateRequestSpy = jest.spyOn(testObject, "validateRequest");
      const addBeforeSaveFlagSpy = jest.spyOn(testObject, "addBeforeSaveFlag");
      const performAdditionalProcessingSpy = jest.spyOn(testObject, "performAdditionalProcessing");

      await testObject.execute().catch(() => {}); // Catch the expected throw to allow assertions.

      expect(validateRequestSpy).toHaveBeenCalledTimes(1);
      expect(addBeforeSaveFlagSpy).toHaveBeenCalledWith(mockObject);
      expect(performAdditionalProcessingSpy).toHaveBeenCalledWith(mockObject);
    });

    it("should set both beforeSave flag and additional data", async () => {
      const testObject = new TestObjectBeforeSave(mockRequest);
      await testObject.execute().catch(() => {}); // Catch the expected throw to allow assertions.

      expect(mockObject.set).toHaveBeenCalledWith("beforeSave", true);
      expect(mockObject.set).toHaveBeenCalledWith("additionalData", "mockedData");
    });

    it("should throw an error with code 9001", async () => {
      const testObject = new TestObjectBeforeSave(mockRequest);
      await expect(testObject.execute()).rejects.toThrowError(
        new Parse.Error(9001, "Saving test objects is not available.")
      );
    });
  });
});
