/* drive.js — Google Drive backup integration for BrokeCore */
/* 
  Requires a Google Cloud OAuth2 Client ID.
  Steps to get one (free, 3 mins):
  1. Go to https://console.cloud.google.com/
  2. Create a project (or select existing)
  3. APIs & Services → Enable APIs → enable "Google Drive API"
  4. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
  5. Application type: Web application
  6. Authorized JavaScript origins: add your GitHub Pages URL
     e.g. https://naviidhandapani.github.io
  7. Copy the Client ID and paste it below
*/
const DRIVE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FOLDER_NAME = 'BrokeCore Backups';

const DriveBackup = {
  _token: null,
  _tokenExpiry: 0,

  // Check if we have a valid token
  isAuthorized() {
    return this._token && Date.now() < this._tokenExpiry;
  },

  // Load saved token from localStorage
  loadSavedToken() {
    try {
      const saved = JSON.parse(localStorage.getItem('bc_drive_token') || 'null');
      if (saved && Date.now() < saved.expiry) {
        this._token = saved.token;
        this._tokenExpiry = saved.expiry;
        return true;
      }
    } catch(e) {}
    return false;
  },

  // Save token to localStorage
  saveToken(token, expiresIn) {
    this._token = token;
    this._tokenExpiry = Date.now() + (expiresIn - 60) * 1000; // 60s buffer
    localStorage.setItem('bc_drive_token', JSON.stringify({
      token: this._token,
      expiry: this._tokenExpiry
    }));
  },

  // Sign in and get access token
  authorize() {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Sign-In not loaded. Check your internet connection.'));
        return;
      }
      if (DRIVE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
        reject(new Error('NO_CLIENT_ID'));
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: DRIVE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          this.saveToken(response.access_token, parseInt(response.expires_in));
          resolve(response.access_token);
        },
      });

      if (this.loadSavedToken()) {
        resolve(this._token);
      } else {
        client.requestAccessToken();
      }
    });
  },

  // Find or create the BrokeCore Backups folder
  async getOrCreateFolder(token) {
    // Search for existing folder
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create new folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    const folder = await createRes.json();
    return folder.id;
  },

  // Upload backup JSON to Drive
  async uploadBackup(token, folderId) {
    const data = Store.exportData();
    const filename = `brokecore-backup-${todayISO()}.json`;
    const blob = new Blob([data], { type: 'application/json' });

    // Use multipart upload
    const boundary = '-------brokecore_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close = `\r\n--${boundary}--`;

    const metadata = JSON.stringify({
      name: filename,
      parents: [folderId],
      mimeType: 'application/json',
    });

    const multipartBody = [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metadata,
      delimiter,
      'Content-Type: application/json\r\n\r\n',
      data,
      close,
    ].join('');

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartBody,
      }
    );

    return await res.json();
  },

  // Main entry point — call this from the UI
  async backup(statusCallback) {
    try {
      statusCallback('signing-in');

      let token;
      try {
        token = await this.authorize();
      } catch (err) {
        if (err.message === 'NO_CLIENT_ID') {
          statusCallback('no-client-id');
          return;
        }
        throw err;
      }

      statusCallback('uploading');
      const folderId = await this.getOrCreateFolder(token);
      const file = await this.uploadBackup(token, folderId);

      if (file.id) {
        statusCallback('success', file.name);
        // Update last backup time
        localStorage.setItem('bc_drive_last_backup', new Date().toISOString());
      } else {
        statusCallback('error', 'Upload failed');
      }
    } catch (err) {
      console.error('Drive backup error:', err);
      statusCallback('error', err.message);
    }
  },

  getLastBackupTime() {
    const t = localStorage.getItem('bc_drive_last_backup');
    if (!t) return null;
    return new Date(t);
  },
};
