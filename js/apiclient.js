/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview
 * Shared JavaScript client for the Santa Tracker API.
 */

goog.provide('SantaService');

/**
 * Creates a new Santa service object.
 *
 * @param {string} clientId
 * @param {string} lang
 * @param {string} version
 * @constructor
 * @export
 */
SantaService = function SantaService(clientId, lang, version) {
  /** @const @private {string} */
  this.lang_ = lang;

  /** @const @private {string} */
  this.version_ = version;

  /**
   * The user's (optional) location on the Earth, from geo-ip.
   * @private {?LatLng}
   */
  this.userLocation_ = null;

  /**
   * A number between 0 and 1, consistent within a user session. Sent to the
   * server to determine a consistent time offset for this client.
   *
   * @const @private {number}
   */
  this.jitterRand_ = Math.random();

  /**
   * @const @private {string}
   */
  this.clientId_ = clientId;

  /**
   * @private {number}
   */
  this.offset_ = 0;

  /**
   * @private {boolean}
   */
  this.offline_ = false;

  /**
   * @private {boolean}
   */
  this.killed_ = false;

  /**
   * Active sync promise.
   * @private {Promise<undefined>}
   */
  this.activeSync_ = null;

  /**
   * Santa's next stop. Used to determine whether to trigger the "next stop"
   * card.
   * @private {SantaLocation}
   */
  this.nextStop_ = null;

  /**
   * The next sync timeout.
   * @private {number}
   */
  this.syncTimeout_ = 0;

  /**
   * An extra offset determined by a URL parameter ("timestamp_override")
   *
   * @private {number|undefined}
   */
  this.debugOffset_;

  if (window['DEV']) {
    let overrideParam = getUrlParameter('timestamp_override');
    if (overrideParam) {
      if (overrideParam[overrideParam.length - 1] == '/') {
        overrideParam = overrideParam.slice(0, -1);
      }
      this.debugOffset_ = overrideParam - new Date();
    }
  }

  // perform initial sync and further syncs on 'online' event
  window.addEventListener('online', () => {
    this.sync();
  });
  Promise.resolve(true).then(() => this.sync());
};

/**
 * @param {string} eventName
 * @param {function()} handler
 * @export
 */
SantaService.prototype.addListener = function(eventName, handler) {
  return Events.addListener(this, eventName, handler);
};

/**
 * @param {string} eventName
 * @param {function()} handler
 * @return {boolean} whether removed successfully
 * @export
 */
SantaService.prototype.removeListener = function(eventName, handler) {
  return Events.removeListener(this, eventName, handler);
};

/**
 * @param {function(SantaState)} callback
 * @export
 */
SantaService.prototype.getCurrentLocation = function(callback) {
  callback(/** @type {SantaState} */ ({
    position: {lat: 0, lng: 0},
    presentsDelivered: 0,
    distanceTravelled: 0,
    heading: 0,
    prev: null,
    stopover: null,
    next: {lat: 0, lng: 10},
  }));
};

/**
 * List of destinations, sorted chronologically (latest destinations last).
 *
 * @return {Array<!SantaLocation>} a list of destinations, or null if the
 * service isn't ready.
 * @export
 */
SantaService.prototype.getDestinations = function() {
  return null;
};

/**
 * @return {?LatLng} the user's location
 * @export
 */
SantaService.prototype.getUserLocation = function() {
  return this.userLocation_;
};

/**
 * @return {boolean} whether we're likely inside the EU
 * @export
 */
SantaService.prototype.getUserInEurope = function() {
  const loc = this.getUserLocation();
  if (!loc) {
    return true;  // can't be too sure
  }
  return !(loc.lng > 39.869 || loc.lng < -31.266 || loc.lat > 81.008 || loc.lat < 27.636);
};

/**
 * Returns the expected arrival time of Santa. This is not transformed by any offset.
 * @return {number} the expected arrival time of Santa, or zero if unknown
 * @export
 */
SantaService.prototype.getArrivalTime = function() {
  return 0;
};

/**
 * @return {!Array<!StreamCard>}
 * @export
 */
SantaService.prototype.getStream = function() {
  return [];
};

/**
 * Synchronize info with the server. This function returns immediately, the
 * synchronization is performed asynchronously.
 *
 * @export
 * @return {!Promise<undefined>}
 */
SantaService.prototype.sync = function() {
  if (this.activeSync_) {
    return this.activeSync_;
  }

  const data = {
    'rand': this.jitterRand_,
    'client': this.clientId_,
    'language': this.lang_,
  };
  const p = santaAPIRequest('info', data);
  this.activeSync_ = p.then(() => null);

  p.then((result) => {
    let ok = true;
    if (result['status'] !== 'OK') {
      console.error('api', result['status']);
      this.kill_();
      ok = false;
    }

    this.offset_ = result['now'] + result['timeOffset'] - new Date();
    if (result['switchOff']) {
      this.kill_();
      ok = false;  // not technically offline, but let's pretend
    }

    if (result['upgradeToVersion'] && this.version_) {
      if (this.version_ < result['upgradeToVersion']) {
        console.warn('reload: this', this.version_, 'upgrade to', result['upgradeToVersion']);
        Events.trigger(this, 'reload');
      }
    }

    if (ok) {
      this.reconnect_();
    }

    this.userLocation_ = parseLatLng(/** @type {string} */ (result['location']));
    this.scheduleSync_(/** @type {number} */ (result['refresh']), false);

    // trigger event in microtask
    Promise.resolve(true).then(() => Events.trigger(this, 'sync'));
  });

  p.catch(() => {
    this.scheduleSync_(0, true);
    this.disconnect_();
  }).then(() => {
    // always clear activeSync_
    this.activeSync_ = null;
  });

  return this.activeSync_;
};

/**
 * Schedules another sync, clearing any previous pending sync.
 *
 * @param {number} after how long to wait before sync (zero or -ve uses default)
 * @param {boolean} foreground whether to wait for Santa to be in the foreground (rAF)
 */
SantaService.prototype.scheduleSync_ = function(after, foreground) {
  if (!after || !isFinite(after) || after <= 0) {
    after = (1000 * 60 * (Math.random() + 0.5));
  }

  const localTimeout = window.setTimeout(() => {
    if (foreground) {
      // only sync when we go back into the foreground
      return window.requestAnimationFrame(() => {
        if (localTimeout === this.syncTimeout_) {
          this.sync();
        }
      });
    }
    this.sync();
  }, after);

  window.clearTimeout(this.syncTimeout_);
  this.syncTimeout_ = localTimeout; 
};

/**
 * Send the kill event, if not already killed.
 *
 * @private
 */
SantaService.prototype.kill_ = function() {
  if (!this.killed_) {
    this.killed_ = true;
    Events.trigger(this, 'kill');
  }
};

/**
 * Send the offline event, if not alreay offline.
 *
 * @private
 */
SantaService.prototype.disconnect_ = function() {
  if (!this.offline_) {
    this.offline_ = true;
    Events.trigger(this, 'offline');
  }
};

/**
 * Send the online event, if not already online.
 *
 * @private
 */
SantaService.prototype.reconnect_ = function() {
  if (this.offline_) {
    this.offline_ = false;
    Events.trigger(this, 'online');
  }
};

/**
 * @return {number}
 * @export
 */
SantaService.prototype.now = function() {
  return +new Date() + (this.debugOffset_ || this.offset_ || 0);
};

/**
 * @return {!Date}
 * @export
 */
SantaService.prototype.dateNow = function() {
  return new Date(this.now());
};

/**
 * @return {boolean} true if the service is offline.
 * @export
 */
SantaService.prototype.isOffline = function() {
  return this.offline_;
};
