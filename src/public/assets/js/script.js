/* eslint-disable no-unused-vars */
function loadParse(appId, serverURL) {
  Parse.initialize(appId);
  Parse.serverURL = serverURL;
  if (Parse.User.current()) {
    showLoggedIn();
    showTab(1);
  }
}

async function login() {
  const { username, password } = getFormValues();
  if (!username || !password) {
    updateStatus('Please correct the invalid fields.');
    return;
  }
  await runParseOperation(Parse.User.logIn(username, password));
  showLoggedIn();
  showTab(1);
  updateStatus('Successfully logged in! Now, lets save an object.');
}

async function signup() {
  const { username, password } = getFormValues();
  if (!username || !password) {
    updateStatus('Please correct the invalid fields.');
    return;
  }
  await runParseOperation(Parse.User.signUp(username, password));
  showLoggedIn();
  showTab(1);
  updateStatus('Successfully signed up! Now, lets save an object.');
}
function showLoggedIn() {
  document.getElementById('userDetails').style.display = 'block';
  document.getElementById('currentUser').innerHTML = Parse.User.current().getUsername();
}

async function logout() {
  await runParseOperation(Parse.User.logOut());
  showTab(0);
  updateStatus('Successfully logged out.');
  document.getElementById('userDetails').style.display = 'none';
}
let testObjectSaved = false;
async function saveObject() {
  if (testObjectSaved) {
    showTab(2);
    findObjects();
    return;
  }
  const nameField = document.getElementById('name');
  const name = nameField.value;
  if (!name) {
    nameField.className = 'invalid';
    updateStatus('Please enter an object name.');
    return;
  }
  const TestObject = new Parse.Object('TestObject');
  TestObject.set('name', name);
  await runParseOperation(TestObject.save());
  updateStatus(`Test Object saved with id: ${TestObject.id}.`);
  document.getElementById('saveButton').innerHTML = 'Next';
  testObjectSaved = true;
}

async function findObjects() {
  const query = new Parse.Query('TestObject');
  const objects = await runParseOperation(query.find());
  let innerHTML = '<tr><th>ID</th><th>Name</th><th>Created At</th></tr>';
  for (const object of objects) {
    innerHTML += `<tr><td>${object.id}</td><td>${object.get('name')}</td><td>${object
      .get('createdAt')
      .toISOString()}</td></tr>`;
  }
  document.getElementById('testTable').innerHTML = innerHTML;
  updateStatus(`${objects.length} TestObject's found.`);
}

async function callFunction() {
  const cloudResult = await runParseOperation(Parse.Cloud.run('hello'));
  updateStatus(`Cloud function 'hello' ran with result: ${cloudResult}`);
}

// Utilities

function getFormValues() {
  const usernameField = document.getElementById('username');
  const username = usernameField.value;
  if (!username) {
    usernameField.className = 'invalid';
  }
  const passwordField = document.getElementById('password');
  const password = passwordField.value;
  if (!password) {
    passwordField.className = 'invalid';
  }
  return { username, password };
}

function showTab(n) {
  updateStatus('');
  const tabs = document.getElementsByClassName('tab');
  for (const tab of tabs) {
    tab.style.display = 'none';
  }
  tabs[n].style.display = 'block';
}
function updateStatus(text) {
  const statuses = document.getElementsByClassName('status');
  for (const status of statuses) {
    status.innerHTML = text;
  }
}
async function runParseOperation(promise) {
  try {
    updateStatus('Loading...');
    const result = await Promise.resolve(promise);
    updateStatus('');
    return result;
  } catch (e) {
    updateStatus(e && e.message);
    throw e;
  }
}
showTab(0);
/* eslint-enable no-unused-vars */
