const utils = require( '../testUtilities' )
const app = utils.app;
const request = utils.request;

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;


if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

beforeAll(async () => {
  testUser.email = utils.randomName() + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = utils.getTokenFromResponse( registerRes );
  testUser.id = registerRes.body.user.id;
  utils.expectValidJwt(testUserAuthToken);
});

test( "valid register", async () => {
  const fakeUser = { name: "fake user", email: `${utils.randomName()}@test.com`, password: "b" };
  const registerResponse = (await request( app ).post( "/api/auth" ).send( fakeUser ));

  expect( registerResponse.status ).toBe( 200 );

  let responseBody = registerResponse.body;

  utils.expectValidJwt( responseBody.token );
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
  utils.expectValidJwt(loginRes.body.token);

  const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;
  expect(loginRes.body.user).toMatchObject(expectedUser);

  await utils.logoutUser( loginRes.body.token );
});

test( "invalid login", async () => {
  const badUser = { name: testUser.name, email: `${testUser.email}`, password: `test${testUser.password}` };
  const loginResult = await utils.loginUser( badUser );
  expect( loginResult.status ).toBe( 404 );
  expect( loginResult.body.message ).toBe( "unknown user" );
});

test( "valid logout", async () => {
  const loginResult = await utils.loginUser( testUser );
  let authToken = loginResult.body.token;

  const logoutResult = await utils.logoutUser( authToken );
  expect( logoutResult.status ).toBe( 200 );
  expect( logoutResult.body ).toMatchObject( { message: 'logout successful' } );
});

test( "invalid auth", async () => {
  const loginResult = await utils.loginUser( testUser );
  const authToken = utils.getTokenFromResponse( loginResult );

  let badAuthToken = `test${authToken}`
  const logoutResult = await utils.logoutUser( badAuthToken );
  expect( logoutResult.status ).toBe( 401 );
  expect( logoutResult.body.message ).toBe( "unauthorized");

  await utils.logoutUser( authToken )
});

test( "valid user update", async () => {
  const loginResult = await utils.loginUser( testUser );
  let authToken = utils.getTokenFromResponse( loginResult );
  const currentUser = loginResult.body.user;

  const newData = {
    "email": `${utils.randomName()}@gmail.com`,
    "password": "your mom"
  }
  const updateResult = await utils.updateUser( authToken, currentUser.id, newData );
  expect( updateResult.status ).toBe( 200 );

  const expectedUser = currentUser;
  expectedUser.email = newData.email;
  expect( updateResult.body ).toMatchObject( expectedUser );
  utils.logoutUser( authToken );
});

// test( "invalid user update", async () => {

// });