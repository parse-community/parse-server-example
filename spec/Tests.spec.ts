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
      new Parse.Error(Parse.Error.OTHER_CAUSE, 'Saving test objects is not available.')
    );
  });
});
