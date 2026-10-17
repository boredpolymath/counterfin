import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '', reload: () => {} },
    print: () => {},
  };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    body: { appendChild: () => {} },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({
      tagName: 'DIV',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      append: () => {},
      addEventListener: () => {},
      querySelector: () => ({ addEventListener: () => {} }),
      setAttribute: () => {},
    }),
    createRange: () => ({
      createContextualFragment: () => ({}),
    }),
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => { delete store[k]; }); }
  };
}

import { getStorageItem, setStorageItem, removeStorageItem } from '../js/utils/storage.js';
import { setSafeViewContent } from '../js/utils/dom.js';
import { showToast } from '../js/components/toast.js';
import { 
  DEFAULT_USER_PROFILE, 
  loadUserProfileFromStorage, 
  formatUserProfile, 
  saveUserProfileToStorage, 
  updateSidebarProfileUI 
} from '../js/state/user-profile.js';
import { 
  initBackendData, 
  syncBackendCases, 
  syncBackendInteractions, 
  subscribeBackendEvents 
} from '../js/state/backend-sync.js';
import {
  handleDashboardClick,
  handleDashboardNavActions,
  handleDashboardCardToggle,
  handleInteractionsClick,
  handleEvidenceClick,
  handleCreditClick,
  handleLettersClick
} from '../js/components/event-handlers.js';

test('Storage Utilities: safely stores, retrieves, and removes keys', () => {
  setStorageItem('test_key', 'test_val');
  assert.strictEqual(getStorageItem('test_key'), 'test_val');
  removeStorageItem('test_key');
  assert.strictEqual(getStorageItem('test_key'), null);
});

test('DOM Utilities: setSafeViewContent safely executes without throwing', () => {
  assert.doesNotThrow(() => {
    setSafeViewContent(null, '<p>test</p>');
    const fakeContainer = {
      replaceChildren: () => {},
    };
    setSafeViewContent(fakeContainer, '<div>Safe Content</div>');
  });
});

test('Toast Component: showToast creates notifications safely in headless DOM', () => {
  assert.doesNotThrow(() => {
    showToast('Test Title', 'Test Message', 'success');
    showToast('Warning Title', 'Warning Message', 'info');
  });
});

test('UserProfile Module: handles formatting, loading defaults, and saving', () => {
  const formattedEmpty = formatUserProfile({ name: '', state: 'CA' });
  assert.strictEqual(formattedEmpty.name, 'Consumer Advocate');
  assert.strictEqual(formattedEmpty.initials, 'CA');

  const formattedTwoWords = formatUserProfile({ name: 'John Doe', state: 'TX' });
  assert.strictEqual(formattedTwoWords.name, 'John Doe');
  assert.strictEqual(formattedTwoWords.initials, 'JD');
  assert.strictEqual(formattedTwoWords.shortName, 'John');

  const saved = saveUserProfileToStorage('test_profile_slot', { name: 'Jane Smith', state: 'FL' });
  assert.strictEqual(saved.initials, 'JS');

  const loaded = loadUserProfileFromStorage('test_profile_slot');
  assert.strictEqual(loaded.name, 'Jane Smith');

  assert.doesNotThrow(() => {
    updateSidebarProfileUI(loaded);
  });
});

test('Backend Sync Module: executes sync methods safely without unhandled rejections', async () => {
  const mockApp = {
    isDemoMode: false,
    cases: [],
    interactions: [],
    activeCaseId: null,
    expandedCaseIds: new Set(),
    render: () => {},
    loadDemoData: async () => {},
    getActiveCase: () => null,
  };

  assert.doesNotThrow(async () => {
    await initBackendData(mockApp);
    await syncBackendCases(mockApp);
    await syncBackendInteractions(mockApp);
    await subscribeBackendEvents(mockApp);
  });
});

test('Event Handlers Module: correctly dispatches actions and card toggles', () => {
  let modalOpened = false;
  let activeCaseChanged = false;
  const mockApp = {
    openNewDisputeModal: () => { modalOpened = true; },
    openUserProfileModal: () => {},
    loadDemoData: () => {},
    clearAllData: () => {},
    openLegalDisclaimer: () => {},
    switchView: () => {},
    renderCurrentView: () => {},
    getFilteredCases: () => [{ id: 'case_1' }, { id: 'case_2' }],
    expandedCaseIds: new Set(),
    activeCaseId: null,
    modalController: {
      openQuickLogModal: () => {},
      openIngestEvidenceModal: () => {},
    },
    getActiveCase: () => ({ id: 'case_1' }),
    showToast: () => {},
  };

  const navEvent = {
    target: {
      closest: (sel) => sel.includes('#firstRunNewDisputeBtn') ? {} : null
    }
  };
  const handled = handleDashboardNavActions(mockApp, navEvent);
  assert.strictEqual(handled, true);
  assert.strictEqual(modalOpened, true);

  const toggleEvent = {
    target: {
      closest: (sel) => sel.includes('#toggleAllDossiersBtn') ? {} : null
    }
  };
  handleDashboardCardToggle(mockApp, toggleEvent);
  assert.strictEqual(mockApp.expandedCaseIds.size, 2);

  assert.doesNotThrow(() => {
    handleDashboardClick(mockApp, navEvent);
    handleInteractionsClick(mockApp, { target: { closest: () => null } });
    handleEvidenceClick(mockApp, { target: { closest: () => null } });
    handleCreditClick(mockApp, { target: { closest: () => null } });
    handleLettersClick(mockApp, { target: { closest: () => null } });
  });
});
