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

  describe('getRecentObjects', () => {
    it('returns recent objects for a valid class', async () => {
      const gameScore = new Parse.Object('GameScore');
      gameScore.set('score', 42);
      await gameScore.save();

      const result = await Parse.Cloud.run('getRecentObjects', { className: 'GameScore', limit: 5 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBeDefined();
    });

    it('uses default limit of 5', async () => {
      const result = await Parse.Cloud.run('getRecentObjects', { className: 'GameScore' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('rejects missing className', async () => {
      await expectAsync(Parse.Cloud.run('getRecentObjects', {})).toBeRejectedWith(
        new Parse.Error(Parse.Error.INVALID_QUERY, 'className parameter is required.')
      );
    });

    it('rejects invalid limit', async () => {
      await expectAsync(
        Parse.Cloud.run('getRecentObjects', { className: 'GameScore', limit: 200 })
      ).toBeRejectedWith(
        new Parse.Error(Parse.Error.INVALID_QUERY, 'limit must be a number between 1 and 100.')
      );
    });
  });
});
