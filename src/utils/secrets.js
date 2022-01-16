import AWS from 'aws-sdk';
export const getSecret = secretName => {
  if (process.env.TESTING) {
    return;
  }
  const client = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
  });
  return new Promise((resolve, reject) =>
    client.getSecretValue({ SecretId: secretName }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data.SecretString));
      } catch (e) {
        resolve(data.SecretString);
      }
    })
  );
};
export const getSecrets = async (...secretsArray) => {
  const results = await Promise.all(secretsArray.map(secret => getSecret(secret)));
  const result = {};
  for (let i = 0; i < secretsArray.length; i++) {
    result[secretsArray[i]] = results[i] || {};
  }
  return result;
};
