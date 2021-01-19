describe("Parse Server example", () => {
  Parse.User.enableUnsafeCurrentUser();
  it('call function', async () => {
    const result = await Parse.Cloud.run('hello');
    expect(result).toBe('Hi');
  });
  it('call async function', async () => {
    const result = await Parse.Cloud.run('asyncFunction');
    expect(result).toBe('Hi async');
  })
  it('failing test', async () => {
    const obj = new Parse.Object('Test');
    try {
      await obj.save(); 
      fail('should not have been able to save test object.');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.code).toBe(212);
      expect(e.message).toBe('Saving test objects is not available.');
    }
  })
});