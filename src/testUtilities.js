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

async function getAllFranchises() {
  return await request( app ).get( "/api/franchise" ).send();
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
  const token = getTokenFromResponse( await loginUser( adminUser ) );
  const result = await request( app ).post( "/api/franchise" ).set( "Authorization", `Bearer ${token}`).send( franchise );
  await logoutUser( token );
  return result;
}

async function insertRandomFranchise() {
  const franchise = createRandomFranchiseObject();
  const response = await insertFranchise( franchise );
  return response.body;
}

async function deleteFranchise( authToken, franchiseId ) {
  return await request( app ).delete( `/api/franchise/${franchiseId}` ).set( "Authorization", `Bearer ${authToken}`);
}

async function removeFranchise( franchiseId ) {
  const token = getTokenFromResponse( await loginUser( adminUser ) );
  const deleteResponse = deleteFranchise( token, franchiseId );
  await logoutUser( token );
  return deleteResponse.body;
}

async function createStore( authToken, franchiseId, newStore ) {
  return await request( app ).post( `/api/franchise/${franchiseId}/store` ).set( "Authorization", `Bearer ${authToken}` ).send( newStore );
}

async function deleteStore( authToken, franchiseId, storeId ) {
  return await request( app ).delete( `/api/franchise/${franchiseId}/store/${storeId}` ).set( "Authorization", `Bearer ${authToken}` ).send();
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
  removeFranchise,
  deleteFranchise,
  getAllFranchises,
  createStore,
  deleteStore
}