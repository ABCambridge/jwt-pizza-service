const request = require('supertest');
const app = require('./service');

const adminUser = {
  email: "a@jwt.com",
  password: "admin"
}

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

function createRandomFranchiseObject() {
  const franchise = {
      name: randomName(),
      admins: [{
          email: adminUser.email
      },]
  }
  return franchise;
}

async function insertFranchise( franchise ) {
  const loginResponse = await loginUser( adminUser );
  const token = getTokenFromResponse( loginResponse );
  return await request( app ).post( "/api/franchise" ).set( "Authorization", `Bearer ${token}`).send( franchise );
}

async function insertRandomFranchise() {
  const franchise = createRandomFranchiseObject();
  await insertFranchise( franchise );
  return franchise;
}

async function removeFranchise( franchise ) {
  throw "Not Implemented!!";
}

module.exports = {
  app,
  request,
  adminUser,
  expectValidJwt,
  randomName,
  loginUser,
  getTokenFromResponse,
  logoutUser,
  updateUser,
  createRandomFranchiseObject,
  insertFranchise,
  insertRandomFranchise,
  removeFranchise
}