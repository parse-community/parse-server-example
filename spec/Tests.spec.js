describe('Parse Server example', () => {
  Parse.User.enableUnsafeCurrentUser();
  it('call function', async () => {
    const result = await Parse.Cloud.run('hello');
    expect(result).toBe('Hi');
  });
  it('call async function', async () => {
    const result = await Parse.Cloud.run('asyncFunction');
    expect(result).toBe('Hi async');
  });
  it('failing test', async () => {
    const obj = new Parse.Object('Test');
    await expectAsync(obj.save()).toBeRejectedWith(
      new Parse.Error(9001, 'Saving test objects is not available.')
    );
  });
});
