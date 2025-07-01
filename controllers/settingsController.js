const Setting = require('../models/setting');

exports.showSettingsForm = (req, res) => {
    Setting.findByKey('site_name', (err, setting) => {
        if (err) {
            req.flash('error_msg', 'Could not load settings.');
            return res.redirect('/');
        }
        res.render('settings/edit', { title: 'Application Settings', siteName: setting.value });
    });
};

exports.updateSettings = (req, res) => {
    const { site_name } = req.body;
    Setting.update('site_name', site_name, (err) => {
        if (err) {
            req.flash('error_msg', 'Could not update settings.');
        } else {
            req.flash('success_msg', 'Settings updated successfully.');
        }
        res.redirect('/settings');
    });
};