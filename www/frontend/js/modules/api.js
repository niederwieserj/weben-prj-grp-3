/**
 * api.js — Centralised HTTP helper for all backend communication.
 * Every request goes through /backend/controllers/request_handler.php
 * with a JSON body containing an "action" key.
 */

const API_ENDPOINT = '/backend/controllers/request_handler.php';

/**
 * Send a POST request to the backend handler.
 *
 * @param {string}  action  — the action name the PHP router expects
 * @param {Object}  [payload={}] — additional key/value pairs merged into the body
 * @param {RequestInit} [options={}] — extra fetch options (overrides)
 * @returns {Promise<Object>} parsed JSON response
 * @throws {Error} on network failure or non-OK status
 */
export async function apiPost(action, payload = {}, options = {}) {
    const body = { action, ...payload };

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Send a GET request with optional query parameters.
 */
export async function apiGet(endpoint, options = {}, params = {}) {
  // 1. Build the URL with parameters if they exist
  let url = endpoint;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  // 2. Make the request
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
