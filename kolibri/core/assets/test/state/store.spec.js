import Vue from 'vue';
import { AttemptLogResource } from 'kolibri.resources';
import * as redirectBrowser from 'kolibri.utils.redirectBrowser';
import client from 'kolibri.client';
import * as constants from '../../src/constants';
import ConditionalPromise from '../../src/conditionalPromise';
import { coreStoreFactory as makeStore } from '../../src/state/store';
import { stubWindowLocation } from 'testUtils'; // eslint-disable-line

jest.mock('kolibri.urls');
jest.mock('kolibri.client');

describe('Vuex store/actions for core module', () => {
  describe('error handling', () => {
    const errorMessage = 'testError';
    Vue.prototype.$formatMessage = () => errorMessage;
    it('handleError action updates core state', () => {
      const store = makeStore();
      store.dispatch('handleError', 'catastrophic failure');
      expect(store.state.core.error).toEqual('catastrophic failure');
      expect(store.state.core.loading).toBeFalsy();
    });

    it('handleApiError action updates core state', () => {
      const store = makeStore();
      const apiError = { message: 'Too Bad' };
      try {
        store.dispatch('handleApiError', apiError);
      } catch (e) {
        expect(e.message).toBe(apiError.message);
      }
      expect(store.state.core.error.match(/Too Bad/)).toHaveLength(1);
      expect(store.state.core.loading).toBeFalsy();
    });
  });

  describe('kolibriLogin', () => {
    stubWindowLocation(beforeAll, afterAll);

    let store;
    let redirectStub;

    beforeEach(() => {
      store = makeStore();
      redirectStub = jest.spyOn(redirectBrowser, 'redirectBrowser');
    });

    afterEach(() => {
      redirectStub.mockRestore();
    });

    it('successful login', async () => {
      client.__setPayload({
        // just sending subset of sessionPayload
        id: '123',
        username: 'e_fermi',
        kind: ['cool-guy-user'],
      });

      await store.dispatch('kolibriLogin', {});
      expect(redirectStub).toHaveBeenCalled();
    });

    it('failed login (401)', async () => {
      client.mockImplementation(() => {
        return Promise.reject({
          response: {
            data: [
              {
                id: constants.LoginErrors.INVALID_CREDENTIALS,
              },
            ],
            status: 401,
          },
        });
      });

      const error = await store.dispatch('kolibriLogin', {});
      expect(error).toEqual(constants.LoginErrors.INVALID_CREDENTIALS);
    });
  });
});

describe('Vuex core logging actions', () => {
  describe('attempt log saving', () => {
    it('saveAndStoreAttemptLog does not overwrite state if item id has changed', async () => {
      const store = makeStore();
      store.dispatch('createAttemptLog', 'first');
      let externalResolve;
      const firstState = Object.assign({}, store.state.core.logging.attempt);
      const findModelStub = jest.spyOn(AttemptLogResource, 'findModel');
      findModelStub.mockReturnValue({
        save: () =>
          new ConditionalPromise(resolve => {
            externalResolve = resolve;
          }),
      });
      const promise = store.dispatch('saveAndStoreAttemptLog');
      store.dispatch('createAttemptLog', 'second');
      store.state.core.logging.attempt.id = 'assertion';
      externalResolve(firstState);
      await promise;
      expect(store.state.core.logging.attempt.id).toEqual('assertion');
      expect(store.state.core.logging.attempt.item).toEqual('second');
    });
  });
});
