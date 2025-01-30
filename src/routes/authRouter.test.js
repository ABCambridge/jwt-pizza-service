const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;


if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

beforeAll(async () => {
  testUser.email = randomName() + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = getTokenFromResponse( registerRes );
  testUser.id = registerRes.body.user.id;
  expectValidJwt(testUserAuthToken);
});

test( "valid register", async () => {
  const fakeUser = { name: "fake user", email: `${randomName()}@test.com`, password: "b" };
  const registerResponse = (await request( app ).post( "/api/auth" ).send( fakeUser ));

  expect( registerResponse.status ).toBe( 200 );

  responseBody = registerResponse.body;

  expectValidJwt( responseBody.token );
  delete responseBody.token;

  expect( responseBody.user.id ).toBeGreaterThanOrEqual( 1 );
  delete responseBody.user.id;

  expect( responseBody ).toMatchObject( { user: { name: fakeUser.name, email: fakeUser.email, roles: [{ role: "diner" }] } } );
});

// test( "invalid register", async () => {

// });

test( "valid login", async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);

  const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;
  expect(loginRes.body.user).toMatchObject(expectedUser);

  await logoutUser( loginRes.body.token );
});

test( "invalid login", async () => {
  const badUser = { name: testUser.name, email: `${testUser.email}`, password: `test${testUser.password}` };
  const loginResult = await loginUser( badUser );
  expect( loginResult.status ).toBe( 404 );
  expect( loginResult.body.message ).toBe( "unknown user" );
});

test( "valid logout", async () => {
  const loginResult = await loginUser( testUser );
  let authToken = loginResult.body.token;

  const logoutResult = await logoutUser( authToken );
  expect( logoutResult.status ).toBe( 200 );
  expect( logoutResult.body ).toMatchObject( { message: 'logout successful' } );
});

test( "invalid auth", async () => {
  const loginResult = await loginUser( testUser );
  const authToken = getTokenFromResponse( loginResult );

  let badAuthToken = `test${authToken}`
  const logoutResult = await logoutUser( badAuthToken );
  expect( logoutResult.status ).toBe( 401 );
  expect( logoutResult.body.message ).toBe( "unauthorized");

  await logoutUser( authToken )
});

test( "valid user update", async () => {
  const loginResult = await loginUser( testUser );
  let authToken = getTokenFromResponse( loginResult );
  const currentUser = loginResult.body.user;

  const newData = {
    "email": `${randomName()}@gmail.com`,
    "password": "your mom"
  }
  const updateResult = await updateUser( authToken, currentUser.id, newData );
  expect( updateResult.status ).toBe( 200 );

  const expectedUser = currentUser;
  expectedUser.email = newData.email;
  expect( updateResult.body ).toMatchObject( expectedUser );
});

// test( "invalid user update", async () => {

// });

function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

function randomName() {
    return Math.random().toString(36).substring(2, 12);
}

/**
 * Logs in a provided user.
 * @param {*} user The valid user object to log in
 * @returns The response from the service.
 */
async function loginUser( user ) {
  return await request( app ).put( '/api/auth' ).send( user );
}

/**
 * Extracts the auth token from the service response
 * @param {*} response 
 * @returns 
 */
function getTokenFromResponse( response ) {
  return response.body.token;
}

/**
 * Logs out the user with the provided auth token.
 * @param {*} authToken 
 * @returns The response from the service.
 */
async function logoutUser( authToken ) {
  return await request( app ).delete( "/api/auth" ).set( "Authorization", `Bearer ${authToken}` ).send();
}

async function updateUser( authToken, userId, userUpdates ) {
  return await request( app ).put( `/api/auth/${userId}` ).set( "Authorization", `Bearer ${authToken}`).send( userUpdates );
}