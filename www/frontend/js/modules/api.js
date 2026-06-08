/**
 * api.js — Centralised HTTP helper for all backend communication.
 * Every request goes through /backend/request-handler.php
 * with a JSON body containing an "action" key.
 */

const API_ENDPOINT = '/backend/request-handler.php';

/**
 * Send a POST request to the backend handler.
 *
 * @param {string}  action  — the action name the PHP router expects
 * @param {Object}  [payload={}] — additional key/value pairs merged into the body
 * @param {RequestInit} [options={}] — extra fetch options (overrides)
 * @returns {Promise<Object>} parsed JSON response
 * @throws {Error} on network failure or non-OK status
 */
export async function apiPost(controller, action, payload = {}, options = {}) {
    const body = { ...payload };
    let url = API_ENDPOINT;

    const queryString = new URLSearchParams({controller, action}).toString();
    url += `?${queryString}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...options
    });

    let returnVal = await response.json(); // Add json result to return value
    returnVal['response'] = response; // Add response to return value (for http status codes)

    return returnVal;
}

/**
 * Send a GET request with optional query parameters.
 */
export async function apiGet(params = {}) {
  // 1. Build the URL with parameters if they exist
  let url = API_ENDPOINT;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  // 2. Make the request
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  /*if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }*/

  let returnVal = await response.json(); // Add json result to return value
  returnVal['response'] = response; // Add response to return value (for http status codes)

  return returnVal;
}
