const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

beforeAll(async () => {
  testUser.email = randomName() + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test( "valid register", async () => {
  const fakeUser = { name: "fake user", email: "fake@test.com", password: "b" };
  const registerResponse = (await request( app ).post( "/api/auth" ).send( fakeUser )).body;

  expectValidJwt( registerResponse.token );
  delete registerResponse.token;

  expect( registerResponse.user.id ).toBeGreaterThanOrEqual( 1 );
  delete registerResponse.user.id;

  expect( registerResponse ).toMatchObject( { user: { name: fakeUser.name, email: fakeUser.email, roles: [{ role: "diner" }] } } );
  
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

// test( "invalid login", async () => {

// });

test( "valid logout", async () => {
  const loginResult = await loginUser( "/api/auth" );
  let authToken = loginResult.body.token;

  const logoutResult = await request( app ).delete( '/api/auth' ).set("Authorization", `Bearer ${authToken}`).send();
  expect( logoutResult.status ).toBe( 200 );
  expect( logoutResult.body ).toMatchObject( { message: 'logout successful' } );
});

// test( "invalid logout", async () => {

// });

// test( "valid user update", async () => {

// });

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
  return await request( app ).put( '/api/auth' ).send( testUser );
}

/**
 * Logs out the user with the provided auth token.
 * @param {*} authToken 
 * @returns The response from the service.
 */
async function logoutUser( authToken ) {
  return await request( app ).delete( "/api/auth" ).set( "Authorization", `Bearer ${authToken}` ).send();
}