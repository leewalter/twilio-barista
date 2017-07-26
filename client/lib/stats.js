import * as EventEmitter from 'event-emitter';
import TwilioClient from './sync-client';
import { SYNC_NAMES } from '../../shared/consts';
import * as uniqBy from 'lodash.uniqby';

let instance;

export default class StatsService /* extends EventEmitter */ {
  static shared() {
    instance = instance || new StatsService();
    return instance;
  }

  constructor() {
    this.stats = undefined;
    this.allOrdersList = undefined;
  }

  getStats() {
    if (this.stats) {
      return Promise.resolve(this.stats);
    }
    return this.fetchStats();
  }

  init() {
    return TwilioClient.shared()
      .init()
      .then(client => {
        return client.list(SYNC_NAMES.ALL_ORDERS);
      })
      .then(list => {
        this.allOrdersList = list;
        this.addEventListeners();
        return this.fetchStats();
      });
  }

  updateStats({ value }) {
    if (this.stats) {
      this.stats.totalOrders++;
      this.stats.product[value.product] =
        (this.stats.product[value.product] || 0) + 1;
      this.stats.source[value.source] =
        (this.stats.source[value.source] || 0) + 1;
      this.stats.countryCode[value.countryCode] =
        (this.stats.countryCode[value.countryCode] || 0) + 1;
    }
  }

  addEventListeners() {
    this.allOrdersList.on('itemAdded', item => {
      this.updateStats(item);
      this.emit('updated', { stats: this.stats });
    });
  }

  fetchStats() {
    return fetch('/api/stats')
      .then(resp => {
        if (!resp.ok) {
          throw new Error(resp.body);
        }
        return resp.json();
      })
      .then(stats => {
        this.stats = stats;
        return this.stats;
      });
  }
}

EventEmitter(StatsService.prototype);
