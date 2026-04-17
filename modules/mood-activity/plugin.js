const { withAndroidManifest, withInfoPlist, withXcodeProject } = require('@expo/config-plugins');

function withMoodActivityAndroid(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    // Add service declaration
    if (!app.service) app.service = [];
    const serviceExists = app.service.some(
      (s) => s.$?.['android:name'] === 'expo.modules.moodactivity.MoodForegroundService'
    );
    if (!serviceExists) {
      app.service.push({
        $: {
          'android:name': 'expo.modules.moodactivity.MoodForegroundService',
          'android:foregroundServiceType': 'dataSync',
          'android:exported': 'false',
        },
      });
    }

    // Add permissions
    const permissions = manifest.manifest['uses-permission'] || [];
    const neededPermissions = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
      'android.permission.POST_NOTIFICATIONS',
    ];
    for (const perm of neededPermissions) {
      if (!permissions.some((p) => p.$?.['android:name'] === perm)) {
        permissions.push({ $: { 'android:name': perm } });
      }
    }
    manifest.manifest['uses-permission'] = permissions;

    return config;
  });
}

function withMoodActivityIos(config) {
  return withInfoPlist(config, (config) => {
    config.modResults['NSSupportsLiveActivities'] = true;
    config.modResults['NSSupportsLiveActivitiesFrequentUpdates'] = true;
    return config;
  });
}

module.exports = (config) => {
  config = withMoodActivityAndroid(config);
  config = withMoodActivityIos(config);
  return config;
};
