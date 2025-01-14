// E2E tests should be minimal and only test the integration of the Parse Server.
// Unit tests are preferred as they are faster and more reliable, and do not require a running Parse Server.
describe('Parse Server example', () => {
  Parse.User.enableUnsafeCurrentUser();
  it('call function', async () => {
    const result = await Parse.Cloud.run('hello');
    expect(result).toBe('Hi');
  });

  it('call async function', async () => {
    const result = await Parse.Cloud.run('helloAsyncFunction');
    expect(result).toBe('Hi async');
  });

  it('failing test', async () => {
    const obj = new Parse.Object('TestObject');
    await expectAsync(obj.save()).toBeRejectedWith(
      new Parse.Error(9001, 'Saving test objects is not available.')
    );
  });
});
