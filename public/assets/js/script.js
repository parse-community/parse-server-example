// Initialize Parse SDK
Parse.initialize('myAppId');
Parse.serverURL = `${window.location.origin}/parse`;

/**
 * Utility Functions
 */
const buildParseUrl = () => {
  const url = `${window.location.origin}/parse`;
  document.querySelector('#parse-url').textContent = url;
};

const bindBtn = (selector, callback) => {
  document.querySelector(selector)?.addEventListener('click', callback);
};

const closeStep = (selector) => {
  document.querySelector(selector)?.classList.add('step--disabled');
};

const openStep = (selector) => {
  document.querySelector(selector)?.classList.remove('step--disabled');
};

const fillStepOutput = (selector, data) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = `Output: ${data}`;
    element.style.display = 'block';
  }
};

const fillStepError = (selector, errorMsg) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = errorMsg;
    element.style.display = 'block';
  }
};

const fillBtn = (selector, message) => {
  const element = document.querySelector(selector);
  if (element) {
    element.classList.add('success');
    element.textContent = `✓ ${message}`;
  }
};

const showWorkingMessage = () => {
  const step = document.querySelector('#step-4');
  if (step) {
    setTimeout(() => {
      step.style.display = 'block';
    }, 500);
  }
};

/**
 * Parse Requests
 */
const postData = async () => {
  try {
    const gameScore = new Parse.Object('GameScore');
    gameScore.set('score', 1337);
    gameScore.set('playerName', 'Sean Plott');
    gameScore.set('cheatMode', false);

    const result = await gameScore.save();
    Store.objectId = result.id;

    closeStep('#step-1');
    fillStepOutput('#step-1-output', JSON.stringify(result));
    fillBtn('#step-1-btn', 'Posted');
    openStep('#step-2');

    bindBtn('#step-2-btn', async (e) => {
      e.preventDefault();
      await getData();
    });
  } catch (error) {
    fillStepError('#step-1-error', `There was a failure: ${error.message}`);
  }
};

const getData = async () => {
  try {
    const query = new Parse.Query('GameScore');
    const result = await query.get(Store.objectId);

    closeStep('#step-2');
    fillStepOutput('#step-2-output', JSON.stringify(result));
    fillBtn('#step-2-btn', 'Fetched');
    openStep('#step-3');

    bindBtn('#step-3-btn', async (e) => {
      e.preventDefault();
      await postCloudCodeData();
    });
  } catch (error) {
    fillStepError('#step-2-error', `There was a failure: ${error.message}`);
  }
};

const postCloudCodeData = async () => {
  try {
    const result = await Parse.Cloud.run('hello');

    closeStep('#step-3');
    fillStepOutput('#step-3-output', JSON.stringify(result));
    fillBtn('#step-3-btn', 'Tested');
    showWorkingMessage();
  } catch (error) {
    fillStepError('#step-3-error', `There was a failure: ${error.message}`);
  }
};

/**
 * Store
 */
const Store = {
  objectId: '',
};

/**
 * Boot
 */
const init = () => {
  buildParseUrl();
  bindBtn('#step-1-btn', async (e) => {
    e.preventDefault();
    await postData();
  });
};

init();
